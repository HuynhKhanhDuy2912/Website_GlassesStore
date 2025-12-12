import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  // 1. Lấy dữ liệu thô từ LocalStorage trước
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user'); // Lấy chuỗi trước, chưa parse vội

  let user = null;

  // 2. Parse an toàn bằng try-catch
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      // Nếu dữ liệu bị lỗi (ví dụ: "undefined"), xóa luôn để tránh lỗi vòng lặp
      console.error("Dữ liệu user trong LocalStorage bị lỗi, đang reset...", error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }
  }

  // 3. Nếu không có token hoặc không parse được user -> Đá về Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 4. Kiểm tra quyền (Role)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Nếu cố vào trang admin mà chỉ là user -> Đẩy về trang shop
    return <Navigate to="/shop" replace />;
  }

  // 5. Hợp lệ -> Cho đi tiếp
  return <Outlet />;
};

export default ProtectedRoute;