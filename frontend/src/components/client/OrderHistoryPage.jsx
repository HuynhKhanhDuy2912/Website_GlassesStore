import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, Truck, XCircle, Search, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify'; // Import toast để thông báo
import orderApi from '../../api/orderApi';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyOrders();
    }, []);

    const fetchMyOrders = async () => {
        try {
            const res = await orderApi.getMyOrders();
            setOrders(res.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý hủy đơn
    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
            try {
                await orderApi.cancelOrder(orderId);
                toast.success("Đã hủy đơn hàng thành công");
                
                // Cập nhật lại giao diện ngay lập tức (Không cần load lại trang)
                setOrders(prevOrders => prevOrders.map(order => 
                    order._id === orderId 
                    ? { ...order, order_status: 'cancelled' } 
                    : order
                ));
            } catch (error) {
                toast.error(error.response?.data?.message || "Lỗi khi hủy đơn");
            }
        }
    };

    // Hàm tạo "Tên đơn hàng" từ danh sách sản phẩm
    const getOrderName = (order) => {
        // Nếu backend chưa trả về items (do chưa update controller), fallback về Mã đơn
        if (!order.items || order.items.length === 0) {
            return `Đơn hàng #${order._id.slice(-6).toUpperCase()}`;
        }

        // Lấy tên các sản phẩm nối lại
        const productNames = order.items.map(item => item.product_id?.product_name).join(', ');
        
        // Nếu dài quá thì cắt bớt
        return productNames.length > 50 ? productNames.substring(0, 50) + "..." : productNames;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-medium"><Clock size={12}/> Chờ xử lý</span>;
            case 'processing':
                return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium"><Truck size={12}/> Đang giao</span>;
            case 'completed':
                return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium"><CheckCircle size={12}/> Hoàn thành</span>;
            case 'cancelled':
                return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium"><XCircle size={12}/> Đã hủy</span>;
            default:
                return status;
        }
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Đang tải lịch sử...</div>;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Package className="text-blue-600" /> Lịch sử đơn hàng
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Search size={32} />
                    </div>
                    <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào.</p>
                    <Link to="/shop" className="text-blue-600 font-medium hover:underline">
                        Bắt đầu mua sắm ngay
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition duration-200">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                
                                {/* Cột thông tin chính */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {/* IN TÊN ĐƠN HÀNG Ở ĐÂY */}
                                        <h3 className="font-bold text-gray-800 text-lg">
                                            {getOrderName(order)}
                                        </h3>
                                        {getStatusBadge(order.order_status)}
                                    </div>
                                    <div className="text-sm text-gray-500 space-y-1">
                                        <p>Mã đơn: #{order._id.slice(-6).toUpperCase()}</p>
                                        <p>Ngày đặt: {formatDate(order.createdAt)}</p>
                                    </div>
                                </div>

                                {/* Cột Giá tiền & Địa chỉ */}
                                <div className="text-left md:text-right min-w-[150px]">
                                    <p className="font-bold text-blue-600 text-lg">
                                        {formatCurrency(order.total_amount)}
                                    </p>
                                    <p className="text-xs text-gray-400 max-w-xs truncate" title={order.shipping_address_id?.address_line}>
                                        {order.shipping_address_id?.address_line || "Địa chỉ đã xóa"}
                                    </p>
                                </div>

                                {/* Cột Nút bấm */}
                                <div className="flex flex-col gap-2 items-end">
                                    <Link 
                                        to={`/my-orders/${order._id}`}
                                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition"
                                    >
                                        Xem chi tiết <ChevronRight size={16} />
                                    </Link>

                                    {/* NÚT HỦY ĐƠN (Chỉ hiện khi pending) */}
                                    {order.order_status === 'pending' && (
                                        <button 
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition border border-red-100"
                                        >
                                            <AlertTriangle size={14} /> Hủy đơn
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;