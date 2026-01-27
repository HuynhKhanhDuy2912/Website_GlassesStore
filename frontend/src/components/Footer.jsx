import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6 mt-auto border-t border-gray-100">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 mb-8">
            <div>
                <h3 className="text-2xl font-bold text-pink-500 mb-4">HanHan Bakery</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Nơi gửi gắm yêu thương qua từng chiếc bánh ngọt ngào.
                </p>
            </div>
            <div>
                <h4 className="font-bold text-lg mb-4">Liên Kết Nhanh</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li><Link to="/" className="hover:text-pink-500">Trang chủ</Link></li>
                    <li><Link to="/san-pham" className="hover:text-pink-500">Thực đơn bánh</Link></li>
                    <li><Link to="/gioi-thieu" className="hover:text-pink-500">Giới thiệu</Link></li>
                    <li><Link to="/lien-he" className="hover:text-pink-500">Liên hệ</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-lg mb-4">Liên Hệ</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li>📍 Số 126 Nguyễn Thiện Thành, khóm 4, phường Hòa Thuận, Vĩnh Long, Việt Nam</li>
                    <li>📞 099 999 9999</li>
                    <li>✉️ contact@hanhanbakery.com</li>
                </ul>
            </div>
        </div>
        <div className="border-t border-gray-800 text-center pt-6 text-gray-500 text-sm">
            © 2025 HanHan Bakery. All rights reserved.
        </div>
    </footer>
  );
};

export default Footer;