import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Image, Trash2, Plus, Eye, EyeOff, UploadCloud } from 'lucide-react';

// Hàm helper hiển thị ảnh
const getImageUrl = (path) => {
    if (!path) return 'https://placehold.co/600x200?text=No+Image';
    if (path.startsWith("http")) return path;
    
    // Xử lý đường dẫn
    let cleanPath = path.replace(/\\/g, "/");
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;
    if (!cleanPath.startsWith("/uploads")) cleanPath = "/uploads" + cleanPath;

    return `http://localhost:5000${cleanPath}`;
};

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // File ảnh được chọn từ máy
  const [preview, setPreview] = useState(null); // Link xem trước

  const fetchBanners = async () => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await axios.get("http://localhost:5000/api/banners/admin", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBanners(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // ✅ 1. Xử lý khi người dùng chọn file từ máy tính
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Tạo URL tạm thời để hiện ảnh xem trước ngay lập tức
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ 2. Gửi file lên server
  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!selectedFile) return alert("Vui lòng chọn ảnh!");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      
      // Phải dùng FormData để gửi file
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", selectedFile); // Gửi file ảnh

      await axios.post("http://localhost:5000/api/banners", formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" // Bắt buộc dòng này
        }
      });

      alert("Thêm banner thành công!");
      // Reset form
      setTitle(''); setDescription(''); setSelectedFile(null); setPreview(null);
      fetchBanners(); 
    } catch (error) {
      alert("Lỗi thêm banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Xóa banner này?")) return;
    try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        await axios.delete(`http://localhost:5000/api/banners/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setBanners(banners.filter(b => b._id !== id));
    } catch (error) { alert("Lỗi xóa banner"); }
  };

  const handleToggle = async (id) => {
    try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        await axios.put(`http://localhost:5000/api/banners/${id}/toggle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchBanners();
    } catch (error) { alert("Lỗi cập nhật"); }
  };

  return (
    <div className="space-y-8">
        {/* Form Thêm Banner */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="text-pink-600"/> Thêm Banner Mới
            </h2>
            <form onSubmit={handleAddBanner} className="flex flex-col md:flex-row gap-6">
                
                {/* ✅ KHUNG UPLOAD ẢNH TỪ MÁY */}
                <div className="w-full md:w-1/3">
                    <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition overflow-hidden bg-gray-50 relative">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-gray-400">
                                <UploadCloud size={32} className="mx-auto mb-2"/>
                                <span className="text-sm font-medium">Bấm để chọn ảnh</span>
                                <span className="text-xs block mt-1">(JPG, PNG, WEBP)</span>
                            </div>
                        )}
                        {/* Input ẩn để chọn file */}
                        <input 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange} 
                            accept="image/*" 
                        />
                    </label>
                </div>

                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề lớn</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-pink-500" placeholder="VD: Vị Ngọt Hạnh Phúc" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-pink-500" placeholder="VD: Giảm giá 20% hôm nay" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <button disabled={loading} type="submit" className="bg-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700 transition w-full md:w-auto flex items-center justify-center gap-2">
                        {loading ? "Đang tải lên..." : <><UploadCloud size={20}/> Lưu Banner</>}
                    </button>
                </div>
            </form>
        </div>

        {/* Danh sách Banner */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Image className="text-blue-600"/> Danh Sách Banner
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map(banner => (
                    <div key={banner._id} className="border rounded-xl overflow-hidden shadow-sm relative group bg-white">
                        <div className="h-40 w-full bg-gray-100 relative">
                            <img 
                                src={getImageUrl(banner.image)} 
                                alt="" 
                                className="w-full h-full object-cover" 
                                onError={(e) => e.target.src = 'https://placehold.co/600x200?text=Lỗi+Ảnh'}
                            />
                            {/* Badge trạng thái */}
                            <div className="absolute top-2 right-2">
                                <span className={`px-2 py-1 text-xs font-bold rounded-full shadow-sm ${banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                                    {banner.isActive ? "Hiển thị" : "Đang ẩn"}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-gray-800 text-lg truncate">{banner.title || "Không tiêu đề"}</h3>
                            <p className="text-sm text-gray-500 mb-4 truncate">{banner.description || "Không mô tả"}</p>
                            
                            <div className="flex gap-3 border-t pt-3">
                                <button onClick={() => handleToggle(banner._id)} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${banner.isActive ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                                    {banner.isActive ? <><EyeOff size={16}/> Ẩn</> : <><Eye size={16}/> Hiện</>}
                                </button>
                                <button onClick={() => handleDelete(banner._id)} className="flex-1 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium flex items-center justify-center gap-2 transition">
                                    <Trash2 size={16}/> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {banners.length === 0 && (
                    <div className="col-span-2 text-center py-10 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                        Chưa có banner nào. Hãy thêm banner mới!
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default BannerManager;