import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    Trash2, Minus, Plus, ShoppingBag, ArrowRight, CreditCard, CheckSquare, Square, Zap 
} from 'lucide-react';

// ✅ HÀM XỬ LÝ ẢNH (Đã fix lỗi crash "startsWith is not a function")
const getImageUrl = (input) => {
    // 1. Kiểm tra dữ liệu đầu vào
    if (!input) return 'https://placehold.co/150?text=No+Image';

    let path = input;

    // 2. Nếu dữ liệu là Mảng (Array) -> Lấy phần tử đầu tiên
    if (Array.isArray(path)) {
        if (path.length > 0) path = path[0];
        else return 'https://placehold.co/150?text=No+Image';
    }

    // 3. Nếu dữ liệu là Object (không phải null) -> Thử lấy thuộc tính url hoặc image
    if (typeof path === 'object' && path !== null) {
        path = path.url || path.image || ''; 
    }

    // 4. Ép kiểu về chuỗi để đảm bảo an toàn tuyệt đối
    if (typeof path !== 'string') {
        return 'https://placehold.co/150?text=Error+Type';
    }

    // --- Xử lý đường dẫn ---
    if (path.startsWith('http')) return path;

    let finalPath = path;
    if (!finalPath.startsWith('/')) {
        finalPath = `/${finalPath}`;
    }
    if (!finalPath.includes('/uploads/')) {
        finalPath = `/uploads${finalPath}`;
    }

    return `http://localhost:5000${finalPath}`;
};

const CartPage = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    const [selectedItems, setSelectedItems] = useState([]); 
    
    const navigate = useNavigate();
    const location = useLocation();
    const getToken = () => localStorage.getItem("ACCESS_TOKEN");

    const SHIPPING_FEE = 25000;

    const fetchCart = async () => {
        const token = getToken();
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const res = await axios.get('http://localhost:5000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
        } catch (err) {
            console.error("Lỗi tải giỏ hàng:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    useEffect(() => {
        if (cart && cart.items.length > 0 && location.state?.newProductId) {
            const targetId = String(location.state.newProductId);
            const exists = cart.items.some(item => {
                const id = String(item.product?._id || item.product);
                return id === targetId;
            });

            if (exists) {
                setSelectedItems([targetId]);
                window.history.replaceState({}, document.title);
            }
        }
    }, [cart, location.state]);

    const getRealPrice = (item) => {
        if (!item.product) return 0;
        const p = item.product;
        if (p.isFlashSale) return p.flashSalePrice || 0;
        if (p.salePrice > 0 && p.salePrice < p.price) return p.salePrice || 0;
        return p.price || 0;
    };

    const subTotal = useMemo(() => {
        if (!cart || !cart.items) return 0;
        return cart.items.reduce((total, item) => {
            if (!item.product) return total; 
            const productId = String(item.product._id || item.product);
            
            if (selectedItems.includes(productId)) { 
                const realPrice = getRealPrice(item);
                return total + (realPrice * item.qty);
            }
            return total;
        }, 0);
    }, [cart, selectedItems]);

    const finalTotal = selectedItems.length > 0 ? subTotal + SHIPPING_FEE : 0;

    const handleSelectItem = (rawId) => {
        const productId = String(rawId); 
        if (selectedItems.includes(productId)) {
            setSelectedItems(selectedItems.filter(id => id !== productId));
        } else {
            setSelectedItems([...selectedItems, productId]);
        }
    };

    const handleSelectAll = () => {
        if (!cart || !cart.items) return;
        
        const validItemIds = cart.items
            .filter(item => item.product)
            .map(item => String(item.product._id || item.product));

        if (selectedItems.length === validItemIds.length) {
            setSelectedItems([]); 
        } else {
            setSelectedItems(validItemIds); 
        }
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert("Bạn chưa chọn sản phẩm nào để thanh toán!");
            return;
        }
        
        const itemsToCheckout = cart.items.filter(item => {
            if (!item.product) return false;
            const productId = String(item.product._id || item.product);
            return selectedItems.includes(productId);
        });

        const checkoutItemsWithRealPrice = itemsToCheckout.map(item => ({
            ...item,
            price: getRealPrice(item)
        }));

       navigate('/checkout', { 
        state: { 
        items: checkoutItemsWithRealPrice, 
        total: subTotal          // ✅ total = TẠM TÍNH (CHƯA SHIP)
    } 
});
    };

    const handleUpdateQty = async (index, newQty) => {
        if (updating) return;

        if (newQty < 1) {
            const item = cart.items[index];
            if (!item || !item.product) return;
            const productId = item.product._id || item.product;
            return handleRemoveItem(productId);
        }

        const token = getToken();
        setUpdating(true);
        try {
            const res = await axios.put('http://localhost:5000/api/cart/item', 
                { itemIndex: index, qty: newQty },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCart(res.data);
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveItem = async (rawId) => {
        const productId = String(rawId);
        const token = getToken();
        if (!window.confirm("Bạn có chắc muốn xóa bánh này khỏi giỏ?")) return;
        try {
            const res = await axios.delete(`http://localhost:5000/api/cart/item/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
            setSelectedItems(selectedItems.filter(id => id !== productId));
        } catch (err) {
            console.error("Lỗi xóa:", err);
        }
    };

    const handleRemoveInvalidItem = async (itemId) => {
         const token = getToken();
         try {
             const res = await axios.delete(`http://localhost:5000/api/cart/item/${itemId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCart(res.data);
         } catch(err) {
             console.log("Không thể xóa item lỗi tự động", err);
             window.location.reload();
         }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    
    if (!cart || cart.items.length === 0) { 
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-pink-100">
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-400">
                        <ShoppingBag size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng đang trống</h2>
                    <p className="text-gray-500 mb-8">Bạn chưa chọn chiếc bánh nào cả. Hãy dạo một vòng thực đơn nhé!</p>
                    <Link to="/san-pham" className="flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition font-medium w-full">
                        Xem thực đơn <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    const validItemsCount = cart.items.filter(i => i.product).length;

    return (
        <div className="bg-gray-50 min-h-screen py-10 font-sans">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 font-serif flex items-center gap-3">
                    <ShoppingBag className="text-pink-600" /> Giỏ Hàng Của Bạn
                </h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* LIST ITEM */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        
                        {/* HEADER CHỌN TẤT CẢ */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                             <button 
                                onClick={handleSelectAll}
                                className="flex items-center gap-2 text-gray-600 font-medium hover:text-pink-600"
                            >
                                {selectedItems.length === validItemsCount && validItemsCount > 0 ? (
                                    <CheckSquare className="text-pink-600" /> 
                                ) : (
                                    <Square className="text-gray-400" />
                                )}
                                Chọn tất cả ({validItemsCount} sản phẩm)
                            </button>
                        </div>

                        {cart.items.map((item, index) => {
                            if (!item.product) {
                                return (
                                    <div key={index} className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                                        <span className="text-red-500 text-sm">Sản phẩm này không còn tồn tại.</span>
                                        <button onClick={() => handleRemoveInvalidItem(item._id || "unknown")} className="text-red-600 hover:underline text-sm font-bold">Xóa bỏ</button>
                                    </div>
                                )
                            }

                            const rawId = item.product._id || item.product;
                            const productId = String(rawId);
                            const isSelected = selectedItems.includes(productId);
                            
                            const realPrice = getRealPrice(item);
                            const isFlashSale = item.product.isFlashSale;

                            // LOGIC TÌM ẢNH (Ưu tiên image -> images[0] -> cart item image)
                            const productImgPath = item.product?.image || item.product?.images?.[0] || item.image;

                            return (
                                <div key={index} className={`bg-white p-4 rounded-2xl shadow-sm border transition-all flex gap-4 items-center ${isSelected ? 'border-pink-300 ring-1 ring-pink-100' : 'border-gray-100'}`}>
                                    
                                    {/* NÚT TICK CHỌN */}
                                    <button onClick={() => handleSelectItem(productId)}>
                                        {isSelected ? (
                                            <CheckSquare className="text-pink-600 flex-shrink-0" size={24} />
                                        ) : (
                                            <Square className="text-gray-300 flex-shrink-0 hover:text-pink-400" size={24} />
                                        )}
                                    </button>

                                    {/* ẢNH SẢN PHẨM */}
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 relative">
                                        <img 
                                            src={getImageUrl(productImgPath)} 
                                            alt={item.product.name} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = 'https://placehold.co/150?text=No+Image';
                                            }} 
                                        />
                                        {isFlashSale && <div className="absolute top-0 left-0 bg-yellow-400 text-red-600 text-[10px] font-bold px-1 rounded-br">Flash Sale</div>}
                                    </div>

                                    {/* THÔNG TIN */}
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-gray-800 text-lg mb-1">{item.product.name}</h3>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${isFlashSale ? 'text-red-600' : 'text-pink-600'}`}>
                                                {(realPrice || 0).toLocaleString()}đ
                                            </span>
                                            {realPrice < (item.product.price || 0) && (
                                                <span className="text-gray-400 text-sm line-through">
                                                    {(item.product.price || 0).toLocaleString()}đ
                                                </span>
                                            )}
                                        </div>
                                        
                                        {isFlashSale && (
                                            <div className="text-xs text-orange-500 flex items-center gap-1 mt-1 font-medium">
                                                <Zap size={12} fill="currentColor"/> Đang trong Flash Sale
                                            </div>
                                        )}
                                    </div>

                                    {/* TĂNG GIẢM / XÓA */}
                                    <div className="flex flex-col items-end gap-4">
                                        <div className="flex items-center border border-gray-200 rounded-lg h-9">
                                            <button 
                                                disabled={updating}
                                                onClick={() => handleUpdateQty(index, item.qty - 1)}
                                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-lg"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-10 text-center text-sm font-semibold">{item.qty}</span>
                                            <button 
                                                disabled={updating}
                                                onClick={() => handleUpdateQty(index, item.qty + 1)}
                                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-lg"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button onClick={() => handleRemoveItem(productId)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* TỔNG TIỀN (RIGHT) */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 sticky top-24">
                            <h3 className="font-bold text-xl mb-6 text-gray-800">Thông tin đơn hàng</h3>
                            
                            <div className="space-y-4 mb-6 border-b border-gray-100 pb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính ({selectedItems.length} món):</span>
                                    <span className="font-medium">{subTotal.toLocaleString()}đ</span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển:</span>
                                    <span className="font-medium">
                                        {selectedItems.length > 0 ? SHIPPING_FEE.toLocaleString() + 'đ' : '0đ'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <span className="font-bold text-gray-800 text-lg">Tổng thanh toán:</span>
                                <span className="font-bold text-2xl text-pink-600">{finalTotal.toLocaleString()}đ</span>
                            </div>

                            <button 
                                onClick={handleCheckout}
                                disabled={selectedItems.length === 0}
                                className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition transform active:scale-[0.98]
                                    ${selectedItems.length > 0 
                                        ? 'bg-pink-600 text-white hover:bg-pink-700 shadow-pink-200' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                    }`}
                            >
                                <CreditCard size={20} />
                                Mua Hàng ({selectedItems.length})
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;