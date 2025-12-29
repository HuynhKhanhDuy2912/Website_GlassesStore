import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import orderApi from '../../api/orderApi';

// 1. Hàm format tiền tệ (An toàn, không bị NaN)
const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
};

// 2. Hàm helper xử lý link ảnh (Quan trọng)
const getProductImage = (product) => {
    // Nếu sản phẩm bị xóa (null) -> Trả về ảnh mặc định
    if (!product) return "/placeholder.png";
    
    // Ưu tiên lấy image_url, nếu không có thì lấy image
    const img = product.image_url || product.image;
    
    // Nếu cả 2 đều rỗng hoặc null -> Trả về ảnh mặc định
    if (!img || img === "") return "/placeholder.png";

    // Nếu link ảnh là đường dẫn tương đối (không có http), bạn có thể cần nối domain server vào đây
    // Ví dụ: return `http://localhost:5000${img}`;
    // Nếu dữ liệu đã là link full (Cloudinary/Firebase) thì return luôn
    return img;
};

const ClientOrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await orderApi.getDetail(id);
                // Backend trả về: { data: { order: {...}, items: [...] } }
                setOrder(res.data.order);
                setItems(res.data.items);
            } catch (error) {
                console.error("Lỗi tải đơn hàng:", error);
                toast.error("Không tìm thấy đơn hàng hoặc bạn không có quyền xem");
                navigate('/my-orders');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );
    
    if (!order) return null;

    // Helper: Màu sắc trạng thái đơn hàng
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'processing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200'; // pending
        }
    };

    // Logic hiển thị tiêu đề (Tên sản phẩm đầu tiên + số lượng còn lại)
    const firstItemName = items.length > 0 && items[0].product_id 
        ? items[0].product_id.product_name 
        : "Sản phẩm";
        
    const orderTitle = items.length > 0 
        ? `${firstItemName} ${items.length > 1 ? `(+${items.length - 1} món khác)` : ''}`
        : `Đơn hàng #${order._id.slice(-6).toUpperCase()}`;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-sans">
            <Link to="/my-orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition font-medium">
                <ArrowLeft size={18} /> Quay lại lịch sử đơn hàng
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* --- PHẦN HEADER --- */}
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h1 className="text-xl font-bold text-gray-800 line-clamp-1 max-w-lg" title={orderTitle}>
                                {orderTitle}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize whitespace-nowrap ${getStatusColor(order.order_status)}`}>
                                {order.order_status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar size={14} /> Mã đơn: #{order._id.slice(-6).toUpperCase()} • Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                </div>

                {/* --- PHẦN THÔNG TIN --- */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100">
                    {/* Cột Trái: Địa chỉ */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-blue-600"/> Địa chỉ nhận hàng
                        </h3>
                        <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-3 text-sm text-gray-700 shadow-sm">
                            <p className="flex items-center gap-3">
                                <User size={16} className="text-gray-400" />
                                <span className="font-semibold">{order.shipping_address_id?.recipient || order.user_id?.fullname}</span>
                            </p>
                            <p className="flex items-center gap-3">
                                <Phone size={16} className="text-gray-400" />
                                <span>{order.shipping_address_id?.phone}</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <MapPin size={16} className="text-gray-400 mt-0.5" />
                                <span className="leading-relaxed">
                                    {order.shipping_address_id?.address_line}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Cột Phải: Tổng tiền (Đã fix lỗi NaN) */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Tổng quan thanh toán</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span>{formatCurrency(order.shipping_fee)}</span>
                            </div>
                            {Number(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá:</span>
                                    <span>-{formatCurrency(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-3 mt-2 flex justify-between text-lg font-bold text-blue-600">
                                <span>Tổng cộng:</span>
                                <span>{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- DANH SÁCH SẢN PHẨM --- */}
                <div className="bg-white">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide px-6 pt-6 pb-2">Chi tiết sản phẩm</h3>
                    <div className="p-6 space-y-0">
                        {items.map((item, index) => {
                            // 1. Lấy thông tin sản phẩm (có thể bị null nếu đã xóa)
                            const product = item.product_id;
                            
                            // 2. Xác định tên và ảnh hiển thị
                            const productName = product ? product.product_name : "Sản phẩm đã ngừng kinh doanh";
                            const imageUrl = getProductImage(product);

                            // 3. Tính toán tiền (Phòng trường hợp backend thiếu subtotal)
                            const qty = Number(item.quantity) || 0;
                            const price = Number(item.unit_price) || 0;
                            const itemTotal = Number(item.subtotal) || (qty * price);

                            return (
                                <div key={item._id || index} className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition px-2 -mx-2 rounded-lg">
                                    
                                    {/* Khung ảnh */}
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg border overflow-hidden shrink-0 flex items-center justify-center relative">
                                        {product ? (
                                            <img 
                                                src={imageUrl} 
                                                alt={productName} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = "/placeholder.png"; // Fallback nếu ảnh lỗi
                                                }}
                                            />
                                        ) : (
                                            <AlertTriangle size={24} className="text-gray-400" />
                                        )}
                                    </div>

                                    {/* Tên & Đơn giá */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-medium line-clamp-2 ${product ? 'text-gray-800' : 'text-red-500 italic'}`} title={productName}>
                                            {productName}
                                        </h4>
                                        
                                        <p className="text-sm text-gray-500 mt-1">
                                            Đơn giá: {formatCurrency(price)}
                                        </p>
                                    </div>

                                    {/* Số lượng & Thành tiền */}
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-600 mb-1">x{qty}</p>
                                        <p className="font-bold text-blue-600">
                                            {formatCurrency(itemTotal)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClientOrderDetailPage;