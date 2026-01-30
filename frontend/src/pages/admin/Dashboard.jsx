import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* =======================
   HELPER
======================= */

const getImageUrl = (path) => {
  if (!path) return "https://via.placeholder.com/100?text=No+Img";
  if (path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
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

// Build chart doanh thu theo THÁNG (frontend)
const buildMonthlyChartData = (orders, selectedYear) => {
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    revenue: 0,
  }));

  orders.forEach((order) => {
    if (!order.createdAt || order.status !== "completed") return;

    const date = new Date(order.createdAt);
    const year = date.getFullYear();
    const monthIndex = date.getMonth();

    if (year === selectedYear) {
      monthlyRevenue[monthIndex].revenue += order.totalPrice;
    }
  });

  return monthlyRevenue;
};

/* =======================
   DASHBOARD
======================= */

const Dashboard = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [chartData, setChartData] = useState([]);

  const [stats, setStats] = useState({
    counts: { users: 0, products: 0, orders: 0, revenue: 0 },
    recentOrders: [],
    topProducts: [],
  });

  const [loading, setLoading] = useState(true);

  const [orders, setOrders] = useState([]);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        const res = await axios.get("http://localhost:5000/api/orders/stats", {
          headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await axios.get("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
    }
  };

  fetchOrders();
}, []);

useEffect(() => {
  const data = buildMonthlyChartData(orders, year);
  setChartData(data);
}, [orders, year]);


  const formatCurrency = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);

  const formatDate = (d) => new Date(d).toLocaleDateString("vi-VN");

  if (loading) {
    return (
      <div className="p-10 text-center text-blue-600 font-bold animate-pulse">
        Đang tải dữ liệu thống kê...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-600">
        <TrendingUp /> Tổng Quan Kinh Doanh
      </h1>

      {/* 1. Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Doanh thu (Đã giao)"
          value={formatCurrency(stats.counts.revenue)}
          icon={<DollarSign size={24} />}
          color="bg-yellow-400"
        />
        <StatCard
          title="Tổng Đơn hàng"
          value={stats.counts.orders}
          icon={<ShoppingCart size={24} />}
          color="bg-blue-500"
        />
        <StatCard
          title="Người dùng"
          value={stats.counts.users}
          icon={<Users size={24} />}
          color="bg-green-500"
        />
        <StatCard
          title="Sản phẩm"
          value={stats.counts.products}
          icon={<Package size={24} />}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* 2. BIỂU ĐỒ DOANH THU THEO THÁNG */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-medium text-lg text-gray-500">
                Doanh thu theo tháng của năm {year}
              </h3>
            </div>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg text-sm font-medium bg-white shadow-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>

          <div className="h-72 w-full">
            {chartData.every((m) => m.revenue === 0) ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Không có dữ liệu doanh thu năm {year}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickFormatter={(m) => `Th ${m}`} />
                  <YAxis tickFormatter={(v) => `${v / 1_000_000}tr`} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Tháng ${label}`}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Doanh thu"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                    barSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. Top sản phẩm */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-extrabold text-xl mb-4">Top Bán Chạy </h3>
          <div className="space-y-4">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((prod, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b border-gray-50 pb-3 last:border-0"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border">
                    <img
                      src={getImageUrl(prod.image)}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm truncate">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(prod.price)}
                    </p>
                  </div>
                  <div className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-1 rounded">
                    x{prod.totalSold}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Chưa có sản phẩm nào</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Đơn hàng gần đây */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-xl">Đơn hàng mới nhất</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-500 uppercase text-xs tracking-wide text-center">
                <th className="pl-4 pb-2">Khách hàng</th>
                <th className="pb-2">Số điện thoại</th>
                <th className="pb-2">Địa chỉ</th>
                <th className="pb-2">Ngày đặt</th>
                <th className="pb-2">Tổng tiền</th>
                <th className="pb-2">Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="bg-gray-50 hover:bg-blue-50 transition rounded-xl text-center"
                  >
                    {/* Khách hàng */}
                    <td className="pl-4 py-3">
                      <div className="font-medium text-gray-800">
                        {order.user ? order.user.name : "Người dùng"}
                      </div>
                      <div className="text-xs text-gray-400">
                        #{order._id.slice(-6)}
                      </div>
                    </td>

                    {/* Số điện thoại */}
                    <td className="py-3 text-gray-600">
                      {order.shippingAddress?.phone}
                    </td>

                    {/* Địa chỉ */}
                    <td className="py-3 text-gray-600">
                      {order.shippingAddress?.addressLine}, {order.shippingAddress?.city}
                    </td>

                    {/* Ngày đặt */}
                    <td className="py-3 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Tổng tiền */}
                    <td className="py-3 font-semibold text-dark-600">
                      {formatCurrency(order.totalPrice)}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          order.status === "completed"
                            ? "bg-green-600 text-white"
                            : order.status === "delivered"
                              ? "bg-blue-600 text-white"
                              : order.status === "cancelled"
                                ? "bg-red-600 text-white"
                                : "bg-yellow-400 text-white"
                        }`}
                      >
                        {order.status === "completed"
                          ? "Hoàn thành"
                          : order.status === "delivered"
                            ? "Đang giao"
                            : order.status === "cancelled"
                              ? "Đã hủy"
                              : "Chờ xử lý"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-6 text-gray-400 italic"
                  >
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
