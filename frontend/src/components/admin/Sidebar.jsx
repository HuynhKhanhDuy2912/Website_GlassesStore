import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ShoppingCart,
  MessageSquare,
  Tag,
  Layers,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  // 1. ĐỊNH NGHĨA CSS DÙNG CHUNG
  // Class cơ bản cho form dáng (layout, spacing, font)
  const baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium w-full";
  
  // Class khi item đang được chọn (Active)
  const activeClass = "bg-blue-600 text-white shadow-md";
  
  // Class khi item bình thường (Inactive) - Dùng chung cho cả nút Shop và Logout để đồng bộ
  const inactiveClass = "text-gray-400 hover:bg-gray-800 hover:text-white";

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/orders', name: 'Đơn hàng', icon: <ShoppingCart size={20} /> },
    { path: '/admin/products', name: 'Sản phẩm', icon: <ShoppingBag size={20} /> },
    { path: '/admin/users', name: 'Khách hàng', icon: <Users size={20} /> },
    { path: '/admin/brands', name: 'Thương hiệu', icon: <Tag size={20} /> },
    { path: '/admin/categories', name: 'Danh mục', icon: <Layers size={20} /> },
    { path: '/admin/reviews', name: 'Đánh giá', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0 shadow-lg z-50">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <h1 className="text-2xl font-bold text-blue-400">GLASSES ADMIN</h1>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              // Kết hợp baseClass với active hoặc inactive
              className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions (Shop Link & Logout) */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {/* Link về trang bán hàng - Giờ đây đã dùng chung style với menu */}
        <Link
          to="/shop"
          className={`${baseClass} ${inactiveClass}`}
        >
          <ShoppingBag size={20} />
          <span>Về trang bán hàng</span>
        </Link>

        {/* Logout Button - Cũng dùng chung style */}
        <button 
          className={`${baseClass} ${inactiveClass} text-left`} // Thêm text-left vì thẻ button mặc định center text
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;