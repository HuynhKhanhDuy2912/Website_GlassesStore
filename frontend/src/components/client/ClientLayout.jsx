import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LogOut, User, ShoppingBag, LayoutDashboard, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Footer from './Footer'; // Nhớ import Footer vừa tạo

const ClientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Để active menu
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Menu mobile

  // Giả sử số lượng (sau này lấy từ context/api)
  const { cartCount, fetchCartCount } = useCart();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchCartCount();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    fetchCartCount();
    navigate('/login');
  };

  // Các link menu chính
  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Cửa hàng", path: "/shop" },
    { name: "Đơn hàng", path: "/my-orders" },
    { name: "Liên hệ", path: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* --- HEADER --- */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* 1. Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <ShoppingBag strokeWidth={2.5} /> GlassesStore
          </Link>

          {/* 2. Menu Desktop (Ẩn trên mobile) */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${location.pathname === link.path
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* 3. Icons bên phải */}
          <div className="flex items-center gap-4">

            {/* Giỏ hàng */}
            <Link to="/cart" className="relative group p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <ShoppingCart size={24} />
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white animate-in zoom-in">
                {cartCount}
              </span>
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-full py-1 px-2 transition border border-transparent hover:border-gray-200"
                >
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {user.fullname?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">
                    {user.fullname}
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-100 animate-in fade-in zoom-in duration-200 z-50">
                    {user.role === 'admin' && (
                      <Link to="/admin/dashboard" className="px-4 py-2 text-purple-600 hover:bg-purple-50 font-semibold flex items-center gap-2 text-sm">
                        <LayoutDashboard size={16} /> Trang Quản Trị
                      </Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <User size={16} /> Hồ sơ cá nhân
                    </Link>
                    <div className="border-t my-1"></div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition shadow-sm">
                Đăng nhập
              </Link>
            )}

            {/* Nút Menu Mobile */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-3 shadow-lg">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-base font-medium ${location.pathname === link.path ? "text-blue-600" : "text-gray-600"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* --- MAIN CONTENT --- */}
      {/* flex-1 để đẩy footer xuống đáy nếu nội dung ngắn */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* --- FOOTER --- */}
      <Footer />

    </div>
  );
};

export default ClientLayout;