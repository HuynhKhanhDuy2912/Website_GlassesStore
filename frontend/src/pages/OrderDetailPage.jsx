import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Loader, MapPin, CreditCard, ChevronLeft, Package, Calendar, 
    RefreshCw, XCircle, Star, MessageSquare
} from 'lucide-react';

//HÀM XỬ LÝ ẢNH ĐỒNG BỘ
const getImageUrl = (path) => {
    if (!path) return null;
    if (typeof path === 'object') path = path.url || path[0]?.url || path[0];
    if (typeof path !== 'string') return null;
    if (path.startsWith("http")) return path;
    
    let cleanPath = path.replace(/\\/g, "/");
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
    if (!cleanPath.startsWith("/uploads")) cleanPath = "/uploads" + cleanPath;
    
    return `http://localhost:5000${cleanPath}`;
};

const OrderDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingItem, setProcessingItem] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const isAdmin = JSON.parse(localStorage.getItem("USER_INFO") || "{}")?.role === 'admin';

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem("ACCESS_TOKEN");
            try {
                const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(res.data);
            } catch (err) {
                console.error("Lỗi tải đơn hàng:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleCancelOrder = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) return;
        setCancelling(true);
        try {
            const token = localStorage.getItem("ACCESS_TOKEN");
            const res = await axios.put(`http://localhost:5000/api/orders/${id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrder(res.data.order);
            alert("Đã hủy đơn hàng thành công!");
        } catch (err) {
            alert(err.response?.data?.message || "Lỗi khi hủy");
        } finally {
            setCancelling(false);
        }
    };

    const handleBuyAgain = async (item) => {
        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) return navigate("/login");
        setProcessingItem(item.product?._id || item.product);
        try {
            await axios.post('http://localhost:5000/api/cart/add', {
                productId: item.product?._id || item.product, qty: 1
            }, { headers: { Authorization: `Bearer ${token}` } });
            window.dispatchEvent(new Event("CART_UPDATED"));
            navigate("/cart");
        } catch (err) {
            alert("Sản phẩm không khả dụng.", err);
        } finally {
            setProcessingItem(null);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-500 w-10 h-10" /></div>;
    if (!order) return <div className="text-center py-20 text-gray-500">Không tìm thấy đơn hàng</div>;

    const statusConfig = {
        pending: { label: 'ĐANG XỬ LÝ', color: 'bg-yellow-100 text-yellow-800' },
        confirmed: { label: 'ĐÃ XÁC NHẬN', color: 'bg-blue-100 text-blue-800' },
        delivered: { label: 'ĐANG GIAO HÀNG', color: 'bg-indigo-100 text-indigo-800' },
        completed: { label: 'HOÀN THÀNH', color: 'bg-green-100 text-green-700' },
        cancelled: { label: 'ĐÃ HỦY', color: 'bg-red-100 text-red-700' },
    };
    
    const currentStatus = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100' };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen font-sans">
            <Link to={isAdmin ? "/admin/orders" : "/my-orders"} className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-medium transition-colors">
                <ChevronLeft size={20} /> Quay lại
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-blue-50/50 p-6 border-b border-blue-100 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="text-blue-600" /> Đơn hàng #{order._id.slice(-6).toUpperCase()}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <Calendar size={14}/> Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest ${currentStatus.color}`}>
                        {currentStatus.label}
                    </div>
                </div>

                <div className="p-6 grid lg:grid-cols-3 gap-8">
                    {/* Thông tin giao hàng & thanh toán */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3 text-xs uppercase">
                                <MapPin size={16} className="text-blue-600"/> Địa chỉ nhận hàng
                            </h3>
                            <div className="text-sm space-y-2">
                                <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
                                <p>SĐT: {order.shippingAddress?.phone}</p>
                                <p className="text-gray-600">{order.shippingAddress?.addressLine}, {order.shippingAddress?.city}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-3 text-xs uppercase">
                                <CreditCard size={16} className="text-blue-600"/> Thanh toán
                            </h3>
                            <p className="text-sm font-medium">{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Thanh toán qua thẻ'}</p>
                        </div>
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="lg:col-span-2">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Sản phẩm ({order.items?.length})</h3>
                        <div className="space-y-4">
                            {order.items?.map((item, idx) => {
                                //  Đường dẫn đến chi tiết sản phẩm
                                const productSlug = item.product?.slug || item.product?._id || item.product;
                                const productLink = `/san-pham/${productSlug}`;
                                
                                const imageToDisplay = item.image || (item.product?.images && item.product.images[0]?.url) || (item.product?.images && item.product.images[0]);

                                return (
                                    <div key={idx} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl items-center shadow-sm hover:shadow-md transition-shadow">
                                        {/* Click vào ảnh để xem chi tiết */}
                                        <Link to={productLink} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 block">
                                            <img 
                                                src={getImageUrl(imageToDisplay) || 'https://placehold.co/150?text=No+Image'} 
                                                alt={item.name} 
                                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                onError={(e) => { e.target.src = 'https://placehold.co/150?text=No+Image'; }}
                                            />
                                        </Link>

                                        <div className="flex-grow">
                                            {/* Click vào tên để xem chi tiết */}
                                            <Link to={productLink} className="font-bold text-gray-800 hover:text-blue-600 transition-colors line-clamp-1">
                                                {item.name}
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-1 font-medium">Số lượng: {item.qty}</p>
                                            <p className="font-bold text-blue-600 mt-1">{item.price?.toLocaleString()}đ</p>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {/* Nút Đánh giá: Chỉ hiện khi đơn hàng đã HOÀN THÀNH */}
                                            {order.status === 'completed' && (
                                                <Link 
                                                    to={`${productLink}#reviews`} 
                                                    className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                                                >
                                                    <Star size={14} fill="currentColor" /> Đánh giá
                                                </Link>
                                            )}

                                            {/* Nút xem lại sản phẩm (Mua lại) */}
                                            <button 
                                                onClick={() => handleBuyAgain(item)} 
                                                disabled={processingItem === (item.product?._id || item.product)} 
                                                className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
                                                title="Thêm lại vào giỏ hàng"
                                            >
                                                <RefreshCw size={14} className={processingItem === (item.product?._id || item.product) ? "animate-spin" : ""} />
                                                Mua lại
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Tổng chi phí */}
                        <div className="mt-8 bg-blue-50/20 p-6 rounded-xl border border-blue-100 space-y-3">
                            <div className="flex justify-between text-gray-600 text-sm font-medium">
                                <span>Tạm tính</span>
                                <span>{order.itemsPrice?.toLocaleString()}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-600 text-sm font-medium">
                                <span>Phí vận chuyển (Mặc định)</span>
                                <span className="font-medium text-gray-800">{order.shippingPrice?.toLocaleString()}đ</span>
                            </div>
                            <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                                <span className="font-bold text-gray-800 text-lg">Tổng cộng thanh toán</span>
                                <span className="text-2xl font-bold text-blue-600">{order.totalPrice?.toLocaleString()}đ</span>
                            </div>
                        </div>

                        {/* Nút hủy đơn hàng */}
                        {order.status === 'pending' && !isAdmin && (
                            <button 
                                onClick={handleCancelOrder} 
                                disabled={cancelling} 
                                className="w-full mt-6 py-3 border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                {cancelling ? <Loader size={20} className="animate-spin" /> : <XCircle size={20} />}
                                Yêu cầu hủy đơn hàng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;