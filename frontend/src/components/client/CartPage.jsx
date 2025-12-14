import React, { useState, useEffect, useRef } from 'react'; // Nhớ import useRef
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import cartItemApi from '../../api/cartItemApi';
import { useCart } from '../../context/CartContext';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const CartPage = () => {
    const navigate = useNavigate();
    const { fetchCartCount } = useCart();
    const [cartItems, setCartItems] = useState([]); 
    const [selectedItems, setSelectedItems] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    // Không cần state 'updating' nữa vì ta update UI ngay lập tức
    
    // Ref dùng để lưu các bộ đếm thời gian (Debounce timer) cho từng sản phẩm
    const debounceTimers = useRef({}); 

    // --- 1. Lấy dữ liệu ---
    const fetchCart = async () => {
        try {
            const res = await cartItemApi.getMyCart();
            setCartItems(res.data || []);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        
        // Cleanup function: Xóa hết timer khi thoát trang để tránh lỗi memory leak
        return () => {
            Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
        };
    }, []);

    // --- 2. Xử lý tăng/giảm (KỸ THUẬT DEBOUNCE + OPTIMISTIC UI) ---
    const handleQuantityChange = (cartItemId, currentQty, change) => {
        const newQuantity = currentQty + change;
        if (newQuantity < 1) return; 

        // BƯỚC 1: Cập nhật Giao diện NGAY LẬP TỨC (Không chờ Server)
        setCartItems(prevItems => prevItems.map(item => {
            if (item._id === cartItemId) {
                // Tự tính lại tổng tiền tạm thời của item đó để hiển thị cho khớp
                const tempTotalPrice = item.price_at_time * newQuantity;
                return { ...item, quantity: newQuantity, total_price: tempTotalPrice };
            }
            return item;
        }));

        // BƯỚC 2: Xử lý gọi API với Debounce (Chờ người dùng dừng bấm mới gửi)
        
        // Nếu đang có lệnh chờ gửi của item này, hủy nó đi
        if (debounceTimers.current[cartItemId]) {
            clearTimeout(debounceTimers.current[cartItemId]);
        }

        // Tạo lệnh gửi mới, chờ 500ms
        debounceTimers.current[cartItemId] = setTimeout(async () => {
            try {
                // Sau 0.5s mới thực sự gọi API
                await cartItemApi.update(cartItemId, newQuantity);
                
                // (Tùy chọn) Gọi fetchCart ngầm để đồng bộ lại dữ liệu chuẩn xác từ server
                // const res = await cartItemApi.getMyCart();
                // setCartItems(res.data);
            } catch (error) {
                toast.error("Lỗi cập nhật server");
                fetchCart(); // Nếu lỗi thì load lại data cũ để hoàn tác
            }
        }, 500); 
    };

    // --- 3. Các hàm khác giữ nguyên ---
    const handleSelectItem = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            const allIds = cartItems.map(item => item._id);
            setSelectedItems(allIds);
        }
    };

    const handleRemoveItem = async (cartItemId) => {
        if (!window.confirm("Bạn muốn bỏ sản phẩm này?")) return;
        try {
            await cartItemApi.remove(cartItemId);
            toast.success("Đã xóa sản phẩm");
            setCartItems(prev => prev.filter(item => item._id !== cartItemId));
            setSelectedItems(prev => prev.filter(id => id !== cartItemId));
            fetchCartCount();
        } catch (error) {
            toast.error("Lỗi xóa sản phẩm");
        }
    };

    const totalSelectedAmount = cartItems.reduce((total, item) => {
        if (selectedItems.includes(item._id)) {
            return total + (item.total_price || (item.price_at_time * item.quantity));
        }
        return total;
    }, 0);

    const totalSelectedCount = selectedItems.length;

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            toast.warning("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán");
            return;
        }
        navigate('/checkout', { state: { selectedItemIds: selectedItems } });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4"/>
                    <p className="text-gray-500 mb-4">Giỏ hàng trống.</p>
                    <Link to="/shop" className="text-blue-600 font-bold hover:underline">Mua sắm ngay</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <ShoppingBag /> Giỏ hàng
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* CỘT TRÁI: DANH SÁCH */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            
                            {/* Header Bảng */}
                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-semibold text-gray-600 border-b items-center">
                                <div className="col-span-1 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </div>
                                <div className="col-span-5">Sản phẩm</div>
                                <div className="col-span-2 text-center">Đơn giá</div>
                                <div className="col-span-2 text-center">Số lượng</div>
                                <div className="col-span-2 text-right">Thành tiền</div>
                            </div>

                            {/* Body Bảng */}
                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <div key={item._id} className={`p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center flex flex-col gap-4 transition-colors ${selectedItems.includes(item._id) ? 'bg-blue-50/30' : ''}`}>
                                        
                                        {/* Checkbox Select Item */}
                                        <div className="col-span-1 flex justify-center md:justify-center items-center">
                                            <input 
                                                type="checkbox" 
                                                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                checked={selectedItems.includes(item._id)}
                                                onChange={() => handleSelectItem(item._id)}
                                            />
                                        </div>

                                        {/* Thông tin sản phẩm */}
                                        <div className="col-span-5 flex items-center gap-4">
                                            <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-lg border overflow-hidden">
                                                <img 
                                                    src={item.product_id?.image_url} 
                                                    alt={item.product_id?.product_name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-800 line-clamp-1">
                                                    {item.product_id?.product_name}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    #{item.product_id?.slug}
                                                </p>
                                                {/* Nút xóa mobile */}
                                                <button onClick={() => handleRemoveItem(item._id)} className="text-red-500 text-sm mt-2 md:hidden flex items-center gap-1">
                                                    <Trash2 size={14} /> Xóa
                                                </button>
                                            </div>
                                        </div>

                                        {/* Đơn giá */}
                                        <div className="col-span-2 text-center hidden md:block text-gray-600">
                                            {formatCurrency(item.price_at_time)}
                                        </div>

                                        {/* Số lượng (KHÔNG DÙNG DISABLED UPDATING NỮA) */}
                                        <div className="col-span-2 flex justify-center">
                                            <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                                                <button 
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                                                    className="p-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50 active:bg-gray-200 transition"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                
                                                {/* Hiển thị số lượng từ state (cập nhật tức thì) */}
                                                <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                
                                                <button 
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                                                    className="p-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50 active:bg-gray-200 transition"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Thành tiền & Nút xóa PC */}
                                        <div className="col-span-2 text-right flex flex-col items-end justify-center gap-2">
                                            <span className="font-bold text-blue-600">
                                                {formatCurrency(item.total_price)}
                                            </span>
                                            <button 
                                                onClick={() => handleRemoveItem(item._id)}
                                                className="hidden md:flex text-gray-400 hover:text-red-500 transition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: TỔNG KẾT (STICKY) */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b pb-4">Thanh toán</h2>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Đã chọn</span>
                                    <span className="font-medium text-gray-800">{totalSelectedCount} sản phẩm</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span>{formatCurrency(totalSelectedAmount)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="font-bold text-gray-800">Tổng cộng</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        {formatCurrency(totalSelectedAmount)}
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={handleCheckout}
                                disabled={totalSelectedCount === 0}
                                className={`w-full py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg 
                                    ${totalSelectedCount === 0 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-blue-900/10'
                                    }`}
                            >
                                Mua hàng ({totalSelectedCount}) <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;