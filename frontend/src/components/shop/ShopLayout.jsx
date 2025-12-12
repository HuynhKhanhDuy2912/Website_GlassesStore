import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { LogOut, User, ShoppingBag, LayoutDashboard } from 'lucide-react';

const ShopLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- HEADER USER --- */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/shop" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <ShoppingBag /> GlassesStore
          </Link>

          {/* Menu bên phải */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Xin chào, <b>{user?.fullname}</b></span>
            
            {/* Avatar & Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
              >
                <User size={20} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-100 animate-fadeIn z-50">
                  
                  {/* --- LOGIC QUAN TRỌNG: CHỈ ADMIN MỚI THẤY NÚT NÀY --- */}
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin/dashboard" 
                      className="block px-4 py-2 text-purple-600 hover:bg-purple-50 font-semibold flex items-center gap-2"
                    >
                      <LayoutDashboard size={18} /> Trang Quản Trị
                    </Link>
                  )}
                  {/* --------------------------------------------------- */}

                  <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                    Hồ sơ cá nhân
                  </Link>
                  
                  <div className="border-t my-1"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={18} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Nội dung trang Shop */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ShopLayout;