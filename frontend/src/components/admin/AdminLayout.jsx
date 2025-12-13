import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, LogOut } from 'lucide-react'; // Bỏ import Search và User vì không dùng

const AdminLayout = () => {
  const navigate = useNavigate();
  
  // State lưu thông tin hiển thị
  const [userInfo, setUserInfo] = useState({
    fullname: "Admin User",
    role: "Admin"
  });

  const [showDropdown, setShowDropdown] = useState(false);

  // --- LOGIC LẤY TÊN THẬT ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUserInfo({
          fullname: userObj.fullname || userObj.fullName || "User", 
          role: userObj.role === 'admin' ? "Quản trị viên" : "Khách hàng"
        });
      } catch (error) {
        console.error("Lỗi parse user data", error);
      }
    }
  }, []);

  const handleLogout = () => {
    // LƯU Ý: Phải xóa đúng key bạn đã lưu lúc Login
    localStorage.removeItem('accessToken'); // Lúc login bạn lưu là 'accessToken'
    localStorage.removeItem('user'); 
    navigate('/login');
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        {/* SỬA ĐỔI TẠI ĐÂY:
            1. Thay 'justify-between' thành 'justify-end' để đẩy mọi thứ sang phải.
            2. Thêm 'gap-6' để tạo khoảng cách nếu sau này bạn thêm gì đó vào bên trái.
        */}
        <header className="h-16 bg-slate-800 shadow-md flex items-center justify-end gap-6 px-8 sticky top-0 z-40 text-white">
          
          {/* Khu vực User (Chuông + Profile) */}
          <div className="flex items-center gap-6">
            
            {/* Nút thông báo */}
            <button className="relative p-2 text-slate-300 hover:bg-slate-700 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            {/* User Dropdown */}
            <div className="relative">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-700 p-2 rounded-lg transition-all"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-white">
                    {userInfo.fullname}
                  </p>
                  <p className="text-xs text-slate-400">
                    {userInfo.role}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-slate-600 font-bold">
                  {/* Lấy chữ cái đầu */}
                  {userInfo.fullname.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Menu Đăng xuất */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fadeIn text-gray-800 border border-gray-100">
                  <div className="px-4 py-2 border-b text-sm font-bold md:hidden text-gray-700">
                    {userInfo.fullname}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-8 overflow-y-auto h-[calc(100vh-64px)] bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;