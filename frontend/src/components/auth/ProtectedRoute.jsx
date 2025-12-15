import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('accessToken');
  
  const userStr = localStorage.getItem('user');

  let user = null;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      console.error("Dữ liệu user lỗi, reset...", error);
      
      // 2. SỬA LẠI KEY KHI XÓA:
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }

  // 3. Logic chặn
  if (!token || !user) {
    // Nếu không có token -> Về Login
    return <Navigate to="/login" replace />;
  }

  // 4. Kiểm tra quyền (Role)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Nếu Admin đi lạc vào trang Shop -> OK (cho qua hoặc tùy bạn)
    // Nếu Customer cố vào trang Admin -> Đá về Shop
    return <Navigate to="/shop" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;