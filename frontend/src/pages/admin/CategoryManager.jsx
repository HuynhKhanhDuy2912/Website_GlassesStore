import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  Plus,
  List,
  Loader,
  Edit,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

const API_URL = "http://localhost:5000";

// Cấu hình Axios
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

// Thêm interceptor để tự động gửi token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", image: "" });
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(Array.isArray(res.data) ? res.data : []); // <- fix
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", image: "" });
    setEditingId(null);
    setPreviewFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFile(file);
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setFormData({ name: cat.name, image: cat.image || "" });
    setPreviewFile(null);
    const form = document.getElementById("category-form");
    if (form) form.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      let imageUrl = formData.image;

      // Upload ảnh nếu có file mới
      if (previewFile) {
        setUploading(true);
        const uploadData = new FormData();
        uploadData.append("image", previewFile);

        const res = await axios.post(`${API_URL}/api/upload`, uploadData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          },
        });

        // Server trả về: { image: '/uploads/xxx.jpg' }
        imageUrl = res.data.image;
        setUploading(false);
      }

      // Lưu vào DB
      const payload = { name: formData.name, image: imageUrl };

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        alert("✅ Đã cập nhật danh mục!");
      } else {
        await api.post("/categories", payload);
        alert("✅ Đã thêm danh mục mới!");
      }

      fetchCategories();
      resetForm();
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (error) {
        alert("Không thể xóa danh mục này.");
      }
    }
  };

  const getDisplayImage = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:") || path.startsWith("http")) return path;
    return `${API_URL}${path}`; // API_URL là http://localhost:5000
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans text-gray-800">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <List className="text-pink-600" /> Quản Lý Danh Mục
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORM */}
        <div
          id="category-form"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-6 z-10"
        >
          <h3 className="font-bold text-gray-700 mb-4 flex justify-between items-center">
            <span className="flex items-center gap-2">
              {editingId ? (
                <Edit size={18} className="text-blue-600" />
              ) : (
                <Plus size={18} className="text-pink-600" />
              )}
              {editingId ? "Cập Nhật Danh Mục" : "Thêm Mới"}
            </span>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition"
              >
                Hủy sửa
              </button>
            )}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tên danh mục
              </label>
              <input
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-pink-200 outline-none bg-gray-50 focus:bg-white transition"
                placeholder="Ví dụ: Bánh Kem"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Hình ảnh
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition relative group h-48 flex items-center justify-center overflow-hidden">
                {formData.image ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={getDisplayImage(formData.image)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer rounded-md">
                      <Upload className="text-white mb-1" size={24} />
                      <span className="text-white text-xs font-bold">
                        Đổi ảnh khác
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400 group-hover:text-pink-500 group-hover:bg-pink-50 transition">
                      <Upload size={20} />
                    </div>
                    <span className="text-sm text-gray-500">Tải ảnh lên</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <button
              disabled={loading || uploading}
              className={`w-full py-2.5 rounded-lg font-bold transition shadow-md flex justify-center gap-2 disabled:opacity-70 text-white ${
                editingId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-pink-600 hover:bg-pink-700"
              }`}
            >
              {(loading || uploading) && (
                <Loader className="animate-spin" size={18} />
              )}
              {editingId ? "Lưu Thay Đổi" : "Tạo Danh Mục"}
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-pink-50 border-b border-pink-100 font-bold text-pink-700 flex justify-between">
            <span>Danh sách hiện có</span>
            <span className="bg-white px-2 rounded text-xs flex items-center border border-pink-200">
              {categories.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className={`p-4 flex items-center gap-4 transition ${
                  editingId === cat._id
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0">
                  {cat.image ? (
                    <img
                      src={getDisplayImage(cat.image)}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-gray-800">{cat.name}</h4>
                  <p className="text-xs text-gray-400 font-mono">
                    ID: {cat._id.slice(-6)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className={`p-2 rounded-lg border transition shadow-sm ${
                      editingId === cat._id
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-600 border-gray-200 hover:bg-blue-50"
                    }`}
                    title="Chỉnh sửa"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 bg-white text-red-500 border border-gray-200 hover:bg-red-50 rounded-lg transition shadow-sm"
                    title="Xóa"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                Chưa có danh mục nào.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
