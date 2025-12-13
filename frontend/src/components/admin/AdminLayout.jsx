import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, User, LogOut } from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  
  // State lưu thông tin hiển thị
  const [userInfo, setUserInfo] = useState({
    fullname: "Admin User", // Tên mặc định nếu chưa load được
    role: "Admin"
  });

  const [showDropdown, setShowDropdown] = useState(false);

  // --- LOGIC LẤY TÊN THẬT ---
  useEffect(() => {
    // 1. Lấy chuỗi JSON từ localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        // 2. Chuyển chuỗi JSON thành Object
        const userObj = JSON.parse(storedUser);
        
        // 3. Cập nhật vào State
        // Lưu ý: Kiểm tra kỹ xem backend trả về là 'fullname' hay 'fullName'
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
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Xóa luôn thông tin user
    navigate('/login'); // Chuyển về trang login (cần đảm bảo route này tồn tại)
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64 flex flex-col">
        {/* Header màu Xám Xanh (Lạnh) */}
        <header className="h-16 bg-slate-800 shadow-md flex items-center justify-between px-8 sticky top-0 z-40 text-white">
          


          {/* Khu vực User */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-300 hover:bg-slate-700 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
            
            <div className="relative">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-700 p-2 rounded-lg transition-all"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="text-right hidden md:block">
                  {/* --- HIỂN THỊ TÊN THẬT Ở ĐÂY --- */}
                  <p className="text-sm font-semibold text-white">
                    {userInfo.fullname}
                  </p>
                  <p className="text-xs text-slate-400">
                    {userInfo.role}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-slate-600 font-bold">
                  {/* Lấy chữ cái đầu tiên của tên để làm Avatar */}
                  {userInfo.fullname.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Menu Đăng xuất */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fadeIn text-gray-800">
                  <div className="px-4 py-2 border-b text-sm font-bold md:hidden">
                    {userInfo.fullname}
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
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