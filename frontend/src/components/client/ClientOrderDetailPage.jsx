import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, User, Calendar, CreditCard } from 'lucide-react';
import orderApi from '../../api/orderApi';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
                // Backend trả về { data: { order: {...}, items: [...] } }
                const res = await orderApi.getDetail(id);
                setOrder(res.data.order);
                setItems(res.data.items);
            } catch (error) {
                console.error(error);
                navigate('/my-orders');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, navigate]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
    if (!order) return null;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Link to="/my-orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition">
                <ArrowLeft size={18} /> Quay lại lịch sử đơn hàng
            </Link>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Đơn hàng #{order._id.slice(-6).toUpperCase()}</h1>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <Calendar size={14} /> Đặt ngày {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold capitalize ${
                            order.order_status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.order_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {order.order_status}
                        </span>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Địa chỉ nhận hàng</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p className="flex items-start gap-3">
                                <User size={18} className="text-blue-500 mt-0.5" />
                                <span className="font-medium text-gray-800">{order.user_id?.fullname}</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <Phone size={18} className="text-blue-500 mt-0.5" />
                                <span>{order.shipping_address_id?.phone}</span>
                            </p>
                            <p className="flex items-start gap-3">
                                <MapPin size={18} className="text-blue-500 mt-0.5" />
                                <span>
                                    {order.shipping_address_id?.address_line}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Thanh toán</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span>{formatCurrency(order.shipping_fee)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-lg font-bold text-blue-600">
                                <span>Tổng cộng:</span>
                                <span>{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide p-6 pb-0">Sản phẩm</h3>
                    <div className="p-6 space-y-4">
                        {items.map((item) => (
                            <div key={item._id} className="flex items-center gap-4 py-2 border-b last:border-0 border-gray-50">
                                <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden shrink-0">
                                    <img src={item.product_id?.image_url || "/placeholder.png"} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">{item.product_id?.product_name}</h4>
                                    <p className="text-sm text-gray-500">Đơn giá: {formatCurrency(item.unit_price)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">x{item.quantity}</p>
                                    <p className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientOrderDetailPage;