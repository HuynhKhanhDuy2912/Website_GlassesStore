import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Layers,
  LogOut,
  Home,
  Package,
  Mail,
  Users,
  Star,
  Image,
  Zap,
} from "lucide-react";

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/admin", icon: <LayoutDashboard size={20} />, label: "Báo cáo Thống kê" },    
    { path: "/admin/users", icon: <Users size={20} />, label: "Quản lý Người dùng" },
    { path: "/admin/categories", icon: <Layers size={20} />, label: "Quản lý Danh mục" },
    { path: "/admin/products", icon: <ShoppingBag size={20} />, label: "Quản lý Sản phẩm" },
    { path: "/admin/orders", icon: <Package size={20} />, label: "Quản lý Đơn hàng" },
    { path: "/admin/flash-sale", icon: <Zap size={20} />, label: "Quản lý Flash Sale" },
    { path: "/admin/reviews", icon: <Star size={20} />, label: "Quản lý Đánh giá" },
    { path: "/admin/banners", icon: <Image size={20} />, label: "Quản lý Banner" },
    { path: "/admin/contacts", icon: <Mail size={20} />, label: "Quản lý Liên hệ" },
    { action: "logout", icon: <LogOut size={20} />, label: "Đăng xuất", danger: true },
  ];

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("USER_INFO");
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="h-16 flex items-center justify-center font-bold text-2xl border-b border-slate-800 text-blue-500">
          <Link to="/"> DHD - GlassesShop </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item, index) => {

            if (item.action === "logout") {
              return (
                <button
                  key={index}
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition w-full text-left"
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            }

            const isActive =
              (item.path === "/admin" && location.pathname === "/admin") ||
              (item.path !== "/admin" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
