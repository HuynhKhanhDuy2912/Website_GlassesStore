import React, { useState, useEffect, useRef } from 'react';
import { 
    MapPin, Phone, Mail, Send, Clock, 
    MessageCircle, User, Bot, Plus, X, LogIn 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import contactApi from '../../api/contactApi';

const ContactPage = () => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [replyInputs, setReplyInputs] = useState({}); 
    
    // State cho việc tạo hội thoại mới
    const [isCreating, setIsCreating] = useState(false);
    const [newMessage, setNewMessage] = useState('');

    // Kiểm tra trạng thái đăng nhập
    const isLoggedIn = !!localStorage.getItem('accessToken'); 
    
    // Ref để auto scroll
    const chatContainerRefs = useRef({});

    useEffect(() => {
        if (isLoggedIn) {
            // Nếu đã đăng nhập -> Tải dữ liệu
            fetchHistory();
        } else {
            // QUAN TRỌNG: Nếu không đăng nhập (hoặc vừa logout) -> Xóa sạch dữ liệu cũ
            setHistory([]);
            setReplyInputs({});
        }
    }, [isLoggedIn]); // Chạy lại khi trạng thái login thay đổi

    const fetchHistory = async () => {
        try {
            // QUAN TRỌNG: Set rỗng trước khi gọi API để tránh hiện dữ liệu cũ trong lúc chờ
            setHistory([]); 
            
            const res = await contactApi.getMyHistory();
            setHistory(res.data || []);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
            // Nếu lỗi cũng đảm bảo data là rỗng
            setHistory([]); 
        }
    };

    // Tạo hội thoại mới
    const handleCreateNew = async () => {
        if (!newMessage.trim()) {
            toast.warning("Vui lòng nhập nội dung");
            return;
        }
        try {
            setLoading(true);
            const res = await contactApi.send({ message: newMessage });
            toast.success("Đã gửi yêu cầu mới!");
            setNewMessage('');
            setIsCreating(false);
            setHistory([res.data, ...history]); 
        } catch (error) {
            toast.error("Gửi thất bại");
        } finally {
            setLoading(false);
        }
    };

    // Chat tiếp vào hội thoại cũ
    const handleUserReply = async (contactId) => {
        const message = replyInputs[contactId];
        if (!message?.trim()) return;

        try {
            const res = await contactApi.chat(contactId, message);
            setHistory(prev => prev.map(item => item._id === contactId ? res.data : item));
            setReplyInputs(prev => ({ ...prev, [contactId]: '' }));
        } catch (error) {
            toast.error("Gửi tin thất bại");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Header Tổng */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800">Trung tâm Hỗ trợ</h1>
                    <p className="text-gray-500 mt-2">Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* --- SIDEBAR TRÁI (Thông tin) - Chiếm 4/12 --- */}
                    <div className="lg:col-span-4 space-y-6 sticky top-24">
                        {/* Card Thông tin */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 text-lg mb-6 border-b pb-2">Thông tin liên hệ</h3>
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 text-sm">Địa chỉ cửa hàng</p>
                                        <p className="text-gray-500 text-sm mt-1">123 Đường ABC, Quận 1, TP.HCM</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 text-sm">Hotline hỗ trợ</p>
                                        <p className="text-gray-500 text-sm mt-1">1900 1234 (8:00 - 22:00)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shrink-0">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-700 text-sm">Email</p>
                                        <p className="text-gray-500 text-sm mt-1">support@glasses.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- MAIN CONTENT (Chat) - Chiếm 8/12 --- */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* 1. Thanh điều hướng / Đăng nhập */}
                        {!isLoggedIn ? (
                            <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                                    <LogIn size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h2>
                                <p className="text-gray-500 mb-6">Bạn cần đăng nhập để gửi yêu cầu hỗ trợ và xem lịch sử phản hồi.</p>
                                <Link to="/login" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Toolbar tạo mới */}
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <MessageCircle className="text-blue-600" /> Hội thoại của bạn
                                    </h2>
                                    {!isCreating && (
                                        <button 
                                            onClick={() => setIsCreating(true)}
                                            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-md"
                                        >
                                            <Plus size={16} /> Tạo yêu cầu mới
                                        </button>
                                    )}
                                </div>

                                {/* Form Tạo Mới (Expandable) */}
                                {isCreating && (
                                    <div className="bg-white p-6 rounded-2xl shadow-md border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-gray-800">Bắt đầu cuộc trò chuyện mới</h3>
                                            <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-red-500">
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <textarea
                                            rows="3"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none mb-3"
                                            placeholder="Bạn đang gặp vấn đề gì? Hãy mô tả chi tiết..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                        ></textarea>
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={handleCreateNew}
                                                disabled={loading}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
                                            >
                                                {loading ? "Đang gửi..." : <><Send size={16} /> Gửi yêu cầu</>}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Danh sách Hội thoại */}
                                {history.length === 0 && !isCreating ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                                        <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500">Bạn chưa có cuộc hội thoại nào.</p>
                                        <button onClick={() => setIsCreating(true)} className="text-blue-600 font-medium hover:underline mt-2">
                                            Tạo yêu cầu hỗ trợ đầu tiên
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {history.map((item) => (
                                            <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition duration-300">
                                                
                                                {/* Header Chat */}
                                                <div className="bg-gray-50/80 backdrop-blur px-6 py-4 border-b border-gray-100 flex flex-wrap gap-2 justify-between items-center">
                                                    <div>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chủ đề</span>
                                                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1 mt-0.5">
                                                            {item.subject || "Hỗ trợ chung"}
                                                        </h3>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-gray-400 hidden sm:block">
                                                            {new Date(item.updatedAt).toLocaleString('vi-VN')}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                                                            item.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                            item.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                                                            'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {item.status === 'new' ? 'Chờ xử lý' : item.status === 'processing' ? 'Đang hỗ trợ' : 'Đã xong'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Nội dung Chat */}
                                                <div className="p-6 bg-white min-h-[150px] max-h-[400px] overflow-y-auto space-y-5 custom-scrollbar">
                                                    {item.conversation?.map((msg, index) => {
                                                        const isUser = msg.sender === 'user';
                                                        return (
                                                            <div key={index} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                                <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                    {/* Avatar */}
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1 ${
                                                                        isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'
                                                                    }`}>
                                                                        {isUser ? <User size={16}/> : <Bot size={16}/>}
                                                                    </div>

                                                                    {/* Bubble */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className={`p-3.5 text-sm leading-relaxed shadow-sm ${
                                                                            isUser 
                                                                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                                                                            : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-none'
                                                                        }`}>
                                                                            {msg.message}
                                                                        </div>
                                                                        <span className={`text-[10px] text-gray-400 ${isUser ? 'text-right' : 'text-left'}`}>
                                                                            {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Input Area */}
                                                <div className="p-4 bg-gray-50 border-t border-gray-100">
                                                    <div className="relative flex items-center gap-2">
                                                        <input 
                                                            type="text" 
                                                            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
                                                            placeholder="Nhập tin nhắn phản hồi..."
                                                            value={replyInputs[item._id] || ''}
                                                            onChange={(e) => setReplyInputs({ ...replyInputs, [item._id]: e.target.value })}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleUserReply(item._id)}
                                                        />
                                                        <button 
                                                            onClick={() => handleUserReply(item._id)}
                                                            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md active:scale-95"
                                                        >
                                                            <Send size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;