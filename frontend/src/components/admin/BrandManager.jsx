import React, { useState, useEffect } from "react";
import { Trash2, Edit, Plus, Search, X, Globe, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import brandApi from "../../api/brandApi"; // Nhớ import đúng đường dẫn

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

const BrandManager = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBrand, setCurrentBrand] = useState(null);

    // Form data khớp với BrandSchema
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: "",
        country: "",
        isActive: true
    });

    // --- 1. Fetch Data ---
    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await brandApi.getAll();
            // Backend trả về: { success: true, count: ..., data: [...] }
            setBrands(response.data || []);
        } catch (error) {
            toast.error("Lỗi tải danh sách thương hiệu");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    // --- 2. Xử lý Form ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const openModal = (brand = null) => {
        if (brand) {
            setIsEditing(true);
            setCurrentBrand(brand);
            setFormData({
                name: brand.name || "",
                description: brand.description || "",
                image: brand.image || "",
                country: brand.country || "",
                isActive: brand.isActive ?? true // Nếu null thì mặc định true
            });
        } else {
            setIsEditing(false);
            setCurrentBrand(null);
            setFormData({
                name: "",
                description: "",
                image: "",
                country: "",
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await brandApi.update(currentBrand._id, formData);
                toast.success("Cập nhật thương hiệu thành công!");
            } else {
                await brandApi.create(formData);
                toast.success("Thêm thương hiệu mới thành công!");
            }
            setShowModal(false);
            fetchBrands();
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa thương hiệu này?")) {
            try {
                await brandApi.delete(id);
                toast.success("Đã xóa thương hiệu");
                setBrands(brands.filter((b) => b._id !== id));
            } catch (error) {
                toast.error("Xóa thất bại");
            }
        }
    };

    // --- 3. Logic Tìm kiếm ---
    const filteredBrands = brands.filter((brand) => {
        const term = removeVietnameseTones(searchTerm);
        const name = removeVietnameseTones(brand.name || "");
        const country = removeVietnameseTones(brand.country || "");
        return name.includes(term) || country.includes(term);
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Thương hiệu</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý danh sách các hãng sản xuất</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Bar "Clean & Light" */}
                    <div className="relative w-72 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm thương hiệu..."
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
                                <th className="p-4 border-b text-center w-[15%]">Logo</th>
                                <th className="p-4 border-b text-left w-[25%]">Tên Thương hiệu</th>
                                <th className="p-4 border-b text-left w-[20%]">Quốc gia</th>
                                <th className="p-4 border-b text-center w-[15%]">Trạng thái</th>
                                <th className="p-4 border-b text-left w-[15%]">Ngày tạo</th>
                                <th className="p-4 border-b text-center w-[10%]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredBrands.length > 0 ? (
                                filteredBrands.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-gray-50 transition-colors">
                                        {/* Cột Logo */}
                                        <td className="p-4 flex justify-center items-center">
                                            {brand.image ? (
                                                <img 
                                                    src={brand.image} 
                                                    alt={brand.name} 
                                                    className="h-10 w-auto max-w-[80px] object-contain rounded border border-gray-100 p-1 bg-white" 
                                                />
                                            ) : (
                                                <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </td>
                                        
                                        {/* Cột Tên */}
                                        <td className="p-4 text-left">
                                            <div className="font-medium text-gray-900 truncate" title={brand.name}>{brand.name}</div>
                                            <div className="text-xs text-gray-500 truncate mt-0.5">{brand.description}</div>
                                        </td>

                                        {/* Cột Quốc gia */}
                                        <td className="p-4 text-left">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Globe size={14} className="text-gray-400"/>
                                                <span className="truncate">{brand.country || "---"}</span>
                                            </div>
                                        </td>

                                        {/* Cột Trạng thái */}
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                brand.isActive 
                                                ? "bg-green-100 text-green-800" 
                                                : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {brand.isActive ? "Hiển thị" : "Ẩn"}
                                            </span>
                                        </td>
                                        
                                        {/* Cột Ngày tạo */}
                                        <td className="p-4 text-left text-sm text-gray-500">
                                            {new Date(brand.createdAt).toLocaleDateString('vi-VN')}
                                        </td>

                                        {/* Cột Hành động */}
                                        <td className="p-4">
                                            <div className="flex justify-center gap-3">
                                                <button onClick={() => openModal(brand)} className="text-blue-500 hover:text-blue-700 transition-colors" title="Sửa">
                                                    <Edit size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(brand._id)} className="text-red-500 hover:text-red-700 transition-colors" title="Xóa">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search size={40} className="text-gray-300 mb-2" />
                                            <p>{searchTerm ? "Không tìm thấy kết quả nào." : "Chưa có thương hiệu nào."}</p>
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
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">
                                {isEditing ? "Cập nhật Thương hiệu" : "Thêm Thương hiệu mới"}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Tên thương hiệu */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Thương hiệu <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Ví dụ: Gucci, Ray-Ban..."
                                />
                            </div>

                            {/* Link Ảnh Logo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo (Ảnh)</label>
                                <input
                                    type="text"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    placeholder="https://..."
                                />
                                {formData.image && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-1">Xem trước:</p>
                                        <img src={formData.image} alt="Preview" className="h-10 object-contain border p-1 rounded" />
                                    </div>
                                )}
                            </div>

                            {/* Quốc gia & Trạng thái */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="Ý, Mỹ..."
                                    />
                                </div>
                                <div className="flex items-center mt-6">
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
                                        <span className="ml-3 text-sm font-medium text-gray-700">Đang hoạt động</span>
                                    </label>
                                </div>
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
                                    placeholder="Thông tin thêm về thương hiệu..."
                                ></textarea>
                            </div>

                            {/* Actions */}
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
                                >
                                    {isEditing ? "Lưu thay đổi" : "Tạo thương hiệu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandManager;