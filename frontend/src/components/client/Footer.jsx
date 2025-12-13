import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, ShoppingBag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Cột 1: Thông tin thương hiệu */}
          <div>
            <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
              <ShoppingBag className="text-blue-500" /> GlassesStore
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 mb-6">
              Chuyên cung cấp các loại kính mắt thời trang, kính cận, kính râm chính hãng với chất lượng tốt nhất và giá cả hợp lý.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Liên kết nhanh</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-blue-500 transition">Trang chủ</Link></li>
              <li><Link to="/shop" className="hover:text-blue-500 transition">Cửa hàng</Link></li>
              <li><Link to="/about" className="hover:text-blue-500 transition">Về chúng tôi</Link></li>
              <li><Link to="/blog" className="hover:text-blue-500 transition">Tin tức</Link></li>
              <li><Link to="/contact" className="hover:text-blue-500 transition">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Chính sách</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/policy" className="hover:text-blue-500 transition">Chính sách bảo mật</Link></li>
              <li><Link to="/shipping" className="hover:text-blue-500 transition">Chính sách vận chuyển</Link></li>
              <li><Link to="/return" className="hover:text-blue-500 transition">Chính sách đổi trả</Link></li>
              <li><Link to="/faq" className="hover:text-blue-500 transition">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Liên hệ</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <span>123 Đường ABC, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-blue-500 shrink-0" />
                <span>0901 234 567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-blue-500 shrink-0" />
                <span>support@glassesstore.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền */}
        <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} GlassesStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;