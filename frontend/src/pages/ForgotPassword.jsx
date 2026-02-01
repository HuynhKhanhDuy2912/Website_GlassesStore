import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Loader, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const BACKENDURL = import.meta.env.VITE_BECKEND_API_URL||"http://localhost:5000/api";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setStatus({ type: 'error', msg: 'Mật khẩu nhập lại không khớp!' });
        }

        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            const res = await axios.put(`${BACKENDURL}/auth/reset-password-direct`, {
                email: formData.email,
                password: formData.password
            });
            
            setStatus({ type: 'success', msg: 'Mật khẩu đã được đổi thành công!' });
            // Sau 2 giây tự chuyển về trang login
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.message || 'Có lỗi xảy ra' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50/30 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-blue-100">
                <Link to="/login" className="inline-flex items-center text-gray-400 hover:text-blue-600 mb-6 transition">
                    <ArrowLeft size={16} className="mr-1"/> Quay lại đăng nhập
                </Link>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt lại mật khẩu</h2>
                <p className="text-gray-500 mb-6 text-sm">Nhập email và mật khẩu mới của bạn để cập nhật.</p>

                {status.msg && (
                    <div className={`p-4 rounded-lg mb-6 text-sm flex items-center gap-2 ${
                        status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                        {status.type === 'success' ? <CheckCircle size={16}/> : '⚠️'} {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email tài khoản</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gray-300" size={18} />
                            <input name="email" type="email" required className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:border-blue-500 outline-none transition bg-gray-50" placeholder="example@gmail.com" onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Mật khẩu mới</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-300" size={18} />
                            <input name="password" type="password" required className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:border-blue-500 outline-none transition bg-gray-50" placeholder="••••••••" onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Xác nhận mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-300" size={18} />
                            <input name="confirmPassword" type="password" required className="w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl focus:border-blue-500 outline-none transition bg-gray-50" placeholder="••••••••" onChange={handleChange} />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition active:scale-[0.98] flex justify-center items-center gap-2">
                        {loading ? <Loader className="animate-spin" size={20} /> : "Cập nhật mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;