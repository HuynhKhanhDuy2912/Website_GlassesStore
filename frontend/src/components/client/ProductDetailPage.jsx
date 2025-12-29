import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Zap, Star, Minus, Plus, ArrowLeft, Truck, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify'; // Hoặc react-toastify tùy bạn
import productApi from '../../api/productApi';
import cartItemApi from '../../api/cartItemApi';
import { useCart } from '../../context/CartContext';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ProductDetailPage = () => {
    const { slug } = useParams(); // Lấy slug từ URL
    const navigate = useNavigate();
    const { fetchCartCount } = useCart(); // Để cập nhật số trên header

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1); // State số lượng mua
    const [processing, setProcessing] = useState(false); // Loading khi bấm nút

    // 1. Lấy dữ liệu sản phẩm
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await productApi.getDetail(slug);
                setProduct(res.data);
            } catch (error) {
                console.error("Lỗi:", error);
                toast.error("Không tìm thấy sản phẩm");
                navigate('/shop');
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [slug, navigate]);

    // Hàm thay đổi số lượng
    const handleQuantityChange = (type) => {
        if (type === 'decrease') {
            setQuantity(prev => (prev > 1 ? prev - 1 : 1));
        } else {
            // Kiểm tra tồn kho nếu cần
            if (product.quantity && quantity >= product.quantity) {
                toast.warning(`Chỉ còn ${product.quantity} sản phẩm trong kho`);
                return;
            }
            setQuantity(prev => prev + 1);
        }
    };

    // 2. Xử lý Thêm vào giỏ
    const handleAddToCart = async () => {
        if (!localStorage.getItem('user')) {
            toast.info("Vui lòng đăng nhập");
            navigate('/login');
            return;
        }

        try {
            setProcessing(true);
            await cartItemApi.add({
                product_id: product._id,
                quantity: quantity
            });
            
            fetchCartCount(); // Cập nhật Header
            toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ`);
        } catch (error) {
            toast.error("Lỗi thêm vào giỏ hàng");
        } finally {
            setProcessing(false);
        }
    };

    // 3. Xử lý Mua Ngay (Thêm vào giỏ -> Chuyển sang Checkout)
    const handleBuyNow = () => {
        if (!localStorage.getItem('user')) {
            toast.info("Vui lòng đăng nhập để mua hàng");
            navigate('/login');
            return;
        }
    
        // KHÔNG GỌI cartItemApi.add NỮA
        
        // Chuyển hướng sang Checkout, mang theo thông tin sản phẩm "tươi"
        navigate('/checkout', { 
            state: { 
                // Đặt tên biến khác đi để phân biệt với selectedItemIds của giỏ hàng
                directProduct: { 
                    product_id: product, // Truyền nguyên object product
                    quantity: quantity 
                } 
            } 
        });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
    if (!product) return null;

    const isOutOfStock = product.quantity <= 0;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
                    
                    {/* CỘT TRÁI: ẢNH */}
                    <div className="bg-gray-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 relative">
                         {product.discount > 0 && (
                            <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold shadow-lg z-10">
                                -{product.discount}%
                            </span>
                        )}
                        <img 
                            src={product.image_url || "/placeholder.png"} 
                            alt={product.product_name} 
                            className="w-full max-h-[500px] object-contain mix-blend-multiply hover:scale-105 transition duration-500"
                        />
                    </div>

                    {/* CỘT PHẢI: THÔNG TIN */}
                    <div className="p-8 flex flex-col justify-center">
                        <div className="mb-4">
                            <span className="text-sm font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                                {product.category_id?.category_name || "Phụ kiện"}
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.product_name}</h1>
                        
                        {/* Rating giả lập */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex text-yellow-400">
                                {[1,2,3,4,5].map(i => <Star key={i} size={18} fill="currentColor" />)}
                            </div>
                            <span className="text-gray-400 text-sm">| Đã bán 1.2k</span>
                        </div>

                        {/* Giá tiền */}
                        <div className="flex items-end gap-3 mb-8">
                            <span className="text-4xl font-bold text-blue-600">
                                {formatCurrency(product.price)}
                            </span>
                            {product.discount > 0 && (
                                <span className="text-xl text-gray-400 line-through mb-1">
                                    {formatCurrency(product.price * (1 + product.discount/100))}
                                </span>
                            )}
                        </div>

                        {/* Mô tả ngắn */}
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {product.description || "Sản phẩm kính mắt thời trang cao cấp, bảo vệ mắt khỏi tia UV, thiết kế hiện đại phù hợp mọi khuôn mặt."}
                        </p>

                        {/* Chọn số lượng */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng:</label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button 
                                        onClick={() => handleQuantityChange('decrease')}
                                        className="p-3 hover:bg-gray-100 transition rounded-l-lg"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="w-12 text-center font-bold text-gray-800">{quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange('increase')}
                                        className="p-3 hover:bg-gray-100 transition rounded-r-lg"
                                        disabled={isOutOfStock}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {isOutOfStock ? "Hết hàng" : `Còn ${product.quantity} sản phẩm`}
                                </span>
                            </div>
                        </div>

                        {/* Nút bấm */}
                        <div className="flex gap-4">
                            <button 
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || processing}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition border-2 ${
                                    isOutOfStock 
                                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50" 
                                    : "border-blue-600 text-blue-600 hover:bg-blue-50"
                                }`}
                            >
                                <ShoppingCart size={20} /> Thêm vào giỏ
                            </button>

                            <button 
                                onClick={handleBuyNow}
                                disabled={isOutOfStock || processing}
                                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white transition shadow-lg ${
                                    isOutOfStock 
                                    ? "bg-gray-400 cursor-not-allowed" 
                                    : "bg-slate-900 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5"
                                }`}
                            >
                                {processing ? (
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <> <Zap size={20} className="fill-yellow-400 text-yellow-400"/> Mua ngay </>
                                )}
                            </button>
                        </div>

                        {/* Cam kết */}
                        <div className="mt-8 grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck size={18} className="text-green-500" /> Free ship đơn từ 500k
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ShieldCheck size={18} className="text-blue-500" /> Bảo hành chính hãng
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;