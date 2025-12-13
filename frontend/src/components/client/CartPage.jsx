import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import cartItemApi from '../../api/cartItemApi'; // Import API mới

// Hàm format tiền tệ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const CartPage = () => {
    const navigate = useNavigate();
    
    const [cartItems, setCartItems] = useState([]); // Danh sách sản phẩm
    const [cartSummary, setCartSummary] = useState({ total_amount: 0, total_items: 0 }); // Tổng tiền
    
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // --- 1. Lấy dữ liệu ---
    const fetchCart = async () => {
        try {
            const res = await cartItemApi.getMyCart();
            // Backend trả về: { data: [], cart_summary: {} }
            setCartItems(res.data || []);
            setCartSummary(res.cart_summary || { total_amount: 0, total_items: 0 });
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // --- 2. Xử lý tăng/giảm số lượng ---
    const handleQuantityChange = async (cartItemId, currentQty, change) => {
        const newQuantity = currentQty + change;
        if (newQuantity < 1) return; 

        try {
            setUpdating(true);
            // Gọi API update với ID của CartItem
            await cartItemApi.update(cartItemId, newQuantity);
            
            // Reload lại dữ liệu để lấy tổng tiền mới nhất từ server (do backend tự tính)
            await fetchCart(); 
        } catch (error) {
            toast.error("Lỗi cập nhật số lượng");
        } finally {
            setUpdating(false);
        }
    };

    // --- 3. Xóa sản phẩm ---
    const handleRemoveItem = async (cartItemId) => {
        if (!window.confirm("Bạn muốn bỏ sản phẩm này?")) return;
        
        try {
            await cartItemApi.remove(cartItemId);
            toast.success("Đã xóa sản phẩm");
            await fetchCart(); // Reload lại danh sách
        } catch (error) {
            toast.error("Lỗi xóa sản phẩm");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // --- GIAO DIỆN GIỎ HÀNG TRỐNG ---
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={40} className="text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống trơn</h2>
                    <p className="text-gray-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
                    <Link to="/shop" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition font-medium w-full">
                        <ArrowLeft size={18} /> Quay lại mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <ShoppingBag /> Giỏ hàng của bạn 
                    <span className="text-lg font-normal text-gray-500">({cartSummary.total_items} sản phẩm)</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* CỘT TRÁI: LIST ITEMS */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            {/* Header bảng Desktop */}
                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-semibold text-gray-600 border-b">
                                <div className="col-span-6">Sản phẩm</div>
                                <div className="col-span-2 text-center">Đơn giá</div>
                                <div className="col-span-2 text-center">Số lượng</div>
                                <div className="col-span-2 text-right">Thành tiền</div>
                            </div>

                            {/* Danh sách Item */}
                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-4">
                                        
                                        {/* Thông tin sản phẩm */}
                                        <div className="col-span-6 flex items-center gap-4">
                                            <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg border overflow-hidden">
                                                {/* item.product_id đã được populate từ controller */}
                                                <img 
                                                    src={item.product_id?.image || item.product_id?.image_url} 
                                                    alt={item.product_id?.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800 line-clamp-1">
                                                    {item.product_id?.name || "Sản phẩm không xác định"}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Mã: #{item.product_id?.slug}
                                                </p>
                                                <button 
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    className="text-red-500 text-sm mt-2 flex items-center gap-1 hover:underline md:hidden"
                                                >
                                                    <Trash2 size={14} /> Xóa
                                                </button>
                                            </div>
                                        </div>

                                        {/* Giá tại thời điểm thêm vào giỏ */}
                                        <div className="col-span-2 text-center hidden md:block text-gray-600">
                                            {formatCurrency(item.price_at_time)}
                                        </div>

                                        {/* Nút tăng giảm */}
                                        <div className="col-span-2 flex justify-center">
                                            <div className="flex items-center border border-gray-300 rounded-lg">
                                                <button 
                                                    disabled={updating || item.quantity <= 1}
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                                                    className="p-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                <button 
                                                    disabled={updating}
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                                                    className="p-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tổng tiền của Item (Backend đã tính sẵn total_price) */}
                                        <div className="col-span-2 text-right flex flex-col items-end justify-center gap-2">
                                            <span className="font-bold text-blue-600">
                                                {formatCurrency(item.total_price)}
                                            </span>
                                            <button 
                                                onClick={() => handleRemoveItem(item._id)}
                                                className="hidden md:flex text-gray-400 hover:text-red-500 transition"
                                                title="Xóa sản phẩm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            <Link to="/shop" className="text-blue-600 font-medium hover:underline flex items-center gap-2">
                                <ArrowLeft size={18} /> Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>

                    {/* CỘT PHẢI: TỔNG KẾT */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Đơn hàng</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    {/* Sử dụng cartSummary lấy từ Cart cha */}
                                    <span>{formatCurrency(cartSummary.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Vận chuyển</span>
                                    <span className="text-green-600 font-medium">Miễn phí</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Tổng thanh toán</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        {formatCurrency(cartSummary.total_amount)}
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
                            >
                                Thanh toán ngay <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;