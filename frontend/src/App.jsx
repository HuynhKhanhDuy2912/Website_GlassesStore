import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Package,
  LayoutDashboard,
} from "lucide-react";
import axios from "axios";

// Các trang
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OrderSuccess from "./components/OrderSuccess";

// Admin
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductManager from "./pages/admin/ProductManager";
import CategoryManager from "./pages/admin/CategoryManager";
import OrderManager from "./pages/admin/OrderManager";
import ContactManager from "./pages/admin/ContactManager";
import UserManagement from "./pages/admin/UserManagement";
import ReviewManager from "./pages/admin/ReviewManager";
import BannerManager from "./pages/admin/BannerManager";
import FlashSaleManager from "./pages/admin/FlashSaleManager";

//1. IMPORT FOOTER VỪA TẠO
import Footer from "./components/Footer";

const BACKENDURL = import.meta.env.VITE_BECKEND_API_URL||"http://localhost:5000/api";
// Hàm xử lý ảnh
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  let cleanPath = path.replace(/\\/g, "/");
  if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
  if (!cleanPath.startsWith("/uploads")) cleanPath = "/uploads" + cleanPath;
  return `http://localhost:5000${cleanPath}`;
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem("USER_INFO");
    if (stored && stored !== "undefined") {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [cartCount, setCartCount] = useState(0);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  const fetchCartCount = async () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (!token) {
      setCartCount(0);
      return;
    }

    try {
      const res = await axios.get(`${BACKENDURL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const items = res.data.items || [];

      setCartCount(items.length);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setCartCount(0);
      }
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("USER_INFO");
    if (stored && stored !== "undefined") {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        if (
          user.role === "admin" &&
          (location.pathname === "/login" || location.pathname === "/register")
        ) {
          navigate("/admin", { replace: true });
        }
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
    setCheckingAuth(false);
  }, [location, navigate]);

  useEffect(() => {
    const handleUserUpdate = () => {
      const stored = localStorage.getItem("USER_INFO");
      if (stored) setCurrentUser(JSON.parse(stored));
    };
    window.addEventListener("USER_INFO_UPDATED", handleUserUpdate);
    return () =>
      window.removeEventListener("USER_INFO_UPDATED", handleUserUpdate);
  }, []);

  useEffect(() => {
    fetchCartCount();
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener("CART_UPDATED", handleCartUpdate);
    return () => window.removeEventListener("CART_UPDATED", handleCartUpdate);
  }, [currentUser]);

  const AdminRoute = ({ children }) => {
    if (checkingAuth)
      return <div className="text-center py-20">Đang kiểm tra quyền...</div>;
    if (!currentUser || currentUser.role !== "admin")
      return <Navigate to="/" replace />;
    return children;
  };

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("USER_INFO");
    setCurrentUser(null);
    setCartCount(0);
    navigate("/login");
  };

  return (
    <div className="font-sans text-gray-800 bg-gray-50 min-h-screen flex flex-col">
      {!isAdminPage && (
        <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-blue-100">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-800 flex items-center gap-2"
            >
              DHD - GlassesShop
            </Link>

            <div className="hidden md:flex space-x-8 font-medium text-blue-800 text-lg">
              <Link to="/" className="hover:text-blue-600 transition">
                Trang chủ
              </Link>
              <Link to="/san-pham" className="hover:text-blue-600 transition">
                Sản phẩm
              </Link>
              <Link to="/gioi-thieu" className="hover:text-blue-600 transition">
                Giới thiệu
              </Link>
              <Link to="/lien-he" className="hover:text-blue-600 transition">
                Liên hệ
              </Link>
            </div>

            <div className="flex items-center space-x-6 text-dark">
              <Link
                to="/cart"
                className="relative hover:text-blue-600 transition"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white animate-bounce-short">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              <div className="relative group">
                {/* ===== TRIGGER ===== */}
                <button className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition hover:shadow-md hover:text-blue-600">
                  {currentUser ? (
                    <>
                      <span className="text-sm font-semibold text-dark max-w-[110px] truncate hidden md:block">
                        {currentUser.name}
                      </span>

                      <div className="w-9 h-9 rounded-full bg-gray-100 border flex items-center justify-center overflow-hidden">
                        {currentUser.avatarUrl ? (
                          <img
                            src={getImageUrl(currentUser.avatarUrl)}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://via.placeholder.com/150?text=User";
                            }}
                          />
                        ) : (
                          <User size={18} className="text-gray-500" />
                        )}
                      </div>
                    </>
                  ) : (
                    <User className="w-6 h-6 text-gray-600" />
                  )}
                </button>

                {/* ===== DROPDOWN ===== */}
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 
                  invisible opacity-0 group-hover:visible group-hover:opacity-100 
                  transition-all duration-200 z-50"
                >
                  <div className="p-2 flex flex-col gap-1">
                    {currentUser ? (
                      <>
                        {/* ACCOUNT INFO */}
                        <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 mb-1">
                          Tài khoản
                          <span className="block text-sm text-gray-700 font-medium truncate">
                            {currentUser.email}
                          </span>
                        </div>

                        {/* PROFILE */}
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                       text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                        >
                          <User size={18} />
                          Hồ sơ cá nhân
                        </Link>

                        {/* ADMIN */}
                        {currentUser.role === "admin" && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                         text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                          >
                            <LayoutDashboard size={18} />
                            Trang quản trị
                          </Link>
                        )}

                        {/* ORDERS */}
                        {currentUser.role !== "admin" && (
                          <Link
                            to="/my-orders"
                            className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                         text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                          >
                            <Package size={18} />
                            Đơn hàng của tôi
                          </Link>
                        )}

                        {/* LOGOUT */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                       text-red-600 hover:bg-red-50 transition font-medium"
                        >
                          <LogOut size={18} />
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                       text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                        >
                          <LogIn size={18} />
                          Đăng nhập
                        </Link>

                        <Link
                          to="/register"
                          className="flex items-center gap-3 px-4 py-2 text-sm rounded-lg
                       text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                        >
                          <UserPlus size={18} />
                          Đăng ký
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/san-pham" element={<ProductPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/order/:id" element={<OrderDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/profile"
            element={currentUser ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/login"
            element={<Login setCurrentUser={setCurrentUser} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/order/success" element={<OrderSuccess />} />

          {/* <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}> */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="orders" element={<OrderManager />} />
            <Route path="contacts" element={<ContactManager />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="reviews" element={<ReviewManager />} />
            <Route path="banners" element={<BannerManager />} />
            <Route path="flash-sale" element={<FlashSaleManager />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="text-center py-20">
                404 - Không tìm thấy trang
              </div>
            }
          />
        </Routes>
      </div>

      {!isAdminPage && <Footer />}
    </div>
  );
}

export default App;
