import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Loader,
  Image as ImageIcon,
  Upload,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

// --- Axios config ---
const BACKENDURL = import.meta.env.VITE_BECKEND_API_URL||"http://localhost:5000/api";
const axiosClient = axios.create({
  baseURL: BACKENDURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- STATE CHO TÌM KIẾM & PHÂN TRANG ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  // ----------------------------------------

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    salePrice: 0,
    stock: 0,
    flavor: "Khác",
    category: "",
    images: [],
  });

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [page, keyword, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- SỬA HÀM FETCH ĐỂ CÓ PHÂN TRANG & SEARCH ---
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get(`/products`, {
        params: {
          page: page,
          limit: 10, // Số lượng hiển thị trên 1 trang
          q: keyword,
          category: selectedCategory,
        },
      });
      setProducts(res.data.items || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
      setError("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get("/categories");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Không tải được danh mục", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    try {
      await axiosClient.delete(`/products/${id}`);
      fetchProducts();
      alert("Xóa thành công!");
    } catch (err) {
      alert("Xóa thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const uploadImage = async (file) => {
    const form = new FormData();
    form.append("image", file);
    const res = await axiosClient.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.image;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalImages = formData.images;
      if (previewFile) {
        const imgUrl = await uploadImage(previewFile);
        finalImages = [{ url: imgUrl, alt: formData.name }];
      }

      const payload = {
        name: formData.name,
        slug: formData.slug || undefined,
        description: formData.description,
        price: Math.round(Number(formData.price)),
        salePrice: Math.round(Number(formData.salePrice)),
        stock: Number(formData.stock),
        flavor: formData.flavor,
        category: formData.category,
        images: finalImages,
      };

      if (isEdit) {
        await axiosClient.put(`/products/${formData._id}`, payload);
        alert("Cập nhật thành công!");
      } else {
        await axiosClient.post("/products", payload);
        alert("Thêm mới thành công!");
      }

      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setPreviewFile(null);
    setFormData({
      _id: "",
      name: "",
      slug: "",
      description: "",
      price: 0,
      salePrice: 0,
      stock: 0,
      flavor: "",
      category: "",
      images: [],
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setIsEdit(true);
    setPreviewFile(null);
    setFormData({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || 0,
      stock: product.stock || 0,
      flavor: product.flavor || "Khác",
      category: product.category?._id || product.category,
      images: product.images || [],
    });
    setShowModal(true);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFile(file);
      setFormData({
        ...formData,
        images: [{ url: URL.createObjectURL(file), alt: formData.name }],
      });
    }
  };

  const getDisplayImage = (img) => {
    if (!img) return null;
    if (img.url.startsWith("blob:") || img.url.startsWith("http"))
      return img.url;
    return `https://website-glassesstore.onrender.com${img.url}`;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingBag className="text-blue-600" />
          Quản Lý Sản Phẩm
        </h1>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1); 
            }}
            className="px-4 py-2 border rounded-lg focus:border-blue-500 outline-none text-gray-700 w-full md:w-48"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {/* THANH TÌM KIẾM */}
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Tìm tên sản phẩm..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1); 
              }}
              className="pl-10 pr-4 py-2 border rounded-lg focus:border-blue-500 outline-none w-full md:w-64"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>

          <button
            onClick={openAddModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap hover:bg-blue-600 transition"
          >
            <Plus size={20} /> Thêm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded-lg flex items-center gap-2 mb-4 text-red-700">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow rounded-lg mb-4">
        {loading ? (
          <div className="p-10 flex justify-center items-center text-gray-500">
            <Loader className="animate-spin mr-2" /> Đang tải dữ liệu...
          </div>
        ) : (
          <table className="w-full text-left  border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr className="text-center">
                <th className="p-4">Hình ảnh</th>
                <th className="p-4">Tên sản phẩm</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4">Thương hiệu</th>
                <th className="p-4">Kho</th>
                <th className="p-4">Giá bán</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p._id} className="border-b hover:bg-gray-50">
                    <td className="p-4 w-24">
                      {p.images?.[0]?.url ? (
                        <img
                          src={getDisplayImage(p.images[0])}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{p.name}</td>
                    <td className="p-4 text-gray-600">
                      {p.category?.name || "---"}
                    </td>
                    <td className="p-4">
                      <span className="bg-yellow-300 text-dark-700 font-bold px-2 py-1 rounded text-xs border border-gray-200">
                        {p.flavor || "Đang cập nhật"}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.stock > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold border ${
                              p.stock <= 5
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-green-100 text-green-700 border-green-200"
                            }`}
                          >
                            {p.stock <= 5 ? "Sắp hết" : "Còn hàng"}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            SL: {p.stock}
                          </span>
                        </div>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-200">
                          Hết hàng
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-dark-600">
                      {formatCurrency(p.salePrice > 0 ? p.salePrice : p.price)}
                      {p.salePrice > 0 && (
                        <div className="text-xs text-gray-400 line-through font-normal">
                          {formatCurrency(p.price)}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 text-blue-600 hover:bg-blue-500 hover:text-white rounded transition"
                          title="Sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 text-red-600 hover:bg-red-500 hover:text-white rounded transition"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-500">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* THANH PHÂN TRANG (PAGINATION) */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded border ${page === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-gray-700"}`}
          >
            <ChevronLeft size={18} /> Trước
          </button>

          <span className="text-sm font-medium text-gray-600">
            Trang <span className="text-blue-600 font-bold">{page}</span> /{" "}
            {totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className={`flex items-center gap-1 px-4 py-2 rounded border ${page === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 text-gray-700"}`}
          >
            Sau <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 overflow-auto max-h-[90vh] shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="font-bold text-xl text-gray-800">
                {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block mb-1.5 font-medium text-gray-700">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="Ví dụ: Kính mát ABC..."
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-gray-700">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thương hiệu */}
                <div>
                  <label className="block mb-1.5 font-medium text-gray-700">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    value={formData.flavor}
                    onChange={(e) =>
                      setFormData({ ...formData, flavor: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="Ví dụ: GUCCI..."
                  />
                </div>
                <div>
                  <label className="block mb-1.5 font-medium text-gray-700">
                    Số lượng kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-gray-700">
                    Giá bán (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    onWheel={(e) => e.target.blur()}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1.5 font-medium text-gray-700">
                    Giá khuyến mãi (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.salePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, salePrice: e.target.value })
                    }
                    onWheel={(e) => e.target.blur()}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                    placeholder="Để 0 nếu không giảm giá"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-medium text-gray-700">
                  Hình ảnh
                </label>
                <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="text-gray-400" size={32} />
                  {previewFile ? (
                    <span className="text-green-600 font-medium">
                      {previewFile.name}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      Kéo thả hoặc click để chọn ảnh
                    </span>
                  )}
                </div>
                {/* Preview ảnh cũ nếu đang edit mà chưa chọn ảnh mới */}
                {!previewFile && formData.images.length > 0 && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                    <span>Ảnh hiện tại:</span>
                    <img
                      src={getDisplayImage(formData.images[0])}
                      alt="Current"
                      className="w-10 h-10 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1.5 font-medium text-gray-700">
                  Mô tả sản phẩm
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  rows={4}
                  placeholder="Nhập mô tả chi tiết..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium shadow-lg shadow-blue-200 transition flex items-center gap-2"
                >
                  {isUploading && <Loader className="animate-spin" size={18} />}
                  {isUploading ? "Đang xử lý..." : "Lưu sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
