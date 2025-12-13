import React, { useState, useEffect } from 'react';
import { 
    Star, Trash2, Search, MessageSquare, 
    Eye, EyeOff, User, Box 
} from 'lucide-react';
import { toast } from 'react-toastify';
import reviewApi from '../../api/reviewApi'; 

// Hàm format ngày
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

// Component hiển thị số sao
const StarRating = ({ rating }) => {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                    key={star} 
                    size={14} 
                    className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
            ))}
        </div>
    );
};

const ReviewManager = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'Show', 'Hidden'

    // 1. Fetch dữ liệu
    const fetchReviews = async () => {
        try {
            const res = await reviewApi.getAllAdmin();
            setReviews(res.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải danh sách đánh giá");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // 2. Xử lý Ẩn/Hiện đánh giá
    const handleToggleStatus = async (review) => {
        try {
            const newStatus = review.status === 'Show' ? 'Hidden' : 'Show';
            await reviewApi.toggleStatus(review._id, newStatus);
            
            // Cập nhật state local ngay lập tức để UI mượt mà
            setReviews(prev => prev.map(item => 
                item._id === review._id ? { ...item, status: newStatus } : item
            ));

            toast.success(`Đã ${newStatus === 'Show' ? 'hiện' : 'ẩn'} đánh giá`);
        } catch (error) {
            toast.error("Lỗi cập nhật trạng thái");
        }
    };

    // 3. Xử lý Xóa
    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?")) {
            try {
                await reviewApi.delete(id);
                setReviews(prev => prev.filter(item => item._id !== id));
                toast.success("Đã xóa đánh giá");
            } catch (error) {
                toast.error("Lỗi khi xóa");
            }
        }
    };

    // 4. Logic lọc và tìm kiếm
    const filteredReviews = reviews.filter(review => {
        const content = review.comment?.toLowerCase() || '';
        const userName = review.user_id?.fullname?.toLowerCase() || '';
        const productName = review.product_id?.product_name?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();

        const matchesSearch = content.includes(search) || userName.includes(search) || productName.includes(search);
        const matchesStatus = filterStatus === 'all' || review.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center">Đang tải đánh giá...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" /> Quản lý Đánh giá
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Duyệt và quản lý phản hồi từ khách hàng</p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                    {/* Bộ lọc trạng thái */}
                    <select 
                        className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Show">Đang hiện</option>
                        <option value="Hidden">Đang ẩn</option>
                    </select>

                    {/* Thanh tìm kiếm */}
                    <div className="relative w-full md:w-64">
                        <input 
                            type="text"
                            placeholder="Tìm sản phẩm, user..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                </div>
            </div>

            {/* Bảng Dữ liệu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4 w-1/4">Sản phẩm</th>
                                <th className="px-6 py-4 w-1/5">Người dùng</th>
                                <th className="px-6 py-4">Đánh giá</th>
                                <th className="px-6 py-4 w-1/3">Nội dung</th>
                                <th className="px-6 py-4 text-center">Trạng thái</th>
                                <th className="px-6 py-4 text-center">Xóa</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReviews.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-500">
                                        Không tìm thấy đánh giá nào.
                                    </td>
                                </tr>
                            ) : (
                                filteredReviews.map((review) => (
                                    <tr key={review._id} className="hover:bg-gray-50 transition">
                                        
                                        {/* Sản phẩm */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Box size={16} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-800 line-clamp-2" title={review.product_id?.product_name}>
                                                    {review.product_id?.product_name || "Sản phẩm đã xóa"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Người dùng */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                    {review.user_id?.fullname ? review.user_id.fullname.charAt(0) : <User size={14}/>}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {review.user_id?.fullname || "User đã xóa"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{review.user_id?.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Số sao & Ngày */}
                                        <td className="px-6 py-4">
                                            <StarRating rating={review.rating} />
                                            <p className="text-xs text-gray-400 mt-1">{formatDate(review.created_at)}</p>
                                        </td>

                                        {/* Nội dung comment */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                                                "{review.comment}"
                                            </p>
                                        </td>

                                        {/* Nút Toggle Trạng thái */}
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleToggleStatus(review)}
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
                                                    review.status === 'Show' 
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                }`}
                                            >
                                                {review.status === 'Show' ? (
                                                    <><Eye size={12} /> Hiện</>
                                                ) : (
                                                    <><EyeOff size={12} /> Ẩn</>
                                                )}
                                            </button>
                                        </td>

                                        {/* Nút Xóa */}
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(review._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                                                title="Xóa đánh giá này"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="mt-4 text-right text-xs text-gray-500">
                Hiển thị {filteredReviews.length} / {reviews.length} đánh giá
            </div>
        </div>
    );
};

export default ReviewManager;