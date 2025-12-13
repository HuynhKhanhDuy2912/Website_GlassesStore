import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import UserManager from './components/admin/UserManager';
import BrandManager from './components/admin/BrandManeger';

// Shop (User Interface)
import ShopLayout from './components/shop/ShopLayout';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Routes>
        {/* 1. Route Public (Ai cũng vào được) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 2. Mặc định vào "/" sẽ đẩy về trang Login (hoặc Shop nếu đã login - xử lý ở Login page) */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 3. KHU VỰC SHOP (Dành cho User đã đăng nhập & Admin) */}
        <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>
          <Route path="/shop" element={<ShopLayout />}>
             {/* Tại đây bạn sẽ thêm các trang con như Home, ProductDetail... */}
             <Route index element={<div>Trang chủ bán hàng (Danh sách kính mắt)</div>} />
             <Route path="profile" element={<div>Trang thông tin cá nhân</div>} />
          </Route>
        </Route>

        {/* 4. KHU VỰC ADMIN (Chỉ dành cho Admin) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManager />} />
            <Route path="orders" element={<div>Quản lý đơn hàng</div>} />
            <Route path="products" element={<div>Quản lý sản phẩm</div>} />
            <Route path="brands" element={<BrandManager />} />
          </Route>
        </Route>

        {/* 5. Route 404 */}
        <Route path="*" element={<div className="text-center mt-10">404 - Không tìm thấy trang</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;