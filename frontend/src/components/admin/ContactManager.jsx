import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, Trash2, Search, User, 
    Mail, Calendar, Send, CheckCircle, X, Clock,
    MoreHorizontal, Phone
} from 'lucide-react';
import { toast } from 'react-toastify';
import contactApi from '../../api/contactApi';

// Hàm format ngày giờ chi tiết
const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // --- STATE CHO CHAT MODAL ---
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    
    // Ref để tự động cuộn xuống cuối đoạn chat
    const messagesEndRef = useRef(null);

    // 1. Fetch dữ liệu
    const fetchContacts = async () => {
        try {
            const res = await contactApi.getAll();
            setContacts(res.data || []);
        } catch (error) {
            toast.error("Không thể tải danh sách liên hệ");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // Scroll xuống cuối mỗi khi tin nhắn thay đổi
    useEffect(() => {
        if (isChatOpen && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedContact?.conversation, isChatOpen]);

    // 2. Mở cửa sổ Chat
    const handleOpenChat = (contact) => {
        setSelectedContact(contact);
        setIsChatOpen(true);
        setReplyText('');
    };

    // 3. Gửi tin nhắn (Chat tiếp)
    const handleSendChat = async () => {
        if (!replyText.trim()) return;

        try {
            setSending(true);
            // Gọi API chat (Backend sẽ tự nhận diện sender là 'admin' dựa vào token)
            const res = await contactApi.chat(selectedContact._id, replyText);
            
            // Cập nhật lại UI ngay lập tức
            const updatedContact = res.data;
            
            // 1. Cập nhật trong Modal đang mở
            setSelectedContact(updatedContact);
            
            // 2. Cập nhật trong danh sách bên ngoài
            setContacts(prev => prev.map(item => 
                item._id === updatedContact._id ? updatedContact : item
            ));

            setReplyText('');
        } catch (error) {
            toast.error("Gửi tin nhắn thất bại");
        } finally {
            setSending(false);
        }
    };

    // 4. Xóa liên hệ
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa hội thoại này? Hành động này không thể hoàn tác.")) {
            try {
                await contactApi.delete(id);
                toast.success("Đã xóa hội thoại");
                setContacts(contacts.filter(item => item._id !== id));
                if (isChatOpen && selectedContact?._id === id) {
                    setIsChatOpen(false);
                }
            } catch (error) {
                toast.error("Lỗi khi xóa");
            }
        }
    };

    // 5. Tìm kiếm
    const filteredContacts = contacts.filter(contact => {
        const name = contact.user_id?.fullname?.toLowerCase() || '';
        const email = contact.user_id?.email?.toLowerCase() || '';
        const subject = contact.subject?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search) || subject.includes(search);
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" /> Trung tâm Hỗ trợ
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Quản lý và phản hồi tin nhắn khách hàng</p>
                </div>
                <div className="relative w-full md:w-96">
                    <input 
                        type="text"
                        placeholder="Tìm theo tên, email, chủ đề..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            {/* --- DANH SÁCH CONTACT (TABLE) --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">Khách hàng</th>
                                <th className="px-6 py-4">Chủ đề</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Cập nhật cuối</th>
                                <th className="px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredContacts.map((contact) => (
                                <tr key={contact._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden">
                                                {contact.user_id?.avatar ? <img src={contact.user_id.avatar} className="w-full h-full object-cover"/> : <User size={18}/>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{contact.user_id?.fullname || "Ẩn danh"}</p>
                                                <p className="text-xs text-gray-500">{contact.user_id?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-800 font-medium truncate max-w-[200px]">{contact.subject || "Không có chủ đề"}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {contact.conversation?.length || 0} tin nhắn
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            contact.status === 'new' ? 'bg-red-50 text-red-600 border-red-100' :
                                            contact.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-green-50 text-green-600 border-green-100'
                                        }`}>
                                            {contact.status === 'new' ? 'Mới' : contact.status === 'processing' ? 'Đang xử lý' : 'Đã xong'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDateTime(contact.updatedAt)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleOpenChat(contact)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
                                                title="Chat ngay"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(contact._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- CHAT WINDOW (MODAL) --- */}
            {isChatOpen && selectedContact && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        
                        {/* 1. Header Modal */}
                        <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                    {selectedContact.user_id?.avatar ? 
                                        <img src={selectedContact.user_id.avatar} className="w-full h-full object-cover"/> : 
                                        <User size={20} className="text-blue-600"/>
                                    }
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{selectedContact.user_id?.fullname}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Mail size={10}/> {selectedContact.user_id?.email}</span>
                                        {selectedContact.user_id?.phone_number && (
                                            <span className="flex items-center gap-1 border-l pl-2 border-gray-300"><Phone size={10}/> {selectedContact.user_id?.phone_number}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                                <X size={24} />
                            </button>
                        </div>

                        {/* 2. Body Chat (Nội dung hội thoại) */}
                        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                            {/* Tiêu đề cuộc hội thoại */}
                            <div className="text-center my-2">
                                <span className="text-xs bg-gray-200 text-gray-500 px-3 py-1 rounded-full">
                                    Chủ đề: {selectedContact.subject}
                                </span>
                            </div>

                            {/* Render tin nhắn */}
                            {selectedContact.conversation?.map((msg, index) => {
                                // ADMIN LÀ "TÔI" -> Bên phải
                                const isMe = msg.sender === 'admin'; 
                                return (
                                    <div key={index} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                                isMe 
                                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                            }`}>
                                                {msg.message}
                                            </div>
                                            <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                {isMe ? 'Admin • ' : 'Khách • '} 
                                                {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* 3. Footer Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition">
                                    <textarea 
                                        rows="1"
                                        className="w-full bg-transparent border-none outline-none text-sm resize-none max-h-32"
                                        placeholder="Nhập tin nhắn trả lời..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendChat();
                                            }
                                        }}
                                        style={{ minHeight: '24px' }}
                                    />
                                </div>
                                <button 
                                    onClick={handleSendChat}
                                    disabled={sending || !replyText.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md flex items-center justify-center"
                                >
                                    {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Send size={20} />}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Nhấn Enter để gửi, Shift + Enter để xuống dòng
                            </p>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactManager;