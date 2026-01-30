import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-auto border-t border-slate-800">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        
        {/* Cột 1: Giới thiệu & Brand */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            DHD <span className="text-blue-500">- GlassesShop</span>
          </h3>
          <p className="text-sm leading-relaxed">
            Chuyên gia chăm sóc thị lực và cung cấp các dòng mắt kính thời trang cao cấp. Chúng tôi cam kết mang lại tầm nhìn hoàn hảo nhất cho bạn.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 transition-colors">
              <Facebook size={18} className="text-white" />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-orange-600 transition-colors">
              <Instagram size={18} className="text-white" />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-red-600 transition-colors">
              <Youtube size={18} className="text-white" />
            </a>
          </div>
        </div>

        {/* Cột 2: Khám phá */}
        <div>
          <h4 className="font-semibold text-white text-lg mb-6 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-blue-500">
            Khám Phá
          </h4>
          <ul className="space-y-3 text-sm">
            <li><Link to="/san-pham" className="hover:text-blue-400 transition-colors">Mắt kính Nam</Link></li>
            <li><Link to="/san-pham" className="hover:text-blue-400 transition-colors">Mắt kính Nữ</Link></li>
            <li><Link to="/san-pham" className="hover:text-blue-400 transition-colors">Gọng kính tròn</Link></li>
            <li><Link to="/san-pham" className="hover:text-blue-400 transition-colors">Gọng kính vuông </Link></li>
          </ul>
        </div>

        {/* Cột 3: Chính sách */}
        <div>
          <h4 className="font-semibold text-white text-lg mb-6 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-blue-500">
            Hỗ Trợ
          </h4>
          <ul className="space-y-3 text-sm">
            <li> <Link to="/lien-he" className="hover:text-blue-400 transition-colors">Liên hệ</Link></li>
            <li> <Link to="/gioi-thieu" className="hover:text-blue-400 transition-colors">Giới thiệu</Link></li>
            <li className="hover:text-blue-400 transition-colors">Chính sách bảo hành</li>
            <li className="hover:text-blue-400 transition-colors">Hướng dẫn chọn kính</li>
          </ul>
        </div>

        {/* Cột 4: Thông tin liên lạc */}
        <div>
          <h4 className="font-semibold text-white text-lg mb-6 relative after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-8 after:h-1 after:bg-blue-500">
            Liên Hệ
          </h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={20} className="text-blue-500 shrink-0" />
              <span>Số 126 Nguyễn Thiện Thành, P. Hòa Thuận, Vĩnh Long, Việt Nam</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={20} className="text-blue-500 shrink-0" />
              <span>099 999 9999</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={20} className="text-blue-500 shrink-0" />
              <span>contact@dhdglassesshop.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Phần Copyright & Payment */}
      <div className="border-t border-slate-800 pt-8 mt-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 DHD - GlassesShop. Phát triển bởi Đội ngũ DHD.</p>
          <div className="flex items-center gap-2 border border-slate-700 px-3 py-1 rounded-md">
            <ShieldCheck size={14} className="text-green-500" />
            <span>Website chính thức & Bảo mật</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;