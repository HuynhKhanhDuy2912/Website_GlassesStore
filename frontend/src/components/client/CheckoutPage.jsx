import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, Package, ArrowLeft, CheckCircle, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import cartItemApi from '../../api/cartItemApi';
import orderApi from '../../api/orderApi';
import addressApi from '../../api/addressApi'; // Import API địa chỉ
import AddressModal from '../../components/common/AddressModal'; // Import Modal

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [cartSummary, setCartSummary] = useState({ total_amount: 0 });
    
    // State cho địa chỉ thật
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // 1. Fetch dữ liệu Giỏ hàng & Địa chỉ
    const fetchCheckoutData = async () => {
        try {
            // Gọi song song 2 API
            const [cartRes, addrRes] = await Promise.all([
                cartItemApi.getMyCart(),
                addressApi.getMyAddresses()
            ]);

            // Xử lý giỏ hàng
            if (!cartRes.data || cartRes.data.length === 0) {
                toast.warning("Giỏ hàng trống");
                navigate('/shop');
                return;
            }
            setCartItems(cartRes.data);
            setCartSummary(cartRes.cart_summary);

            // Xử lý địa chỉ
            const addrList = addrRes.data || [];
            setAddresses(addrList);

            // Tự động chọn địa chỉ mặc định (hoặc cái đầu tiên)
            if (addrList.length > 0) {
                const defaultAddr = addrList.find(a => a.isDefault);
                setSelectedAddressId(defaultAddr ? defaultAddr._id : addrList[0]._id);
            }

        } catch (error) {
            console.error(error);
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCheckoutData();
    }, [navigate]);

    // 2. Refresh lại list địa chỉ sau khi thêm mới
    const handleAddressAdded = async () => {
        const res = await addressApi.getMyAddresses();
        const newlist = res.data || [];
        setAddresses(newlist);
        // Chọn luôn cái vừa thêm (thường là cái cuối cùng hoặc cái default mới)
        if (newlist.length > 0) {
             // Logic: nếu vừa thêm là default, chọn nó. Nếu không, chọn cái mới nhất (thường ở cuối mảng nếu sort createdAt)
             // Nhưng backend bạn sort: default lên đầu, created_at mới nhất.
             // Nên cứ chọn cái đầu tiên (nếu user set default) hoặc user tự chọn
             // Ở đây mình để user tự chọn lại cho chắc, hoặc auto chọn cái đầu
             setSelectedAddressId(newlist[0]._id); 
        }
    };

    // 3. Xử lý Đặt hàng
    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error("Vui lòng thêm và chọn địa chỉ giao hàng");
            return;
        }

        try {
            setProcessing(true);
            
            const res = await orderApi.createOrder({
                shipping_address_id: selectedAddressId, // ID thật từ MongoDB
                shipping_fee: 30000, 
                discount_amount: 0
            });

            toast.success("🎉 Đặt hàng thành công!");
            navigate(`/my-orders/${res.order_id}`);

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Đặt hàng thất bại");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CreditCard className="text-blue-600" /> Thanh toán
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* CỘT TRÁI */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Phần Địa chỉ */}
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
                                            className="mt-1"
                                            checked={selectedAddressId === addr._id}
                                            onChange={() => setSelectedAddressId(addr._id)}
                                        />
                                        <div>
                                            <p className="font-bold text-gray-800">
                                                {addr.recipient} <span className="font-normal text-gray-500">| {addr.phone}</span>
                                                {addr.isDefault && <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200">Mặc định</span>}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">{addr.address_line}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Danh sách sản phẩm */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Package size={18} /> Sản phẩm ({cartItems.length})
                        </h2>
                        <div className="divide-y divide-gray-100">
                            {cartItems.map(item => (
                                <div key={item._id} className="py-3 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden">
                                        <img src={item.product_id?.image_url} alt="" className="w-full h-full object-cover"/>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product_id?.product_name}</p>
                                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">
                                        {formatCurrency(item.total_price)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: TỔNG TIỀN */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="font-bold text-gray-800 mb-4 border-b pb-2">Đơn hàng</h2>
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính:</span>
                                <span>{formatCurrency(cartSummary.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển:</span>
                                <span>{formatCurrency(30000)}</span>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-lg font-bold text-blue-600">
                                <span>Tổng cộng:</span>
                                <span>{formatCurrency(cartSummary.total_amount + 30000)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePlaceOrder}
                            disabled={processing}
                            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
                        >
                            {processing ? "Đang xử lý..." : <>Đặt hàng ngay <CheckCircle size={18}/></>}
                        </button>
                        
                        <Link to="/cart" className="block text-center text-sm text-gray-500 mt-4 hover:text-blue-600">
                            <ArrowLeft size={14} className="inline mr-1" /> Quay lại giỏ hàng
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