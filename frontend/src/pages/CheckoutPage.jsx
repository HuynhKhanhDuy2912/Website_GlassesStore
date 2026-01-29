import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    MapPin, Banknote, ChevronLeft, CheckCircle, Loader, Save 
} from 'lucide-react';

//  HÀM XỬ LÝ ẢNH ĐỒNG BỘ VỚI APP.JS
const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/150?text=No+Image';
    if (typeof path === 'string' && path.startsWith("http")) return path;
    
    let url = typeof path === 'object' ? path.url : path;
    if (!url) return 'https://placehold.co/150?text=No+Image';

    let cleanPath = url.replace(/\\/g, "/");
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
    if (!cleanPath.startsWith("/uploads")) cleanPath = "/uploads" + cleanPath;
    
    return `http://localhost:5000${cleanPath}`;
};

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy dữ liệu từ Cart truyền sang
    const { items, total } = location.state || { items: [], total: 0 };
    const [loading, setLoading] = useState(false);
    
    // Cấu hình phí ship cố định
    const SHIPPING_FEE = 25000;
    const finalTotal = total + SHIPPING_FEE;

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        phone: '',
        addressLine: '', 
        city: ''       
    });

    const [paymentMethod, setPaymentMethod] = useState('cod'); 

    useEffect(() => {
        if (!items || items.length === 0) {
            navigate('/cart');
            return;
        }

        const savedAddress = localStorage.getItem("SAVED_SHIPPING_INFO");
        if (savedAddress) {
            setShippingInfo(JSON.parse(savedAddress));
        } else {
            const userInfo = localStorage.getItem("USER_INFO");
            if (userInfo) {
                const user = JSON.parse(userInfo);
                setShippingInfo(prev => ({
                    ...prev,
                    fullName: user.name || '',
                }));
            }
        }
    }, [items, navigate]);

    const handleChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.addressLine) {
            alert("Vui lòng điền đầy đủ thông tin giao hàng!");
            return;
        }

        const token = localStorage.getItem("ACCESS_TOKEN");
        if (!token) {
            alert("Bạn cần đăng nhập để đặt hàng.");
            navigate('/login');
            return;
        }

        setLoading(true);
        localStorage.setItem("SAVED_SHIPPING_INFO", JSON.stringify(shippingInfo));

        // Chuẩn bị dữ liệu gửi lên Server
        const orderData = {
            orderItems: items.map(item => {
                const p = item.product || {};
                const rawImage = item.image || (p.images && p.images[0]?.url) || (p.images && p.images[0]) || '';
                
                return {
                    product: p._id || item.product, 
                    name: item.name || p.name,
                    qty: item.qty,
                    price: item.price, 
                    image: typeof rawImage === 'object' ? rawImage.url : rawImage, 
                    attrs: item.attrs || {}
                };
            }),
            shippingAddress: {
                fullName: shippingInfo.fullName,
                phone: shippingInfo.phone,
                addressLine: shippingInfo.addressLine,
                city: shippingInfo.city || 'Việt Nam' 
            },
            paymentMethod: paymentMethod, 
            itemsPrice: total,
            shippingPrice: SHIPPING_FEE,
            taxPrice: 0,
            totalPrice: finalTotal
        };

        try {
            const res = await axios.post('http://localhost:5000/api/orders', orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.status === 201) {
                alert("Đặt hàng thành công!");
                window.dispatchEvent(new Event("CART_UPDATED"));
                navigate(`/order/${res.data._id}`);
            }

        } catch (err) {
            console.error("Lỗi đặt hàng:", err);
            alert(err.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng.");
        } finally {
            setLoading(false);
        }
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-10 font-sans">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
                    <Link to="/cart" className="hover:text-blue-600 flex items-center gap-1">
                        <ChevronLeft size={16} /> Quay lại giỏ hàng
                    </Link>
                    <span>/</span>
                    <span className="font-bold text-gray-800">Thanh toán</span>
                </div>

                <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
                    
                    {/* CỘT TRÁI: FORM NHẬP LIỆU */}
                    <div className="w-full lg:w-3/5">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 relative">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <MapPin className="text-blue-600" /> Thông tin giao hàng
                            </h2>
                            
                            <div className="absolute top-6 right-6 text-xs text-gray-400 flex items-center gap-1">
                                <Save size={12}/> Tự động lưu địa chỉ
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên (*)</label>
                                    <input type="text" name="fullName" value={shippingInfo.fullName} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="Nguyễn Văn A" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại (*)</label>
                                    <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="0901234567" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng (*)</label>
                                    <input type="text" name="addressLine" value={shippingInfo.addressLine} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="Số nhà, tên đường..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố / Tỉnh</label>
                                    <input type="text" name="city" value={shippingInfo.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="Ví dụ: TP.HCM" />
                                </div>
                            </div>
                        </div>

                        {/* PHƯƠNG THỨC THANH TOÁN */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Banknote className="text-blue-600" /> Phương thức thanh toán
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div onClick={() => setPaymentMethod('cod')} className={`cursor-pointer p-4 border rounded-xl flex items-center gap-3 transition-all ${paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center bg-white">{paymentMethod === 'cod' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}</div>
                                    <div className="font-bold text-gray-800">Thanh toán khi nhận hàng (COD)</div>
                                </div>
                                
                                <div onClick={() => setPaymentMethod('card')} className={`cursor-pointer p-4 border rounded-xl flex items-center gap-3 transition-all ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center bg-white">{paymentMethod === 'card' && <div className="w-3 h-3 bg-blue-600 rounded-full"></div>}</div>
                                    <div className="font-bold text-gray-800">Thanh toán Online / Thẻ</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
                    <div className="w-full lg:w-2/5">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 sticky top-10">
                            <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-3">Đơn hàng của bạn</h3>
                            <div className="max-h-80 overflow-y-auto mb-4 pr-2 scrollbar-thin">
                                {items.map((item, idx) => {
                                    const p = item.product || {};
                                    // Tìm ảnh hiển thị: ưu tiên item.image > p.images
                                    const rawImage = item.image || (p.images && p.images[0]?.url) || (p.images && p.images[0]) || '';
                                    
                                    return (
                                        <div key={idx} className="flex gap-4 mb-4 items-center">
                                            <div className="w-16 h-16 flex-shrink-0 border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                                                <img 
                                                    src={getImageUrl(rawImage)} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null; 
                                                        e.target.src = 'https://via.placeholder.com/150?text=No+Image'
                                                    }} 
                                                />
                                            </div>
                                            
                                            <div className="flex-grow">
                                                <h4 className="font-bold text-sm text-gray-800 line-clamp-2">{item.name || p.name}</h4>
                                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                                    <span>Số lượng: {item.qty}</span>
                                                    <span className="text-blue-600 font-bold">{(item.price * item.qty).toLocaleString()}đ</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Tạm tính:</span>
                                    <span>{total.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Phí vận chuyển:</span>
                                    <span className="font-medium text-gray-800">{SHIPPING_FEE.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-dashed mt-2">
                                    <span className="font-bold text-lg text-gray-800">Tổng thanh toán:</span>
                                    <span className="font-bold text-2xl text-blue-600">{finalTotal.toLocaleString()}đ</span>
                                </div>
                                
                                <button type="submit" disabled={loading} className={`w-full py-4 mt-6 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100 active:scale-[0.98]'}`}>
                                    {loading ? <Loader className="animate-spin" size={20} /> : <CheckCircle size={20} />} 
                                    {loading ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT HÀNG"}
                                </button>
                                
                                <p className="text-[10px] text-center text-gray-400 mt-4 italic">
                                    Bằng việc nhấn đặt hàng, bạn đồng ý với các điều khoản của DHD - GlassesShop
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;