import { useNavigate } from 'react-router-dom'; // <--- Thêm dòng này
import React, { useState, useEffect } from "react";
import {
    Eye, Search, Filter, Calendar, DollarSign,
    CheckCircle, XCircle, Clock, Truck, Package
} from "lucide-react";
import { toast } from "react-toastify";
import orderApi from "../../api/orderApi";


// Hàm format tiền
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm format ngày giờ
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
};

const OrderManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState(""); 
    const navigate = useNavigate();

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null); // Thông tin đơn hàng (Info)
    const [orderItems, setOrderItems] = useState([]); // Danh sách sản phẩm trong đơn

    // --- 1. Fetch Orders ---
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus) params.status = filterStatus;

            const res = await orderApi.getAll(params);
            setOrders(res.data || []);
        } catch (error) {
            toast.error("Lỗi tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [filterStatus]); // Gọi lại khi đổi tab filter

    // --- 2. Xem chi tiết đơn ---
    const handleViewDetail = async (orderId) => {
        navigate(`/admin/order/${orderId}`);
    };

    // --- 3. Cập nhật trạng thái ---
    const handleUpdateStatus = async (newStatus) => {
        if (!selectedOrder) return;
        try {
            await orderApi.updateStatus(selectedOrder._id, newStatus);
            toast.success(`Đã cập nhật trạng thái: ${newStatus}`);

            // Cập nhật lại UI ngay lập tức
            setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
            fetchOrders(); // Reload lại bảng bên ngoài
        } catch (error) {
            toast.error("Lỗi cập nhật trạng thái");
        }
    };

    // Helper: Màu sắc cho trạng thái
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Helper: Icon cho trạng thái
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'processing': return <Truck size={16} />;
            case 'completed': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return null;
        }
    };

    // Helper: Dịch trạng thái sang tiếng Việt
    const getStatusText = (status) => {
        const map = {
            'pending': 'Chờ xử lý',
            'processing': 'Đang giao',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return map[status] || status;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng</h1>
                    <p className="text-gray-500 text-sm mt-1">Theo dõi và xử lý các đơn đặt hàng</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                {['', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${filterStatus === status
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        {status === '' ? 'Tất cả' : getStatusText(status)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-4 border-b">Mã đơn</th>
                                <th className="p-4 border-b">Khách hàng</th>
                                <th className="p-4 border-b">Ngày đặt</th>
                                <th className="p-4 border-b">Tổng tiền</th>
                                <th className="p-4 border-b text-center">Trạng thái</th>
                                <th className="p-4 border-b text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-sm text-blue-600 font-medium">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{order.user_id?.fullname || "Guest"}</div>
                                            <div className="text-xs text-gray-500">{order.user_id?.email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {formatDate(order.createdAt)}
                                            </div>
                                        </td>
                                        <td className="p-4 font-semibold text-gray-900">
                                            {formatCurrency(order.total_amount)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                                                {getStatusIcon(order.order_status)}
                                                {getStatusText(order.order_status)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleViewDetail(order._id)}
                                                className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg transition"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-500">
                                        <Package size={48} className="mx-auto mb-3 text-gray-300" />
                                        Chưa có đơn hàng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL CHI TIẾT */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">
                                    Chi tiết đơn hàng #{selectedOrder._id.slice(-6).toUpperCase()}
                                </h2>
                                <p className="text-sm text-gray-500">Ngày đặt: {formatDate(selectedOrder.createdAt)}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-6 flex-1 space-y-6">
                            {/* Grid thông tin */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Cột Trái: Thông tin người nhận */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-1">Thông tin giao hàng</h3>
                                    <div className="text-sm space-y-2 text-gray-700">
                                        <p><span className="font-semibold">Người nhận:</span> {selectedOrder.user_id?.fullname}</p>
                                        <p><span className="font-semibold">Email:</span> {selectedOrder.user_id?.email}</p>
                                        {/* Nếu đã populate shipping_address_id thì hiển thị ở đây */}
                                        <p className="flex items-start gap-2">
                                            <span className="font-semibold shrink-0">Địa chỉ:</span>
                                            {selectedOrder.shipping_address_id ? (
                                                <span>
                                                    {selectedOrder.shipping_address_id.address}, {selectedOrder.shipping_address_id.ward}, {selectedOrder.shipping_address_id.district}, {selectedOrder.shipping_address_id.city} <br />
                                                    (SĐT: {selectedOrder.shipping_address_id.phone})
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic">Không có thông tin địa chỉ</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Cột Phải: Trạng thái & Thanh toán */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-1">Xử lý đơn hàng</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold mb-2 text-gray-700">Cập nhật trạng thái:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedOrder.order_status === 'pending' && (
                                                    <button onClick={() => handleUpdateStatus('processing')} className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">Duyệt đơn</button>
                                                )}
                                                {selectedOrder.order_status === 'processing' && (
                                                    <button onClick={() => handleUpdateStatus('completed')} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs hover:bg-green-700">Giao thành công</button>
                                                )}
                                                {selectedOrder.order_status !== 'cancelled' && selectedOrder.order_status !== 'completed' && (
                                                    <button onClick={() => handleUpdateStatus('cancelled')} className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs hover:bg-red-100 border border-red-200">Hủy đơn</button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2 italic">
                                                Trạng thái hiện tại: <span className="font-semibold">{getStatusText(selectedOrder.order_status)}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Danh sách sản phẩm */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-1 mb-3">Sản phẩm đã đặt</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-600 font-semibold">
                                            <tr>
                                                <th className="p-3">Sản phẩm</th>
                                                <th className="p-3 text-center">Số lượng</th>
                                                <th className="p-3 text-right">Đơn giá</th>
                                                <th className="p-3 text-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {orderItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded border bg-gray-50 overflow-hidden shrink-0">
                                                                {/* Kiểm tra product_id có tồn tại không phòng trường hợp bị xóa */}
                                                                <img
                                                                    src={item.product_id?.image || item.product_id?.image_url || "/placeholder.png"}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <span className="font-medium text-gray-800 line-clamp-1">
                                                                {item.product_id?.name || item.product_id?.product_name || "Sản phẩm đã bị xóa"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center text-gray-600">x{item.quantity}</td>
                                                    <td className="p-3 text-right text-gray-600">{formatCurrency(item.price)}</td>
                                                    <td className="p-3 text-right font-medium text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Tổng kết tiền */}
                            <div className="flex justify-end">
                                <div className="w-full md:w-1/2 space-y-2 text-right">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Tạm tính:</span>
                                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Phí vận chuyển:</span>
                                        <span>{formatCurrency(selectedOrder.shipping_fee)}</span>
                                    </div>
                                    {selectedOrder.discount_amount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Giảm giá:</span>
                                            <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold text-blue-600 border-t pt-2 mt-2">
                                        <span>Tổng cộng:</span>
                                        <span>{formatCurrency(selectedOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;