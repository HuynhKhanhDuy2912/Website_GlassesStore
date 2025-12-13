import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Package, Trash2, Plus, Save, 
    User, MapPin, Phone, CreditCard, Calendar 
} from 'lucide-react';
import { toast } from 'react-toastify';

// Import các API
import orderApi from '../../api/orderApi';
import orderDetailApi from '../../api/orderDetailApi';
import productApi from '../../api/productApi'; // Cần để chọn sản phẩm thêm vào

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const OrderDetailPage = () => {
    const { id } = useParams(); // Lấy orderId từ URL
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);       // Thông tin đơn hàng cha
    const [details, setDetails] = useState([]);     // Danh sách sản phẩm con
    const [products, setProducts] = useState([]);   // List sản phẩm để Admin chọn thêm
    
    const [loading, setLoading] = useState(true);
    
    // State cho form thêm sản phẩm mới
    const [newItem, setNewItem] = useState({
        product_id: "",
        quantity: 1
    });
    const [adding, setAdding] = useState(false);

    // --- 1. Fetch dữ liệu ---
    const fetchData = async () => {
        try {
            // Gọi song song 3 API: Lấy Order, Lấy Details, Lấy Product List (để select)
            const [orderRes, detailRes, productRes] = await Promise.all([
                orderApi.getDetail(id),          // API này bạn đã làm ở bài trước
                orderDetailApi.getByOrderId(id), // API mới tạo
                productApi.getAll({ limit: 100 }) // Lấy list sản phẩm để admin chọn
            ]);

            // orderApi.getDetail backend trả về { data: { order, items } }
            // Nhưng ở đây ta dùng orderDetailApi riêng để quản lý items cho chuẩn RESTful
            setOrder(orderRes.data.order); 
            setDetails(detailRes.data || []);
            setProducts(productRes.data || []);

        } catch (error) {
            console.error(error);
            toast.error("Lỗi tải thông tin đơn hàng");
            navigate('/admin/orders'); // Quay về nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // --- 2. Xử lý thêm sản phẩm vào đơn ---
    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.product_id) {
            toast.warning("Vui lòng chọn sản phẩm");
            return;
        }

        try {
            setAdding(true);
            await orderDetailApi.add({
                order_id: id,
                product_id: newItem.product_id,
                quantity: newItem.quantity
            });
            toast.success("Đã thêm sản phẩm");
            
            // Reset form và load lại dữ liệu
            setNewItem({ product_id: "", quantity: 1 });
            fetchData(); 
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi thêm sản phẩm");
        } finally {
            setAdding(false);
        }
    };

    // --- 3. Xử lý xóa sản phẩm khỏi đơn ---
    const handleDeleteItem = async (detailId) => {
        if (!window.confirm("Xóa sản phẩm này khỏi đơn hàng?")) return;

        try {
            await orderDetailApi.remove(detailId);
            toast.success("Đã xóa sản phẩm");
            fetchData();
        } catch (error) {
            toast.error("Lỗi xóa sản phẩm");
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải chi tiết đơn hàng...</div>;
    if (!order) return <div className="p-8 text-center">Không tìm thấy đơn hàng</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header: Nút Back & Tiêu đề */}
            <div className="flex items-center gap-4 mb-6">
                <Link to="/admin/orders" className="p-2 bg-white border rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Đơn hàng #{order._id.slice(-6).toUpperCase()}
                        <span className={`text-sm font-normal px-3 py-1 rounded-full border ${
                            order.order_status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                            order.order_status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                            {order.order_status}
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500">Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM (Chiếm 2 phần) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Bảng sản phẩm */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <Package size={18} /> Chi tiết sản phẩm
                            </h2>
                            <span className="text-sm text-gray-500">{details.length} món</span>
                        </div>
                        
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white text-gray-500 border-b">
                                <tr>
                                    <th className="p-4 font-medium">Sản phẩm</th>
                                    <th className="p-4 font-medium text-center">SL</th>
                                    <th className="p-4 font-medium text-right">Đơn giá</th>
                                    <th className="p-4 font-medium text-right">Thành tiền</th>
                                    <th className="p-4 font-medium text-center">Xóa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {details.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={item.product_id?.image_url || "/placeholder.png"} 
                                                    alt="" 
                                                    className="w-10 h-10 rounded border object-cover" 
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800 line-clamp-1">
                                                        {item.product_id?.product_name || "Sản phẩm đã xóa"}
                                                    </p>
                                                    <p className="text-xs text-gray-400">#{item.product_id?.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">{item.quantity}</td>
                                        <td className="p-4 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                                        <td className="p-4 text-right font-medium text-gray-900">{formatCurrency(item.subtotal)}</td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDeleteItem(item._id)}
                                                className="text-gray-400 hover:text-red-600 transition"
                                                title="Xóa món này"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Form thêm sản phẩm (Chỉ hiện nếu đơn chưa hoàn thành/hủy) */}
                    {order.order_status !== 'cancelled' && order.order_status !== 'completed' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-blue-600" /> Thêm sản phẩm vào đơn
                            </h3>
                            <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <select 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100"
                                        value={newItem.product_id}
                                        onChange={(e) => setNewItem({...newItem, product_id: e.target.value})}
                                    >
                                        <option value="">-- Chọn sản phẩm --</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.product_name} - {formatCurrency(p.price)} (Kho: {p.quantity})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <input 
                                        type="number" 
                                        min="1" 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 text-center"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={adding}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                                >
                                    {adding ? "Đang thêm..." : "Thêm ngay"}
                                </button>
                            </form>
                            <p className="text-xs text-orange-500 mt-2 italic">
                                * Lưu ý: Việc thêm/xóa sản phẩm sẽ ảnh hưởng đến tổng tiền của đơn hàng.
                            </p>
                        </div>
                    )}
                </div>

                {/* CỘT PHẢI: THÔNG TIN KHÁCH & THANH TOÁN (Chiếm 1 phần) */}
                <div className="space-y-6">
                    
                    {/* Thông tin khách hàng */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin khách hàng</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-start gap-3">
                                <User size={16} className="mt-0.5 text-blue-500" />
                                <div>
                                    <p className="font-medium text-gray-900">{order.user_id?.fullname || "Guest"}</p>
                                    <p className="text-xs">{order.user_id?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin size={16} className="mt-0.5 text-blue-500" />
                                <div>
                                    {order.shipping_address_id ? (
                                        <>
                                            <p>{order.shipping_address_id.address}</p>
                                            <p>{order.shipping_address_id.ward}, {order.shipping_address_id.district}</p>
                                            <p>{order.shipping_address_id.city}</p>
                                        </>
                                    ) : (
                                        <p className="italic text-gray-400">Không có địa chỉ</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-blue-500" />
                                <p>{order.shipping_address_id?.phone || "---"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tổng tiền */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <CreditCard size={18} /> Thanh toán
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Tiền hàng:</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Vận chuyển:</span>
                                <span>{formatCurrency(order.shipping_fee)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Giảm giá:</span>
                                    <span>-{formatCurrency(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold text-blue-600">
                                <span>Tổng cộng:</span>
                                <span>{formatCurrency(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;