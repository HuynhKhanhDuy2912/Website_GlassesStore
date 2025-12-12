import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus, User, Mail, Lock, Phone } from 'lucide-react';
import userApi from '../../api/userApi';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra mật khẩu khớp nhau
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Mật khẩu xác nhận không khớp!");
    }

    setLoading(true);
    try {
      // 2. Chuẩn bị dữ liệu gửi đi
      // Lưu ý: role mặc định là customer để an toàn
      const dataToSend = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'customer' 
      };

      // 3. Gọi API tạo user
      await userApi.create(dataToSend);
      
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login'); // Chuyển sang trang login

    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Tạo tài khoản</h1>
          <p className="text-slate-500 mt-2">Tham gia cùng chúng tôi ngay hôm nay</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                name="fullName"
                required
                className="w-full pl-10 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nguyễn Văn A"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="email"
                name="email"
                required
                className="w-full pl-10 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="email@example.com"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                name="phone"
                className="w-full pl-10 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0901234567"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                name="password"
                required
                className="w-full pl-10 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full pl-10 p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Đang xử lý...' : <><UserPlus size={20} /> Đăng ký</>}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;