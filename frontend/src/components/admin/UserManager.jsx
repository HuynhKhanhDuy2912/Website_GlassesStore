import React, { useState, useEffect } from "react";
import { Trash2, Edit, Plus, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import userApi from "../../api/userApi";

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

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "customer",
        phone: ""
    });

    // --- FETCH DATA ---
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll();
            setUsers(response.data || response);
        } catch (error) {
            toast.error("Không thể tải danh sách người dùng");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- FORM HANDLING ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openModal = (user = null) => {
        if (user) {
            setIsEditing(true);
            setCurrentUser(user);
            setFormData({
                fullName: user.fullname || user.fullName || "",
                email: user.email || "",
                password: "",
                role: user.role || "customer",
                phone: user.phone_number || user.phone || ""
            });
        } else {
            setIsEditing(false);
            setCurrentUser(null);
            setFormData({
                fullName: "",
                email: "",
                password: "",
                role: "customer",
                phone: ""
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                const dataToUpdate = { ...formData };
                if (!dataToUpdate.password) delete dataToUpdate.password;
                await userApi.update(currentUser._id, dataToUpdate);
                toast.success("Cập nhật thành công!");
            } else {
                await userApi.create(formData);
                toast.success("Thêm người dùng thành công!");
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
            try {
                await userApi.delete(id);
                toast.success("Đã xóa người dùng");
                setUsers(users.filter((u) => u._id !== id));
            } catch (error) {
                toast.error("Xóa thất bại");
            }
        }
    };

    // --- FILTER ---
    const filteredUsers = users.filter((user) => {
        const term = removeVietnameseTones(searchTerm);
        const name = removeVietnameseTones(user.fullname || user.fullName || "");
        const email = removeVietnameseTones(user.email || "");
        const phone = (user.phone_number || user.phone || "").toString();
        return name.includes(term) || email.includes(term) || phone.includes(term);
    });

    return (
        <div className="p-6 bg-gray-50 min-h-screen ">
            {/* Search Bar */}
            {/* Search Bar - Giao diện mới đẹp hơn */}
            <div className="relative w-96 group"> {/* Thêm group để xử lý hover icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {/* Icon đổi màu khi focus vào input */}
                    <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                </div>
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm hover:shadow-md"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Nút X xóa nhanh từ khóa (chỉ hiện khi có text) */}
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6 mt-4">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách hàng</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={20} /> Thêm mới
                </button>
            </div>

            {/* Table Danh sách */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center">Đang tải dữ liệu...</div>
                ) : (
                    // Thêm class 'table-fixed' để cố định kích thước cột
                    <table className="w-full border-collapse table-fixed">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                            <tr>
                                {/* Định nghĩa Width cụ thể cho từng cột + text-center */}
                                <th className="p-4 border-b text-center w-[25%]">Họ Tên</th>
                                <th className="p-4 border-b text-center w-[30%]">Email</th>
                                <th className="p-4 border-b text-center w-[15%]">Số ĐT</th>
                                <th className="p-4 border-b text-center w-[15%]">Vai trò</th>
                                <th className="p-4 border-b text-center w-[15%]">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 border-b last:border-0">
                                        {/* Thêm text-center cho các ô dữ liệu */}
                                        <td className="p-4 text-center font-medium truncate" title={user.fullname || user.fullName}>
                                            {user.fullname || user.fullName}
                                        </td>
                                        <td className="p-4 text-center truncate" title={user.email}>
                                            {user.email}
                                        </td>
                                        <td className="p-4 text-center">
                                            {user.phone_number || user.phone || "---"}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-bold ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-700"
                                                    : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 flex justify-center gap-3">
                                            <button onClick={() => openModal(user)} className="text-blue-500 hover:text-blue-700">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">
                                        {searchTerm ? "Không tìm thấy kết quả phù hợp." : "Không có người dùng nào."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold mb-4">
                            {isEditing ? "Cập nhật thông tin" : "Thêm người dùng mới"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required className="w-full mt-1 p-2 border rounded focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required disabled={isEditing} className={`w-full mt-1 p-2 border rounded ${isEditing ? 'bg-gray-100' : ''}`} />
                            </div>
                            {!isEditing && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className="w-full mt-1 p-2 border rounded" />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full mt-1 p-2 border rounded">
                                    <option value="customer">Khách hàng</option>
                                    <option value="admin">Quản trị viên (Admin)</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300">Hủy</button>
                                <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">{isEditing ? "Lưu thay đổi" : "Tạo mới"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;