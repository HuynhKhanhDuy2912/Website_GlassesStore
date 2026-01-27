import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Clock, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

// Ảnh demo (Giữ nguyên như bạn đã sửa)
const HERO_BG = "/gt2.jpg";
const STORY_IMG = "/gt3.jpg";

const AboutPage = () => {
  return (
    <div className="bg-white text-gray-800" style={{ fontFamily: "'Nunito', sans-serif" }}>
      
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
          <div className="absolute inset-0 bg-black/50"></div> {/* Tăng độ tối lên 50% cho chữ nổi hơn */}
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <span className="inline-block py-1 px-4 border border-white/60 rounded-full text-sm tracking-[0.2em] uppercase mb-4 backdrop-blur-sm font-semibold">
            Since 2024
          </span>
          <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 leading-tight drop-shadow-xl">
            Nghệ Thuật <br/> <span className="text-pink-400 italic">Bánh Ngọt</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-100 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Chúng tôi không chỉ bán bánh. Chúng tôi trao gửi những khoảnh khắc ngọt ngào nhất đến bàn tiệc của bạn.
          </p>
          <div className="animate-bounce">
            <svg className="w-8 h-8 mx-auto text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
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
                <img src={STORY_IMG} alt="Making cakes" className="w-full h-[500px] object-cover" />
              </div>
              {/* Decor elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
              
              {/* Floating Card */}
              <div className="absolute bottom-8 right-[-10px] md:right-[-30px] z-20 bg-white p-6 rounded-xl shadow-xl border-l-4 border-pink-500 max-w-xs hidden md:block">
                <p className="text-gray-600 italic text-sm font-medium">
                  "Chất lượng là danh dự. Chúng tôi không bao giờ thỏa hiệp với những nguyên liệu kém phẩm chất."
                </p>
              </div>
            </div>

            {/* Cột Text */}
            <div className="w-full lg:w-1/2 lg:pl-10">
              <h4 className="text-pink-600 font-bold uppercase tracking-wide text-sm mb-3">Câu chuyện của chúng tôi</h4>
              <h2 className="text-4xl font-bold font-heading text-gray-900 mb-6">Đánh Thức Vị Giác Bằng Sự Tinh Tế</h2>
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                HanHan Bakery khởi đầu từ một căn bếp nhỏ với niềm đam mê cháy bỏng về nghệ thuật làm bánh Âu. Chúng tôi nhận thấy rằng, chiếc bánh ngon không chỉ nằm ở công thức, mà còn ở <b>cảm xúc</b> của người làm bánh đặt vào trong đó.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "100% Nguyên liệu tự nhiên (Organic)",
                  "Không chất bảo quản - Tươi mới mỗi ngày",
                  "Công thức độc quyền ít ngọt, tốt cho sức khỏe"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                    <CheckCircle2 className="text-green-500 flex-shrink-0" size={24} />
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
            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2 font-heading">1+</div>
            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Năm Kinh Nghiệm</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2 font-heading">50+</div>
            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Món Bánh Đa Dạng</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2 font-heading">500+</div>
            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Khách Hàng Hài Lòng</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2 font-heading">99%</div>
            <div className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Đánh Giá 5 Sao</div>
          </div>
        </div>
      </div>

      {/* 4. CAM KẾT VÀNG */}
      <div className="py-24 bg-pink-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Giá Trị Cốt Lõi</h2>
            <p className="text-gray-600 text-lg">
              Điều gì khiến HanHan Bakery trở nên khác biệt so với hàng ngàn tiệm bánh ngoài kia?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6 mx-auto">
                <ShieldCheck size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">An Toàn Tuyệt Đối</h3>
              <p className="text-gray-500 leading-relaxed text-center">
                Quy trình sản xuất khép kín, đạt chuẩn vệ sinh an toàn thực phẩm. Chúng tôi nói "KHÔNG" với phụ gia độc hại.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-6 mx-auto">
                <Award size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Chất Lượng Thượng Hạng</h3>
              <p className="text-gray-500 leading-relaxed text-center">
                Sử dụng bơ Pháp, chocolate Bỉ và trái cây tươi Đà Lạt. Mỗi nguyên liệu đều được tuyển chọn kỹ lưỡng.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-2 transition duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 mx-auto">
                <Heart size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Phục Vụ Từ Tâm</h3>
              <p className="text-gray-500 leading-relaxed text-center">
                Mỗi chiếc bánh là một tác phẩm nghệ thuật. Chúng tôi làm bánh như làm cho chính người thân của mình ăn.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. IMAGE STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <img src="/gt5.jpg" alt="Cake 1" className="w-full h-64 object-cover hover:opacity-90 transition cursor-pointer" />
        <img src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000&auto=format&fit=crop" alt="Cake 2" className="w-full h-64 object-cover hover:opacity-90 transition cursor-pointer" />
        <img src="https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=1000&auto=format&fit=crop" alt="Cake 3" className="w-full h-64 object-cover hover:opacity-90 transition cursor-pointer" />
        <img src="https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?q=80&w=1000&auto=format&fit=crop" alt="Cake 4" className="w-full h-64 object-cover hover:opacity-90 transition cursor-pointer" />
      </div>

      {/* 6. CTA FINAL */}
      <div className="py-20 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 font-heading">Sẵn sàng cho bữa tiệc ngọt ngào?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto text-lg">
            Hàng trăm mẫu bánh đẹp mắt và ngon miệng đang chờ bạn khám phá. Đặt ngay hôm nay để nhận ưu đãi!
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/san-pham" 
              className="inline-flex items-center gap-2 bg-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-700 transition shadow-lg hover:shadow-pink-200"
            >
              Xem Menu <ArrowRight size={20} />
            </Link>
            <Link 
              to="/lien-he" 
              className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition"
            >
              Liên Hệ Tư Vấn
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;