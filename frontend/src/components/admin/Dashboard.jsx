import React from 'react';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color} text-white`}>
      {icon}
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan</h2>
      
      {/* Các thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng doanh thu" value="125.000.000₫" icon={<DollarSign />} color="bg-green-500" />
        <StatCard title="Đơn hàng mới" value="45" icon={<ShoppingCart />} color="bg-blue-500" />
        <StatCard title="Khách hàng" value="1,203" icon={<Users />} color="bg-purple-500" />
        <StatCard title="Sản phẩm" value="320" icon={<Package />} color="bg-orange-500" />
      </div>

      {/* Khu vực biểu đồ hoặc bảng mới nhất (Demo) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-lg mb-4">Đơn hàng gần đây</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-500 text-sm">
              <th className="py-3">Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 font-medium">#ORD-001</td>
              <td>Nguyễn Văn A</td>
              <td>12/12/2025</td>
              <td>1.500.000₫</td>
              <td><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Hoàn thành</span></td>
            </tr>
            <tr className="border-b hover:bg-gray-50">
              <td className="py-3 font-medium">#ORD-002</td>
              <td>Trần Thị B</td>
              <td>12/12/2025</td>
              <td>850.000₫</td>
              <td><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">Chờ duyệt</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;