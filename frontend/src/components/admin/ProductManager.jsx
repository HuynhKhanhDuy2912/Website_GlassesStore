import React, { useState, useEffect } from "react";
import { 
    Trash2, Edit, Plus, Search, X, Image as ImageIcon, 
    UploadCloud, Loader2, Filter, Package 
} from "lucide-react";
import { toast } from "react-toastify";

// Import các API cần thiết
import productApi from "../../api/productApi";
import categoryApi from "../../api/categoryApi";
import brandApi from "../../api/brandApi";
import uploadApi from "../../api/uploadApi";

// Hàm format tiền tệ (VND)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    
    // Dữ liệu để đổ vào Dropdown
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Form data khớp với ProductSchema backend
    const [formData, setFormData] = useState({
        product_name: "",
        price: 0,
        discount: 0,
        quantity: 0,
        category_id: "",
        brand_id: "",
        description: "",
        image_url: "", // Ảnh chính
        size: "",
        color: "",
        material: "",
        isFeatured: false,
        status: "active"
    });

    // --- 1. Fetch Data (Products, Categories, Brands) ---
    const fetchData = async () => {
        try {
            setLoading(true);
            // Gọi song song 3 API để tiết kiệm thời gian
            const [productRes, categoryRes, brandRes] = await Promise.all([
                productApi.getAll({ limit: 100 }), // Lấy 100 sp demo (sau này làm phân trang sau)
                categoryApi.getAll(),
                brandApi.getAll()
            ]);

            setProducts(productRes.data || []);
            setCategories(categoryRes.data || []);
            setBrands(brandRes.data || []);
        } catch (error) {
            toast.error("Lỗi tải dữ liệu");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- 2. Xử lý Form & Upload ---
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
            setFormData(prev => ({ ...prev, image_url: res.imageUrl }));
            toast.success("Upload ảnh thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tải ảnh lên Cloudinary");
        } finally {
            setUploading(false);
        }
    };

    const openModal = (product = null) => {
        if (product) {
            setIsEditing(true);
            setCurrentId(product._id);
            // Map dữ liệu từ backend vào form
            setFormData({
                product_name: product.product_name || "",
                price: product.price || 0,
                discount: product.discount || 0,
                quantity: product.quantity || 0,
                // Lưu ý: product.category_id có thể là object (do populate) hoặc string id
                category_id: product.category_id?._id || product.category_id || "",
                brand_id: product.brand_id?._id || product.brand_id || "",
                description: product.description || "",
                image_url: product.image_url || "",
                size: product.size || "",
                color: product.color || "",
                material: product.material || "",
                isFeatured: product.isFeatured || false,
                status: product.status || "active"
            });
        } else {
            setIsEditing(false);
            setCurrentId(null);
            // Reset form
            setFormData({
                product_name: "",
                price: 0,
                discount: 0,
                quantity: 0,
                category_id: "", // Cần chọn
                brand_id: "",    // Cần chọn
                description: "",
                image_url: "",
                size: "",
                color: "",
                material: "",
                isFeatured: false,
                status: "active"
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate đơn giản
        if (!formData.category_id || !formData.brand_id) {
            toast.warning("Vui lòng chọn Danh mục và Thương hiệu");
            return;
        }

        try {
            if (isEditing) {
                await productApi.update(currentId, formData);
                toast.success("Cập nhật sản phẩm thành công!");
            } else {
                await productApi.create(formData);
                toast.success("Thêm sản phẩm mới thành công!");
            }
            setShowModal(false);
            // Reload lại list products
            const res = await productApi.getAll({ limit: 100 });
            setProducts(res.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            try {
                await productApi.delete(id);
                toast.success("Đã xóa sản phẩm");
                setProducts(products.filter((p) => p._id !== id));
            } catch (error) {
                toast.error("Xóa thất bại");
            }
        }
    };

    // --- 3. Filter Search ---
    const filteredProducts = products.filter((p) => {
        return p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý kho hàng, giá cả và thông tin kính mắt</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative w-72 group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="block w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="p-4 border-b">Ảnh</th>
                                    <th className="p-4 border-b">Tên sản phẩm</th>
                                    <th className="p-4 border-b">Giá bán</th>
                                    <th className="p-4 border-b">Kho</th>
                                    <th className="p-4 border-b">Danh mục / Hãng</th>
                                    <th className="p-4 border-b text-center">Trạng thái</th>
                                    <th className="p-4 border-b text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((p) => (
                                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                {p.image_url ? (
                                                    <img src={p.image_url} alt="" className="h-12 w-12 object-contain rounded border bg-white p-1" />
                                                ) : (
                                                    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                                        <Package size={20} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 font-medium text-gray-900 max-w-xs truncate" title={p.product_name}>
                                                {p.product_name}
                                                {p.isFeatured && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded border border-yellow-200">HOT</span>}
                                            </td>
                                            <td className="p-4 text-blue-600 font-semibold">
                                                {formatCurrency(p.price)}
                                                {p.discount > 0 && (
                                                    <div className="text-xs text-gray-400 line-through">
                                                        -{p.discount}%
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {p.quantity} chiếc
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                <div className="font-medium">{p.category_id?.category_name || "---"}</div>
                                                <div className="text-xs text-gray-400">{p.brand_id?.name || "---"}</div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    p.quantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                    {p.quantity > 0 ? "Còn hàng" : "Hết hàng"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => openModal(p)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500">
                                            Không tìm thấy sản phẩm nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditing ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm mới"}
                            </h2>
                            <button onClick={() => setShowModal(false)}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>

                        <div className="overflow-y-auto p-6 flex-1">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Hàng 1: Tên sản phẩm (Full width) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                                    <input
                                        type="text" name="product_name" required
                                        value={formData.product_name} onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                                        placeholder="Ví dụ: Kính Rayban Aviator..."
                                    />
                                </div>

                                {/* Hàng 2: Grid 2 cột */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Cột Trái: Thông tin cơ bản */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND) <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number" name="price" required min="0"
                                                    value={formData.price} onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá (%)</label>
                                                <input
                                                    type="number" name="discount" min="0" max="100"
                                                    value={formData.discount} onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number" name="quantity" required min="0"
                                                    value={formData.quantity} onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                                                <input
                                                    type="text" name="size"
                                                    value={formData.size} onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                                    placeholder="S, M, L..."
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                                                <input
                                                    type="text" name="color"
                                                    value={formData.color} onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                                    placeholder="Đen, Vàng..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Chất liệu</label>
                                                <input
                                                    type="text" name="material"
                                                    value={formData.material} onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                                    placeholder="Nhựa, Kim loại..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cột Phải: Phân loại & Ảnh */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                                                <select
                                                    name="category_id"
                                                    value={formData.category_id} onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                                >
                                                    <option value="">-- Chọn --</option>
                                                    {categories.map(c => (
                                                        <option key={c._id} value={c._id}>{c.category_name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu <span className="text-red-500">*</span></label>
                                                <select
                                                    name="brand_id"
                                                    value={formData.brand_id} onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                                >
                                                    <option value="">-- Chọn --</option>
                                                    {brands.map(b => (
                                                        <option key={b._id} value={b._id}>{b.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Upload Ảnh */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                                    {formData.image_url ? (
                                                        <img src={formData.image_url} alt="" className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-400" />
                                                    )}
                                                    {uploading && (
                                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                            <Loader2 className="animate-spin text-blue-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50">
                                                        <UploadCloud size={18} />
                                                        <span>{uploading ? "Đang tải..." : "Chọn ảnh"}</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checkbox */}
                                        <div className="flex gap-6 mt-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox" name="isFeatured"
                                                    checked={formData.isFeatured} onChange={handleInputChange}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium text-gray-700">Sản phẩm nổi bật (HOT)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Hàng cuối: Mô tả */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                                    <textarea
                                        name="description" rows="4"
                                        value={formData.description} onChange={handleInputChange}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                                        placeholder="Mô tả sản phẩm..."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">Hủy bỏ</button>
                                    <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium shadow-sm" disabled={uploading}>
                                        {isEditing ? "Lưu thay đổi" : "Tạo sản phẩm"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;