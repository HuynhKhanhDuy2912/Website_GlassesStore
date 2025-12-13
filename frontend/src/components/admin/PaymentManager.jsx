import React, { useState, useEffect } from 'react';
import { 
    CreditCard, Search, DollarSign, Calendar, 
    CheckCircle, Clock, FileText, ExternalLink 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import paymentApi from '../../api/paymentApi';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
};

const PaymentManager = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMethod, setFilterMethod] = useState('all'); // 'all', 'COD', 'VNPAY'

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await paymentApi.getAll();
                setPayments(res.data || []);
            } catch (error) {
                console.error("Lỗi tải thanh toán:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    // Logic lọc dữ liệu
    const filteredPayments = payments.filter(payment => {
        const orderId = payment.order_id?._id || '';
        const userName = payment.order_id?.user_id?.fullname?.toLowerCase() || '';
        const transactionNo = payment.vnp_transaction_no || '';
        const search = searchTerm.toLowerCase();

        const matchesSearch = orderId.includes(search) || userName.includes(search) || transactionNo.includes(search);
        const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;

        return matchesSearch && matchesMethod;
    });

    // Thống kê nhanh
    const totalRevenue = filteredPayments
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const statusBadge = (status) => {
        return status === 'completed' 
            ? <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold uppercase"><CheckCircle size={12}/> Thành công</span>
            : <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold uppercase"><Clock size={12}/> Chờ xử lý</span>;
    };

    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu thanh toán...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CreditCard className="text-blue-600" /> Quản lý Giao dịch
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi dòng tiền và trạng thái thanh toán</p>
                </div>
                
                {/* Card Thống kê mini */}
                <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Doanh thu thực nhận</p>
                        <p className="font-bold text-lg text-gray-800">{formatCurrency(totalRevenue)}</p>
                    </div>
                </div>
            </div>

            {/* Toolbar: Search & Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <input 
                        type="text"
                        placeholder="Tìm theo Mã đơn, Tên khách hoặc Mã GD..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                
                <select 
                    className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                >
                    <option value="all">Tất cả phương thức</option>
                    <option value="COD">Thanh toán COD</option>
                    <option value="VNPAY">Ví điện tử VNPAY</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                                <th className="px-6 py-4">Mã đơn hàng</th>
                                <th className="px-6 py-4">Số tiền</th>
                                <th className="px-6 py-4">Phương thức</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Chi tiết GD</th>
                                <th className="px-6 py-4">Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-gray-50 transition">
                                    {/* Mã đơn hàng */}
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">
                                            #{payment.order_id?._id?.slice(-6).toUpperCase()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {payment.order_id?.user_id?.fullname || "Khách vãng lai"}
                                        </div>
                                        <Link 
                                            to={`/admin/orders/${payment.order_id?._id}`}
                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                        >
                                            Xem đơn <ExternalLink size={10}/>
                                        </Link>
                                    </td>

                                    {/* Số tiền */}
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        {formatCurrency(payment.amount)}
                                    </td>

                                    {/* Phương thức */}
                                    <td className="px-6 py-4">
                                        {payment.payment_method === 'VNPAY' ? (
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">VNPAY</span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-bold">COD</span>
                                        )}
                                    </td>

                                    {/* Trạng thái */}
                                    <td className="px-6 py-4">
                                        {statusBadge(payment.payment_status)}
                                    </td>

                                    {/* Chi tiết giao dịch (VNPAY Info) */}
                                    <td className="px-6 py-4 text-sm">
                                        {payment.payment_method === 'VNPAY' && payment.vnp_transaction_no ? (
                                            <div>
                                                <p className="text-gray-600"><span className="font-medium">Mã GD:</span> {payment.vnp_transaction_no}</p>
                                                <p className="text-gray-500 text-xs">Bank: {payment.vnp_bank_code}</p>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Không có thông tin</span>
                                        )}
                                    </td>

                                    {/* Ngày tạo */}
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14}/> {formatDate(payment.created_at)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filteredPayments.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Không tìm thấy giao dịch nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentManager;