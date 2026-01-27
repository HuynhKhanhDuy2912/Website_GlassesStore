import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, MapPin, Save, Camera } from 'lucide-react';
// ✅ 1. Import useNavigate
import { useNavigate } from 'react-router-dom';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:5000${cleanPath}`;
};

const ProfilePage = () => {
  const navigate = useNavigate(); // ✅ 2. Khai báo hook
  
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: ''
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("USER_INFO");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserInfo({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const formData = new FormData();
      formData.append('name', userInfo.name);
      formData.append('phone', userInfo.phone);
      formData.append('address', userInfo.address);
      if (selectedFile) {
          formData.append('avatar', selectedFile); 
      }

      const config = {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      };

      const { data } = await axios.put(
        "http://localhost:5000/api/users/profile",
        formData,
        config
      );

      // 1. Lưu vào LocalStorage
      localStorage.setItem("USER_INFO", JSON.stringify(data));
      
      // ✅ 2. QUAN TRỌNG: Bắn tín hiệu cho App.js biết để cập nhật Avatar ngay
      window.dispatchEvent(new Event("USER_INFO_UPDATED"));

      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      
      // ✅ 3. Chuyển hướng về Trang chủ sau 1.5s
      setTimeout(() => {
        navigate("/"); 
      }, 1500);

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Lỗi cập nhật, vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // ... (Phần return giao diện giữ nguyên như cũ)
  return (
    <div className="container mx-auto px-4 py-10 min-h-[80vh]">
        {/* ... Code giao diện form giữ nguyên ... */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
            {/* Header Form */}
            <div className="bg-pink-600 px-6 py-4">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <User /> Hồ sơ cá nhân
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Avatar Upload */}
                <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : userInfo.avatarUrl ? (
                                <img src={getImageUrl(userInfo.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-gray-400" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-pink-600 text-white p-2 rounded-full cursor-pointer hover:bg-pink-700 transition shadow-sm border-2 border-white">
                            <Camera size={18} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                        </label>
                    </div>
                    <p className="text-sm text-gray-500">Nhấn vào icon máy ảnh để đổi avatar</p>
                </div>

                {/* Các ô input Name, Phone, Address giữ nguyên như cũ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input type="text" name="name" required value={userInfo.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" value={userInfo.email} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input type="text" name="phone" value={userInfo.phone} onChange={handleChange} placeholder="Nhập số điện thoại..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"/>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng mặc định</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <textarea name="address" value={userInfo.address} onChange={handleChange} placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM" rows="3" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"></textarea>
                        </div>
                    </div>
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-3 rounded-lg text-sm text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* Button Submit */}
                <button type="submit" disabled={loading} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2">
                    {loading ? 'Đang lưu...' : <><Save size={20} /> Lưu thay đổi</>}
                </button>
            </form>
        </div>
    </div>
  );
};

export default ProfilePage;