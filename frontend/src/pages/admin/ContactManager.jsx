import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    MessageSquare, Search, Trash2, Send, User, ShieldCheck, 
    Mail, Phone, Loader, Image as ImageIcon, X, CheckCircle, AlertCircle
} from 'lucide-react';

const ContactManager = () => {
    // === STATE ===
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // State Ảnh
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Filter & Search
    const [filterStatus, setFilterStatus] = useState('all'); 
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem("ACCESS_TOKEN");
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // === HELPER ===
    const getDisplayName = (user) => {
        if (!user) return "Khách ẩn danh";
        return user.fullname || user.email || "Khách hàng";
    };

    const getAvatarLabel = (user) => {
        const name = getDisplayName(user);
        return name.charAt(0).toUpperCase();
    };

    // ✅ HÀM XỬ LÝ ẢNH ĐÃ SỬA LỖI
    const getImageUrl = (path) => {
        // 1. Nếu không có ảnh -> Trả về ảnh placeholder mới
        if (!path) return 'https://placehold.co/300x200?text=No+Image';
        
        // 2. Nếu là link online (http) -> Trả về nguyên gốc
        if (path.startsWith('http')) return path;

        // 3. Nếu là ảnh upload -> Nối thêm domain server
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `http://localhost:5000${cleanPath}`;
    };

    // === EFFECT ===
    useEffect(() => { fetchContacts(); }, []);

    useEffect(() => {
        let result = contacts;
        if (filterStatus === 'unread') {
            result = result.filter(c => c.isReadByAdmin === false);
        } else if (filterStatus === 'read') {
            result = result.filter(c => c.isReadByAdmin === true);
        }
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(c => 
                c.subject?.toLowerCase().includes(lower) ||
                c.user_id?.fullname?.toLowerCase().includes(lower) ||
                c.user_id?.email?.toLowerCase().includes(lower)
            );
        }
        setFilteredContacts(result);
    }, [contacts, filterStatus, searchTerm]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [selectedTicket?.conversation, selectedTicket]);

    // === API ===
    const fetchContacts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/contacts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContacts(res.data.data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    const handleSelectTicket = async (ticket) => {
        setSelectedTicket(ticket);
        if (ticket.isReadByAdmin === false) {
            try {
                await axios.put(`http://localhost:5000/api/contacts/${ticket._id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const updatedContacts = contacts.map(c => 
                    c._id === ticket._id ? { ...c, isReadByAdmin: true } : c
                );
                setContacts(updatedContacts);
            } catch (error) { console.error(error); }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) return alert("File quá lớn (Max 5MB)");
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if ((!replyMessage.trim() && !selectedFile) || !selectedTicket) return;

        setSending(true);
        const formData = new FormData();
        formData.append('message', replyMessage);
        if (selectedFile) formData.append('image', selectedFile);

        try {
            const res = await axios.put(`http://localhost:5000/api/contacts/${selectedTicket._id}/chat`, 
                formData,
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }}
            );
            const updatedTicket = res.data.data;
            setSelectedTicket(updatedTicket);
            const updatedList = contacts.map(c => c._id === updatedTicket._id ? updatedTicket : c);
            setContacts(updatedList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
            setReplyMessage('');
            clearSelectedFile();
        } catch (error) { alert("Lỗi gửi tin nhắn"); } 
        finally { setSending(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xóa cuộc hội thoại này?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/contacts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newList = contacts.filter(c => c._id !== id);
            setContacts(newList);
            if (selectedTicket?._id === id) setSelectedTicket(null);
        } catch (error) { alert("Lỗi xóa"); }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader className="animate-spin text-pink-600"/></div>;

    return (
        <div className="bg-gray-100 min-h-screen p-6 font-sans">
            <div className="max-w-7xl mx-auto h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden flex border border-gray-200">
                
                {/* --- CỘT TRÁI --- */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
                    <div className="p-4 border-b border-gray-100 space-y-3">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <MessageSquare className="text-pink-600"/> CSKH
                            </h2>
                            <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{filteredContacts.length}</span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                            <input type="text" className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pink-500 transition"
                                placeholder="Tìm khách hàng..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                        </div>
                        <div className="flex gap-2">
                            {[{ id: 'all', label: 'Tất cả' }, { id: 'unread', label: 'Chưa đọc' }, { id: 'read', label: 'Đã đọc' }]
                            .map(tab => (
                                <button key={tab.id} onClick={() => setFilterStatus(tab.id)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition border ${
                                        filterStatus === tab.id ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredContacts.length === 0 ? <div className="text-center py-10 text-gray-400 text-sm">Không tìm thấy tin nhắn</div> : 
                        filteredContacts.map(contact => {
                            const lastMsg = contact.conversation[contact.conversation.length - 1];
                            const isUnread = !contact.isReadByAdmin;
                            const displayName = getDisplayName(contact.user_id);

                            return (
                                <div key={contact._id} onClick={() => handleSelectTicket(contact)}
                                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition relative group ${selectedTicket?._id === contact._id ? 'bg-pink-50 hover:bg-pink-50' : ''}`}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className={`text-sm truncate max-w-[160px] ${isUnread ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{displayName}</h4>
                                        <span className={`text-[10px] ${isUnread ? 'text-pink-600 font-bold' : 'text-gray-400'}`}>{new Date(contact.updatedAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className={`text-xs truncate max-w-[85%] ${isUnread ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                                            {lastMsg?.message ? <span>{lastMsg.message}</span> : <span className="flex items-center gap-1 italic text-pink-500"><ImageIcon size={12}/> Hình ảnh</span>}
                                        </div>
                                        {isUnread && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm animate-pulse"></span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* --- CỘT PHẢI --- */}
                <div className="w-2/3 flex flex-col bg-gray-50">
                    {selectedTicket ? (
                        <>
                            <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm border border-blue-200">
                                        {getAvatarLabel(selectedTicket.user_id)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-base">{getDisplayName(selectedTicket.user_id)}</h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                            <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded"><Mail size={10}/> {selectedTicket.user_id?.email || "No Email"}</span>
                                            {selectedTicket.user_id?.phone_number && <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded"><Phone size={10}/> {selectedTicket.user_id?.phone_number}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(selectedTicket._id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={20}/></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {selectedTicket.conversation.map((msg, idx) => {
                                    const isMe = msg.sender === 'admin';
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex gap-3 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isMe ? 'bg-pink-600 text-white' : 'bg-white text-blue-600 border border-gray-200'}`}>
                                                    {isMe ? <ShieldCheck size={16}/> : <User size={16}/>}
                                                </div>
                                                <div>
                                                    <div className={`p-3 rounded-2xl text-sm shadow-sm overflow-hidden ${isMe ? 'bg-pink-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'}`}>
                                                        {msg.image && <div className="mb-2"><img src={getImageUrl(msg.image)} alt="img" className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90" onClick={() => window.open(getImageUrl(msg.image), '_blank')}/></div>}
                                                        {msg.message && <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                                                    </div>
                                                    <div className={`text-[10px] mt-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>{new Date(msg.timestamp).toLocaleString('vi-VN')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-4 bg-white border-t border-gray-200">
                                {previewUrl && (
                                    <div className="px-2 pb-2 flex"><div className="relative"><img src={previewUrl} alt="prev" className="h-16 w-auto rounded-lg border shadow-sm object-cover"/><button onClick={clearSelectedFile} className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-0.5 hover:bg-red-500"><X size={12}/></button></div></div>
                                )}
                                <form onSubmit={handleReply} className="flex gap-3 items-center">
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-full transition"><ImageIcon size={20} /></button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect}/>
                                    <input type="text" className="flex-1 p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-pink-500 transition" placeholder="Nhập phản hồi..." value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)}/>
                                    <button type="submit" disabled={sending || (!replyMessage.trim() && !selectedFile)} className="bg-pink-600 text-white p-3 rounded-xl hover:bg-pink-700 transition shadow-lg disabled:bg-gray-300">
                                        {sending ? <Loader className="animate-spin" size={20}/> : <Send size={20} />}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare size={64} className="mb-4 opacity-30"/>
                            <p>Chọn tin nhắn để trả lời</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactManager;