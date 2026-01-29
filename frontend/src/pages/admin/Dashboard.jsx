import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

//CẬP NHẬT: Hàm helper xử lý ảnh an toàn hơn
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/100?text=No+Img';
    if (path.startsWith("http")) return path;
    
    // Đảm bảo luôn có dấu / giữa domain và path
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:5000${cleanPath}`;
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
    <div className={`p-4 rounded-full ${color} text-white shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    counts: { users: 0, products: 0, orders: 0, revenue: 0 },
    chartData: [],
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        const res = await axios.get("http://localhost:5000/api/orders/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  if (loading) return <div className="p-10 text-center text-blue-600 font-bold animate-pulse">Đang tải dữ liệu thống kê...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-600">
        <TrendingUp/> Tổng Quan Kinh Doanh
      </h1>
      
      {/* 1. Cards thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Doanh thu (Đã giao)" 
          value={formatCurrency(stats.counts.revenue)} 
          icon={<DollarSign size={24}/>} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Tổng Đơn hàng" 
          value={stats.counts.orders} 
          icon={<ShoppingCart size={24}/>} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Khách hàng" 
          value={stats.counts.users} 
          icon={<Users size={24}/>} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Sản phẩm" 
          value={stats.counts.products} 
          icon={<Package size={24}/>} 
          color="bg-yellow-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* 2. Biểu đồ doanh thu 7 ngày */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-6 text-gray-700">Biểu đồ doanh thu (7 ngày gần nhất)</h3>
          <div className="h-64 w-full">
            {stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="_id" tick={{fontSize: 12}} />
                    <YAxis tickFormatter={(val) => `${val/1000}k`} tick={{fontSize: 12}} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="#1253eb" radius={[4, 4, 0, 0]} barSize={40} name="Doanh thu" />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Chưa có dữ liệu doanh thu tuần này</div>
            )}
          </div>
        </div>

        {/* 3. Top Sản Phẩm Bán Chạy */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-lg mb-4 text-gray-700">Top Bán Chạy 🔥</h3>
             <div className="space-y-4">
                {stats.topProducts.length > 0 ? (
                    stats.topProducts.map((prod, index) => (
                        <div key={index} className="flex items-center gap-4 border-b border-gray-50 pb-3 last:border-0">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                <img 
                                    src={getImageUrl(prod.image)} 
                                    alt={prod.name} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {e.target.src = 'https://via.placeholder.com/100?text=Error'}}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-800 text-sm truncate" title={prod.name}>{prod.name}</h4>
                                <p className="text-xs text-gray-500">{formatCurrency(prod.price)}</p>
                            </div>
                            <div className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-1 rounded">
                                x{prod.totalSold}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm">Chưa có sản phẩm nào được bán</p>
                )}
             </div>
        </div>
      </div>

      {/* 4. Đơn hàng gần đây */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg mb-4 text-gray-700">Đơn hàng mới nhất</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-gray-500 text-sm border-b border-gray-100">
                        <th className="pb-3 pl-2">Khách hàng</th>
                        <th className="pb-3">Ngày đặt</th>
                        <th className="pb-3">Tổng tiền</th>
                        <th className="pb-3">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {stats.recentOrders.length > 0 ? (
                        stats.recentOrders.map(order => (
                            <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                <td className="py-3 pl-2 text-sm font-medium">
                                    {order.user ? order.user.name : "Khách vãng lai"}
                                    <div className="text-xs text-gray-400 font-normal">{order._id}</div>
                                </td>
                                <td className="py-3 text-sm">{formatDate(order.createdAt)}</td>
                                <td className="py-3 text-sm font-bold text-blue-600">{formatCurrency(order.totalPrice)}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded text-xs font-medium 
                                        ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                          'bg-yellow-100 text-yellow-700'}`}>
                                        {order.status === 'completed' ? 'Hoàn thành' : 
                                         order.status === 'cancelled' ? 'Đã hủy' : 'Chờ xử lý'}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4" className="text-center py-4 text-gray-400">Chưa có đơn hàng nào</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;