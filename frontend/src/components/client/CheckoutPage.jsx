import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapPin, CreditCard, Package, ArrowLeft, CheckCircle, Plus, TicketPercent } from 'lucide-react';
import { toast } from 'react-toastify';
import cartItemApi from '../../api/cartItemApi';
import orderApi from '../../api/orderApi';
import addressApi from '../../api/addressApi';
import AddressModal from '../../components/common/AddressModal';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Lấy dữ liệu từ 2 nguồn: Giỏ hàng (selectedItemIds) HOẶC Mua ngay (directProduct)
    const { selectedItemIds, directProduct } = location.state || {};

    const [cartItems, setCartItems] = useState([]); 
    const [cartSummary, setCartSummary] = useState({ total_amount: 0 });
    
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // 1. Fetch dữ liệu & Xử lý logic hiển thị
    const fetchCheckoutData = async () => {
        try {
            // --- TRƯỜNG HỢP 1: MUA NGAY (Direct) ---
            // Dữ liệu sản phẩm được truyền trực tiếp từ trang Detail, không cần gọi API giỏ hàng
            if (directProduct) {
                const product = directProduct.product_id; // Object sản phẩm đầy đủ
                const qty = directProduct.quantity;
                
                // Tạo một item giả lập giống cấu trúc CartItem để tái sử dụng giao diện
                const fakeCartItem = {
                    _id: "temp_direct_buy", 
                    product_id: product,
                    quantity: qty,
                    total_price: product.price * qty // Tạm tính (chưa trừ giảm giá nếu có logic phức tạp)
                };

                setCartItems([fakeCartItem]);
                setCartSummary({ total_amount: fakeCartItem.total_price });

                // Vẫn phải gọi API lấy địa chỉ
                await fetchAddresses();
                setLoading(false);
                return; 
            }

            // --- TRƯỜNG HỢP 2: MUA TỪ GIỎ HÀNG (Cart) ---
            if (!selectedItemIds || selectedItemIds.length === 0) {
                toast.warning("Vui lòng chọn sản phẩm để thanh toán");
                navigate('/cart');
                return;
            }

            // Gọi song song lấy giỏ hàng và địa chỉ
            const [cartRes, addrRes] = await Promise.all([
                cartItemApi.getMyCart(),
                addressApi.getMyAddresses()
            ]);

            // Lọc sản phẩm theo ID đã chọn
            const allItems = cartRes.data || [];
            const filteredItems = allItems.filter(item => selectedItemIds.includes(item._id));

            if (filteredItems.length === 0) {
                toast.error("Sản phẩm không tồn tại hoặc đã bị xóa");
                navigate('/cart');
                return;
            }

            setCartItems(filteredItems);

            // Tự tính lại tổng tiền các món đã chọn
            const calculatedTotal = filteredItems.reduce((sum, item) => sum + item.total_price, 0);
            setCartSummary({ total_amount: calculatedTotal });

            // Xử lý địa chỉ
            handleAddressData(addrRes.data);
            setLoading(false);

        } catch (error) {
            console.error(error);
            navigate('/cart');
        }
    };

    // Hàm riêng để lấy địa chỉ (tái sử dụng)
    const fetchAddresses = async () => {
        const res = await addressApi.getMyAddresses();
        handleAddressData(res.data);
    };

    // Hàm xử lý logic chọn địa chỉ mặc định
    const handleAddressData = (data) => {
        const list = data || [];
        setAddresses(list);
        if (list.length > 0) {
            const defaultAddr = list.find(a => a.isDefault);
            setSelectedAddressId(defaultAddr ? defaultAddr._id : list[0]._id);
        }
    };

    useEffect(() => {
        fetchCheckoutData();
        // eslint-disable-next-line
    }, [navigate]);

    // Callback khi thêm địa chỉ mới thành công
    const handleAddressAdded = async () => {
        await fetchAddresses();
    };

    // 2. Xử lý ĐẶT HÀNG
    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Vui lòng thêm địa chỉ giao hàng");
            return;
        }

        try {
            setProcessing(true);
            const shippingFee = 30000;
            
            // Payload cơ bản
            const payload = {
                shipping_address_id: selectedAddressId,
                shipping_fee: shippingFee,
                discount_amount: 0
            };

            // Logic phân loại payload gửi lên Backend
            if (directProduct) {
                payload.direct_items = [{
                    product_id: directProduct.product_id._id,
                    quantity: directProduct.quantity
                }];
            } else {
                // Nếu là Mua từ Giỏ -> Gửi items (CartItem ID)
                payload.items = selectedItemIds;
            }

            const res = await orderApi.createOrder(payload);

            toast.success("Đặt hàng thành công! 🎉");
            navigate(`/my-orders/${res.order_id}`);

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Đặt hàng thất bại");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl font-sans">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="text-blue-600" /> Thanh toán
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* --- CỘT TRÁI: THÔNG TIN --- */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* 1. Phần Địa chỉ */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <MapPin size={18} /> Địa chỉ nhận hàng
                            </h2>
                            <button 
                                onClick={() => setShowAddressModal(true)}
                                className="text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-1 rounded-lg transition flex items-center gap-1"
                            >
                                <Plus size={16} /> Thêm mới
                            </button>
                        </div>

                        {addresses.length === 0 ? (
                            <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">Bạn chưa có địa chỉ nào.</p>
                                <button onClick={() => setShowAddressModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                                    Thêm địa chỉ ngay
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map((addr) => (
                                    <label key={addr._id} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition relative ${selectedAddressId === addr._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <input 
                                            type="radio" 
                                            name="address" 
                                            className="mt-1 accent-blue-600 w-4 h-4"
                                            checked={selectedAddressId === addr._id}
                                            onChange={() => setSelectedAddressId(addr._id)}
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-800 flex items-center gap-2">
                                                {addr.recipient} 
                                                <span className="font-normal text-gray-500 text-sm">| {addr.phone}</span>
                                                {addr.isDefault && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200 font-bold uppercase">Mặc định</span>}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">{addr.address_line}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 2. Danh sách sản phẩm */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Package size={18} /> Sản phẩm ({cartItems.length})
                        </h2>
                        <div className="divide-y divide-gray-100">
                            {cartItems.map((item, index) => (
                                <div key={item._id || index} className="py-4 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg border overflow-hidden shrink-0 flex items-center justify-center">
                                        <img 
                                            src={item.product_id?.image_url || "/placeholder.png"} 
                                            alt={item.product_id?.product_name} 
                                            className="w-full h-full object-cover mix-blend-multiply"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                                            {item.product_id?.product_name}
                                        </p>
                                        <div className="text-xs text-gray-500 flex items-center gap-2">
                                            <span>Đơn giá: {formatCurrency(item.product_id?.price)}</span>
                                            <span className="w-px h-3 bg-gray-300"></span>
                                            <span>SL: <span className="font-bold text-gray-800">x{item.quantity}</span></span>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-blue-600 whitespace-nowrap">
                                        {formatCurrency(item.total_price)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: TỔNG TIỀN --- */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                            <TicketPercent size={18}/> Đơn hàng
                        </h2>
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span className="font-medium">{formatCurrency(cartSummary.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span className="font-medium">{formatCurrency(30000)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between items-end">
                                <span className="font-bold text-gray-800 text-base">Tổng cộng:</span>
                                <span className="font-bold text-xl text-blue-600">
                                    {formatCurrency(cartSummary.total_amount + 30000)}
                                </span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePlaceOrder}
                            disabled={processing}
                            className={`w-full py-3.5 rounded-xl font-bold text-white transition shadow-lg flex justify-center items-center gap-2 ${
                                processing 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-slate-900 hover:bg-slate-800 shadow-blue-900/10 hover:shadow-xl hover:-translate-y-0.5'
                            }`}
                        >
                            {processing ? (
                                <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div> Đang xử lý...</>
                            ) : (
                                <>Đặt hàng ngay <CheckCircle size={18}/></>
                            )}
                        </button>
                        
                        <Link to="/cart" className="block text-center text-sm text-gray-500 mt-4 hover:text-blue-600 flex items-center justify-center gap-1 transition group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Quay lại giỏ hàng
                        </Link>
                    </div>
                </div>
            </div>

            {/* MODAL THÊM ĐỊA CHỈ */}
            <AddressModal 
                isOpen={showAddressModal} 
                onClose={() => setShowAddressModal(false)}
                onSuccess={handleAddressAdded}
            />
        </div>
    );
};

export default CheckoutPage;