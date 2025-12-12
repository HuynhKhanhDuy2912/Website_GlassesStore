import React, { useState, useEffect } from "react";
import { Trash2, Edit, Plus, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import userApi from "../../api/userApi";

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho Modal và Form
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Dữ liệu form
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "", // Chỉ dùng khi tạo mới
        role: "customer", // customer hoặc admin
        phone: ""
    });

    // 1. Lấy danh sách User khi vào trang
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll(); // Giả sử API trả về { data: [...] } hoặc mảng trực tiếp
            // Tùy cấu trúc trả về của API mà bạn chỉnh dòng dưới (ví dụ: response.data hoặc response)
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

    // 2. Xử lý Input Form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 3. Mở Modal (Thêm mới hoặc Sửa)
    const openModal = (user = null) => {
        if (user) {
            // Chế độ Sửa
            setIsEditing(true);
            setCurrentUser(user);

            // LƯU Ý QUAN TRỌNG:
            // Backend trả về: fullname, phone_number
            // Frontend Form dùng: fullName, phone
            // Cần map đúng và thêm || "" để tránh lỗi "uncontrolled"
            setFormData({
                fullName: user.fullname || user.fullName || "",
                email: user.email || "",
                password: "",
                role: user.role || "customer",
                phone: user.phone_number || user.phone || ""
            });
        } else {
            // Chế độ Thêm mới
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
    // 4. Xử lý Submit (Thêm hoặc Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // --- API Cập nhật ---
                // Lưu ý: Thường không gửi password khi update trừ khi người dùng nhập mới
                const dataToUpdate = { ...formData };
                if (!dataToUpdate.password) delete dataToUpdate.password;

                await userApi.update(currentUser._id, dataToUpdate); // Giả sử hàm update nhận id và data
                toast.success("Cập nhật thành công!");
            } else {
                // --- API Tạo mới ---
                await userApi.create(formData);
                toast.success("Thêm người dùng thành công!");
            }

            setShowModal(false);
            fetchUsers(); // Tải lại danh sách
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    // 5. Xử lý Xóa
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

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
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
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-sm font-semibold">
                            <tr>
                                <th className="p-4 border-b">Họ Tên</th>
                                <th className="p-4 border-b">Email</th>
                                <th className="p-4 border-b">Số ĐT</th>
                                <th className="p-4 border-b">Vai trò</th>
                                <th className="p-4 border-b text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 border-b last:border-0">
                                        <td className="p-4 font-medium">{user.fullname}</td>
                                        <td className="p-4">{user.email}</td>
                                        <td className="p-4">{user.phone_number || "---"}</td>
                                        <td className="p-4">
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
                                            <button
                                                onClick={() => openModal(user)}
                                                className="text-blue-500 hover:text-blue-700"
                                                title="Sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="text-red-500 hover:text-red-700"
                                                title="Xóa"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-500">
                                        Không có người dùng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL (Popup Form) */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-xl font-bold mb-4">
                            {isEditing ? "Cập nhật thông tin" : "Thêm người dùng mới"}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full mt-1 p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    disabled={isEditing} // Thường không cho sửa email để tránh lỗi auth
                                    className={`w-full mt-1 p-2 border rounded ${isEditing ? 'bg-gray-100' : ''}`}
                                />
                            </div>

                            {!isEditing && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full mt-1 p-2 border rounded"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full mt-1 p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full mt-1 p-2 border rounded"
                                >
                                    <option value="customer">Khách hàng</option>
                                    <option value="admin">Quản trị viên (Admin)</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                                >
                                    {isEditing ? "Lưu thay đổi" : "Tạo mới"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;