import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ChevronRight, Loader, Calendar, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem("ACCESS_TOKEN");
            if (!token) return;

            try {
                // Gọi API lấy danh sách đơn hàng
                const res = await axios.get('http://localhost:5000/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data);
            } catch (err) {
                console.error("Lỗi tải đơn hàng:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Helper: Màu sắc trạng thái
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // pending
        }
    };

    // Helper: Icon trạng thái
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            default: return <Clock size={14} />;
        }
    };

    // Helper: Dịch trạng thái
    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Đang xử lý';
            case 'completed': return 'Giao thành công';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader className="animate-spin text-pink-600 w-10 h-10" />
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50 font-sans">
            <h1 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-800">
                <Package className="text-pink-600" /> Đơn hàng của tôi
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 mb-6 text-lg">Bạn chưa có đơn hàng nào.</p>
                    <Link to="/san-pham" className="bg-pink-600 text-white px-6 py-3 rounded-full font-bold hover:bg-pink-700 transition">
                        Đi mua bánh ngay
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                {/* Cột trái: Thông tin chung */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-bold text-lg text-gray-800">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)} {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <Calendar size={14} /> 
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        <span className="mx-1">•</span>
                                        {order.items.length} sản phẩm
                                    </div>
                                </div>
                                
                                {/* Cột phải: Giá và Nút */}
                                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">Tổng tiền</div>
                                        <div className="text-pink-600 font-bold text-xl">
                                            {order.totalPrice.toLocaleString()}đ
                                        </div>
                                    </div>
                                    
                                    <Link to={`/order/${order._id}`} className="bg-gray-50 hover:bg-pink-50 text-gray-600 hover:text-pink-600 p-3 rounded-xl transition-colors">
                                        <ChevronRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;