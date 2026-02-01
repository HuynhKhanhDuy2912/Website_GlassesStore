import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Eye,
} from "lucide-react";

import heroBg from "@/assets/img/banner_about.jpg";
import storyImg from "@/assets/img/banner_about1.jpg";

import about1 from "@/assets/img/about1.jpg";
import about2 from "@/assets/img/about2.jpg";
import about3 from "@/assets/img/about3.jpg";
import about4 from "@/assets/img/about4.jpg";

// Giữ nguyên format ảnh như bạn yêu cầu
const HERO_BG = heroBg;
const STORY_IMG = storyImg;

const AboutPage = () => {
  return (
    <div
      className="bg-white text-gray-800"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {/* --- NẠP FONT CHỮ TRỰC TIẾP TỪ GOOGLE FONTS --- */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
          .font-heading { font-family: 'Playfair Display', serif; }
        `}
      </style>

      {/* 1. HERO SECTION: PREMIUM LOOK */}
      <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <span className="inline-block py-1 px-4 border border-white/60 rounded-full text-sm tracking-[0.2em] uppercase mb-4 backdrop-blur-sm font-semibold">
            DHD Glasses Shop Since 2024
          </span>
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 leading-tight drop-shadow-xl">
            Khơi Nguồn <br />{" "}
            <span className="text-blue-400 italic">Tầm Nhìn Mới</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-100 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Chúng tôi không chỉ bán mắt kính. Chúng tôi mang đến sự tự tin và
            bảo vệ đôi mắt của bạn bằng những công nghệ tiên tiến nhất.
          </p>
          <div className="animate-bounce">
            <svg
              className="w-8 h-8 mx-auto text-white opacity-80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* 2. CÂU CHUYỆN & SỨ MỆNH */}
      <div className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16 relative">
            {/* Cột Ảnh */}
            <div className="w-full lg:w-1/2 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition duration-500">
                <img
                  src={STORY_IMG}
                  alt="Eyewear Craftsmanship"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              {/* Decor elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>

              {/* Floating Card */}
              <div className="absolute bottom-8 right-[-10px] md:right-[-30px] z-20 bg-white p-6 rounded-xl shadow-xl border-l-4 border-blue-500 max-w-xs hidden md:block">
                <p className="text-gray-600 italic text-sm font-medium">
                  "Thị lực của bạn là ưu tiên hàng đầu. Chúng tôi kết hợp giữa
                  thời trang thượng lưu và công nghệ bảo vệ mắt tối ưu."
                </p>
              </div>
            </div>

            {/* Cột Text */}
            <div className="w-full lg:w-1/2 lg:pl-10">
              <h4 className="text-blue-600 font-bold uppercase tracking-wide text-sm mb-3">
                Về DHD Glasses
              </h4>
              <h2 className="text-4xl font-bold font-heading text-gray-900 mb-6">
                Định Hình Phong Cách Qua Đôi Mắt
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                DHD Glasses ra đời từ tâm huyết mang lại giải pháp thị lực hoàn
                hảo. Chúng tôi hiểu rằng, một chiếc mắt kính tốt không chỉ giúp
                bạn nhìn rõ hơn, mà còn là <b>phụ kiện khẳng định bản sắc</b> và
                gu thẩm mỹ riêng biệt của mỗi cá nhân.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Tròng kính chính hãng chống tia UV400 & Ánh sáng xanh",
                  "Gọng kính chất liệu cao cấp (Titanium, Acetate, Berylium)",
                  "Đo khám mắt miễn phí với trang thiết bị hiện đại",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-gray-700 font-medium"
                  >
                    <CheckCircle2
                      className="text-blue-500 flex-shrink-0"
                      size={24}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. THỐNG KÊ (Stats Section) */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-700/50">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2 font-heading">
              2+
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">
              Năm Phát Triển
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2 font-heading">
              1000+
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">
              Mẫu Kính Thời Trang
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2 font-heading">
              5000+
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">
              Khách Hàng Tin Dùng
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2 font-heading">
              4.9/5
            </div>
            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">
              Đánh Giá Hài Lòng
            </div>
          </div>
        </div>
      </div>

      {/* 4. GIÁ TRỊ CỐT LÕI */}
      <div className="py-24 bg-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">
              Cam Kết Từ DHD Glasses
            </h2>
            <p className="text-gray-600 text-lg">
              Sự tin tưởng của khách hàng là kim chỉ nam cho mọi hoạt động của
              chúng tôi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
                <ShieldCheck size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">
                Bảo Hành Chính Hãng
              </h3>
              <p className="text-gray-500 leading-relaxed text-center">
                Cam kết 100% sản phẩm chính hãng. Chính sách bảo hành thay mới
                phụ kiện và hiệu chỉnh gọng kính trọn đời.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
                <Eye size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">
                Công Nghệ Hiện Đại
              </h3>
              <p className="text-gray-500 leading-relaxed text-center">
                Trang thiết bị đo mắt tự động thế hệ mới nhất, đảm bảo độ chính
                xác tuyệt đối cho thị lực của bạn.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
                <Heart size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">
                Tư Vấn Tận Tâm
              </h3>
              <p className="text-gray-500 leading-relaxed text-center">
                Đội ngũ kỹ thuật viên giàu kinh nghiệm tư vấn mẫu kính phù hợp
                nhất với khuôn mặt và nhu cầu sử dụng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. IMAGE STRIP (Giữ nguyên các thẻ img như yêu cầu) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <img
          src={about1}
          className="w-full h-64 object-cover hover:opacity-90 transition cursor-pointer"
        />
        <img
          src={about2}
          className="w-full h-64 object-cover hover:opacity-90 transition cursor-pointer"
        />
        <img
          src={about3}
          className="w-full h-64 object-cover hover:opacity-90 transition cursor-pointer"
        />
        <img
          src={about4}
          className="w-full h-64 object-cover hover:opacity-90 transition cursor-pointer"
        />
      </div>

      {/* 6. CTA FINAL */}
      <div className="py-20 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading">
            Tìm Kiếm Cặp Kính Hoàn Hảo Của Bạn?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto text-lg">
            Hàng ngàn mẫu kính thời trang từ các thương hiệu hàng đầu thế giới
            đang chờ bạn khám phá tại DHD Glasses.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/san-pham"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200"
            >
              Khám Phá Bộ Sưu Tập <ArrowRight size={20} />
            </Link>
            <Link
              to="/lien-he"
              className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition"
            >
              Liên Hệ Với Chúng Tôi <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
