import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  ClipboardList, // Đổi icon Đơn hàng cho hợp lý hơn
  MessageSquare,
  Tag,
  Layers,
  LogOut,
  CreditCard, // Icon mới cho Thanh toán
  Star        // Icon mới cho Đánh giá
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. ĐỊNH NGHĨA CSS DÙNG CHUNG
  const baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 font-medium w-full";
  const activeClass = "bg-blue-600 text-white shadow-md";
  const inactiveClass = "text-gray-400 hover:bg-gray-800 hover:text-white";

  const menuItems = [
    { 
      path: '/admin/dashboard', 
      name: 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/admin/order', 
      name: 'Đơn hàng', 
      icon: <ClipboardList size={20} /> // Đổi từ ShoppingCart -> ClipboardList (Danh sách đơn)
    },
    { 
      path: '/admin/product', 
      name: 'Sản phẩm', 
      icon: <ShoppingBag size={20} /> 
    },
    { 
      path: '/admin/users', 
      name: 'Tài khoản', 
      icon: <Users size={20} /> 
    },
    { 
      path: '/admin/brands', 
      name: 'Thương hiệu', 
      icon: <Tag size={20} /> 
    },
    { 
      path: '/admin/category', 
      name: 'Danh mục', 
      icon: <Layers size={20} /> 
    },
    { 
      path: '/admin/contact', 
      name: 'Liên hệ', 
      icon: <MessageSquare size={20} /> 
    },
    { 
      path: '/admin/payment', 
      name: 'Thanh toán', 
      icon: <CreditCard size={20} /> // Đổi thành icon Thẻ tín dụng
    },
    { 
      path: '/admin/review', 
      name: 'Đánh giá', 
      icon: <Star size={20} /> // Đổi thành icon Ngôi sao
    },
  ];

  // 3. Hàm xử lý Đăng xuất
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      localStorage.removeItem('accessToken'); 
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

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
              className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <Link
          to="/shop"
          className={`${baseClass} ${inactiveClass}`}
        >
          <ShoppingBag size={20} />
          <span>Về trang bán hàng</span>
        </Link>

        <button 
          onClick={handleLogout}
          className={`${baseClass} ${inactiveClass} text-left hover:text-red-400`}
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;