import React, { useState, useEffect } from "react";
import { Trash2, Edit, Plus, Search, X, Image as ImageIcon, UploadCloud, Loader2, Layers } from "lucide-react";
import { toast } from "react-toastify";
import categoryApi from "../../api/categoryApi";
import uploadApi from "../../api/uploadApi";

// Hàm xóa dấu tiếng Việt để tìm kiếm
const removeVietnameseTones = (str) => {
    if (!str) return "";
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
};

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Form data khớp với CategorySchema
    const [formData, setFormData] = useState({
        category_name: "", // Backend dùng key này
        description: "",
        image: "",
        isActive: true
    });

    // --- 1. Fetch Data ---
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await categoryApi.getAll();
            setCategories(response.data || []);
        } catch (error) {
            toast.error("Lỗi tải danh sách danh mục");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // --- 2. Xử lý Form ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File quá lớn! Vui lòng chọn ảnh dưới 5MB");
            return;
        }

        try {
            setUploading(true);
            const res = await uploadApi.uploadImage(file);
            setFormData(prev => ({ ...prev, image: res.imageUrl }));
            toast.success("Upload ảnh thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tải ảnh lên Cloudinary");
        } finally {
            setUploading(false);
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setIsEditing(true);
            setCurrentCategory(category);
            setFormData({
                category_name: category.category_name || "",
                description: category.description || "",
                image: category.image || "",
                isActive: category.isActive ?? true
            });
        } else {
            setIsEditing(false);
            setCurrentCategory(null);
            setFormData({
                category_name: "",
                description: "",
                image: "",
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await categoryApi.update(currentCategory._id, formData);
                toast.success("Cập nhật danh mục thành công!");
            } else {
                await categoryApi.create(formData);
                toast.success("Thêm danh mục mới thành công!");
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa danh mục này?")) {
            try {
                await categoryApi.delete(id);
                toast.success("Đã xóa danh mục");
                setCategories(categories.filter((c) => c._id !== id));
            } catch (error) {
                toast.error("Xóa thất bại");
            }
        }
    };

    // --- 3. Logic Tìm kiếm ---
    const filteredCategories = categories.filter((cat) => {
        const term = removeVietnameseTones(searchTerm);
        const name = removeVietnameseTones(cat.category_name || "");
        return name.includes(term);
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
                    <p className="text-gray-500 text-sm mt-1">Phân loại sản phẩm (Gọng kính, Tròng kính...)</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-72 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            className="block w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm hover:shadow-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm"
                    >
                        <Plus size={20} /> <span className="hidden sm:inline">Thêm mới</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-4 border-b text-center w-[15%]">Hình ảnh</th>
                                <th className="p-4 border-b text-left w-[25%]">Tên Danh mục</th>
                                <th className="p-4 border-b text-left w-[30%]">Mô tả</th>
                                <th className="p-4 border-b text-center w-[15%]">Trạng thái</th>
                                <th className="p-4 border-b text-center w-[15%]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                                        {/* Cột Ảnh */}
                                        <td className="p-4 flex justify-center items-center">
                                            {cat.image ? (
                                                <img 
                                                    src={cat.image} 
                                                    alt={cat.category_name} 
                                                    className="h-12 w-12 object-cover rounded-lg border border-gray-200" 
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400">
                                                    <Layers size={24} />
                                                </div>
                                            )}
                                        </td>
                                        
                                        {/* Cột Tên */}
                                        <td className="p-4 text-left font-medium text-gray-900">
                                            {cat.category_name}
                                        </td>

                                        {/* Cột Mô tả */}
                                        <td className="p-4 text-left text-sm text-gray-500 truncate" title={cat.description}>
                                            {cat.description || "---"}
                                        </td>

                                        {/* Cột Trạng thái */}
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                cat.isActive 
                                                ? "bg-green-100 text-green-800" 
                                                : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {cat.isActive ? "Hiển thị" : "Ẩn"}
                                            </span>
                                        </td>

                                        {/* Cột Hành động */}
                                        <td className="p-4">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => openModal(cat)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Sửa">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Xóa">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search size={40} className="text-gray-300 mb-2" />
                                            <p>{searchTerm ? "Không tìm thấy kết quả nào." : "Chưa có danh mục nào."}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">
                                {isEditing ? "Cập nhật Danh mục" : "Thêm Danh mục mới"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Tên danh mục */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Danh mục <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="category_name" // Khớp với Backend
                                    value={formData.category_name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Ví dụ: Gọng kính kim loại..."
                                />
                            </div>

                            {/* Upload Ảnh */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh minh họa</label>
                                <div className="mt-1 flex items-center gap-4">
                                    <div className="relative group w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                        {formData.image ? (
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="text-gray-400" size={32} />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <Loader2 className="animate-spin text-blue-600" size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                            <UploadCloud size={18} />
                                            <span>{uploading ? "Đang tải lên..." : "Chọn ảnh"}</span>
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                disabled={uploading}
                                            />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">Hỗ trợ JPG, PNG, WEBP</p>
                                    </div>
                                </div>
                            </div>

                            {/* Trạng thái */}
                            <div>
                                <label className="flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="sr-only" 
                                        />
                                        <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isActive ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">Hiển thị danh mục này</span>
                                </label>
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Thông tin thêm..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                    disabled={uploading}
                                >
                                    {isEditing ? "Lưu thay đổi" : "Tạo danh mục"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;