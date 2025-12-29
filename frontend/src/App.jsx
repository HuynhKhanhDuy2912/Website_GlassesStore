import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from './context/CartContext';
import 'react-toastify/dist/ReactToastify.css';

// Auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './components/admin/Dashboard';
import UserManager from './components/admin/UserManager';
import BrandManager from './components/admin/BrandManager';
import CategoryManager from './components/admin/CategoryManager';
import ProductManager from './components/admin/ProductManager';
import OrderManager from './components/admin/OrderManager';
import OrderDetail from './components/admin/OrderDetailPage';
import Contact from './components/admin/ContactManager';
import Payment from './components/admin/PaymentManager';
import Review from './components/admin/ReviewManager';
// Client (Shop)
import ClientLayout from './components/client/ClientLayout';
import ShopPage from './components/client/ShopPage';
import CartPage from './components/client/CartPage';
import CheckoutPage from './components/client/CheckoutPage';
import OrderHistoryPage from './components/client/OrderHistoryPage';
import ClientOrderDetailPage from './components/client/ClientOrderDetailPage';
import ContactPage from './components/client/ContactPage';
import ProductDetailPage from './components/client/ProductDetailPage';
function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          {/* 1. Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Redirect trang chủ về Shop */}
          <Route path="/" element={<Navigate to="/shop" replace />} />

          {/* 2. KHU VỰC CLIENT (Cần đăng nhập - hoặc tùy bạn chỉnh public) */}
          {/* Bọc ProtectedRoute trước, sau đó bọc ClientLayout */}

          <Route element={<ProtectedRoute allowedRoles={['customer', 'admin']} />}>

            <Route element={<ClientLayout />}>
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/my-orders" element={<OrderHistoryPage />} />
              <Route path="/my-orders/:id" element={<ClientOrderDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
            </Route>

          </Route>


          {/* 3. KHU VỰC ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserManager />} />
              <Route path="order" element={<OrderManager />} />
              <Route path="order/:id" element={<OrderDetail />} />
              <Route path="category" element={<CategoryManager />} />
              <Route path="brands" element={<BrandManager />} />
              <Route path="product" element={<ProductManager />} />
              <Route path="contact" element={<Contact />} />
              <Route path="payment" element={<Payment />} />
              <Route path="review" element={<Review />} />
            </Route>
          </Route>

          {/* 4. Not Found */}
          <Route path="*" element={<div className="text-center mt-20 text-xl font-bold text-gray-500">404 - Trang không tồn tại</div>} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;