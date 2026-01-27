import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { User, Mail, Lock, Loader, ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axiosClient.post('/auth/register', formData);
      const { token, user } = res.data;

      localStorage.setItem('ACCESS_TOKEN', token);
      localStorage.setItem('USER_INFO', JSON.stringify(user));

      alert("Đăng ký thành công!");
      navigate('/'); 

    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-pink-100">
        
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-pink-600 mb-6 transition">
            <ArrowLeft size={16} className="mr-1"/> Trang chủ
        </Link>

        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-pink-600 mb-2">Tạo tài khoản mới</h2>
            <p className="text-gray-500">Tham gia cùng HanHan Bakery ngay hôm nay</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-100 flex items-center">
                ⚠️ {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Họ và tên</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-pink-500 transition" size={20} />
              <input
                type="text"
                name="name"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition bg-gray-50 focus:bg-white"
                placeholder="Nguyễn Văn A"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-pink-500 transition" size={20} />
              <input
                type="email"
                name="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition bg-gray-50 focus:bg-white"
                placeholder="email@example.com"
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">Mật khẩu</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-pink-500 transition" size={20} />
              <input
                type="password"
                name="password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-pink-200 transition transform active:scale-95 flex justify-center items-center"
          >
            {loading ? <Loader className="animate-spin" /> : "Đăng Ký Tài Khoản"}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-pink-600 font-bold hover:underline hover:text-pink-700">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;