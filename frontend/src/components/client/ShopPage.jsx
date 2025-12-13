import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Star, Search, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import productApi from '../../api/productApi';
import cartItemApi from '../../api/cartItemApi';

// Hàm format tiền
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ShopPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State quản lý loading cho từng sản phẩm và từng hành động
    // Cấu trúc: { [productId]: 'cart' | 'buy' | null }
    const [actionLoading, setActionLoading] = useState({});

    // 1. Lấy danh sách sản phẩm từ API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // params: { page: 1, limit: 20, sort: '-createdAt' }
                const res = await productApi.getAll({ limit: 20 });
                setProducts(res.data || []);
            } catch (error) {
                console.error("Lỗi tải sản phẩm:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // 2. Xử lý: Thêm vào giỏ hàng
    const handleAddToCart = async (product) => {
        if (!localStorage.getItem('user')) {
            toast.info("Vui lòng đăng nhập để mua hàng");
            navigate('/login');
            return;
        }

        try {
            // Set trạng thái loading là 'cart'
            setActionLoading(prev => ({ ...prev, [product._id]: 'cart' }));
            
            await cartItemApi.add({
                product_id: product._id,
                quantity: 1
            });
            
            toast.success(`Đã thêm ${product.product_name} vào giỏ`);
        } catch (error) {
            toast.error("Lỗi thêm vào giỏ hàng");
        } finally {
            setActionLoading(prev => ({ ...prev, [product._id]: null }));
        }
    };

    // 3. Xử lý: Mua ngay
    const handleBuyNow = async (product) => {
        if (!localStorage.getItem('user')) {
            toast.info("Vui lòng đăng nhập để mua hàng");
            navigate('/login');
            return;
        }

        try {
            // Set trạng thái loading là 'buy'
            setActionLoading(prev => ({ ...prev, [product._id]: 'buy' }));

            // Bước 1: Thêm vào giỏ trước
            await cartItemApi.add({
                product_id: product._id,
                quantity: 1
            });

            // Bước 2: Chuyển hướng ngay sang trang Checkout
            navigate('/checkout');
        } catch (error) {
            toast.error("Lỗi khi xử lý mua ngay");
            // Tắt loading nếu lỗi (nếu thành công thì trang sẽ chuyển hướng nên ko cần tắt cũng được)
            setActionLoading(prev => ({ ...prev, [product._id]: null }));
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            {/* Banner hoặc Tiêu đề */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Bộ sưu tập Kính mắt</h1>
                <p className="text-gray-500">Tìm kiếm phong cách phù hợp với bạn</p>
            </div>

            {/* Grid Sản phẩm */}
            {products.length === 0 ? (
                <div className="text-center py-10">
                    <Search size={48} className="mx-auto text-gray-300 mb-4"/>
                    <p className="text-gray-500">Chưa có sản phẩm nào.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        const isOutOfStock = product.quantity <= 0;
                        const currentLoading = actionLoading[product._id]; // 'cart' hoặc 'buy' hoặc undefined

                        return (
                            <div key={product._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
                                
                                {/* Ảnh sản phẩm */}
                                <div className="relative pt-[100%] bg-gray-50 overflow-hidden">
                                    <img 
                                        src={product.image_url || "/placeholder.png"} 
                                        alt={product.product_name}
                                        className={`absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                                    />
                                    
                                    {/* Badge Hết hàng hoặc Giảm giá */}
                                    {isOutOfStock ? (
                                        <span className="absolute top-3 left-3 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            Hết hàng
                                        </span>
                                    ) : product.discount > 0 && (
                                        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            -{product.discount}%
                                        </span>
                                    )}

                                    {/* Overlay Buttons (Hiện khi hover) - Nút Xem chi tiết */}
                                    <div className="absolute inset-0 bg-black/5 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300">
                                        <Link 
                                            to={`/product/${product.slug}`}
                                            className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={20} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Thông tin */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="mb-2">
                                        <span className="text-xs text-gray-500 uppercase tracking-wider">{product.category_id?.category_name || "Kính mắt"}</span>
                                        <Link to={`/product/${product.slug}`}>
                                            <h3 className="font-bold text-gray-800 text-lg truncate hover:text-blue-600 transition">
                                                {product.product_name}
                                            </h3>
                                        </Link>
                                    </div>

                                    {/* Đánh giá */}
                                    <div className="flex items-center gap-1 mb-3">
                                        {[1,2,3,4,5].map(star => (
                                            <Star key={star} size={14} className="text-yellow-400 fill-yellow-400" />
                                        ))}
                                        <span className="text-xs text-gray-400 ml-1">(5.0)</span>
                                    </div>

                                    {/* Giá tiền */}
                                    <div className="mb-4">
                                        <span className="text-lg font-bold text-blue-600 block">
                                            {formatCurrency(product.price)}
                                        </span>
                                        {product.discount > 0 && (
                                            <span className="text-sm text-gray-400 line-through">
                                                {formatCurrency(product.price * (1 + product.discount/100))}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Khu vực nút bấm (Footer Card) */}
                                    <div className="mt-auto flex gap-2">
                                        {/* Nút Thêm Giỏ */}
                                        <button 
                                            onClick={() => handleAddToCart(product)}
                                            disabled={isOutOfStock || currentLoading === 'cart' || currentLoading === 'buy'}
                                            className={`p-2.5 rounded-lg border transition-colors ${
                                                isOutOfStock 
                                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
                                                : "bg-white border-blue-600 text-blue-600 hover:bg-blue-50"
                                            }`}
                                            title="Thêm vào giỏ"
                                        >
                                            {currentLoading === 'cart' ? (
                                                <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full text-blue-600"></div>
                                            ) : (
                                                <ShoppingCart size={20} />
                                            )}
                                        </button>

                                        {/* Nút Mua Ngay */}
                                        <button 
                                            onClick={() => handleBuyNow(product)}
                                            disabled={isOutOfStock || currentLoading === 'cart' || currentLoading === 'buy'}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-transform active:scale-95 ${
                                                isOutOfStock 
                                                ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                                                : "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg"
                                            }`}
                                        >
                                            {currentLoading === 'buy' ? (
                                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    <Zap size={16} className={isOutOfStock ? "" : "text-yellow-400 fill-yellow-400"} /> 
                                                    Mua ngay
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ShopPage;