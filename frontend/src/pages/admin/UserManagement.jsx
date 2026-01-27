import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    Search, Trash2, Mail, Phone, MapPin, 
    ShieldCheck, User, ShieldAlert, Loader 
} from 'lucide-react';

// Hàm helper xử lý ảnh
const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/150?text=User';
    if (path.startsWith("http")) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `http://localhost:5000${cleanPath}`;
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null); // Để hiện loading khi đang sửa quyền user nào đó

  // Lấy thông tin người đang đăng nhập để tránh tự xóa/hạ quyền chính mình
  const currentUser = JSON.parse(localStorage.getItem("USER_INFO") || "{}");

  // 1. Gọi API lấy danh sách
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Xử lý xóa user
  const handleDelete = async (userId) => {
    if (userId === currentUser._id) {
        alert("Bạn không thể tự xóa tài khoản của chính mình!");
        return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này không?")) {
      try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(user => user._id !== userId));
        alert("Đã xóa thành công!");
      } catch (error) {
        alert("Lỗi khi xóa người dùng.");
      }
    }
  };

  // 3. Xử lý thay đổi quyền (User <-> Admin)
  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser._id) {
        alert("Bạn không thể tự thay đổi quyền của chính mình!");
        return;
    }

    // Hỏi xác nhận trước khi cấp quyền Admin
    if (newRole === 'admin') {
        if (!window.confirm("CẢNH BÁO: Bạn đang cấp toàn quyền quản trị (Admin) cho người này. Tiếp tục?")) return;
    }

    setUpdatingId(userId); // Bật loading cho dòng này
    try {
        const token = localStorage.getItem("ACCESS_TOKEN");
        // Gọi API PUT cập nhật role
        await axios.put(`http://localhost:5000/api/users/${userId}/role`, 
            { role: newRole }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );

        // Cập nhật lại state local để giao diện thay đổi ngay
        setUsers(users.map(user => 
            user._id === userId ? { ...user, role: newRole } : user
        ));

        // alert("Cập nhật quyền thành công!"); (Có thể bỏ alert cho mượt)
    } catch (error) {
        console.error(error);
        alert("Lỗi khi cập nhật quyền: " + (error.response?.data?.message || error.message));
    } finally {
        setUpdatingId(null);
    }
  };

  // 4. Lọc danh sách
  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-gray-500 flex justify-center"><Loader className="animate-spin" /></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" /> Quản Lý Người Dùng & Phân Quyền
            </h2>
            <p className="text-sm text-gray-500 mt-1">Tổng số: {users.length} tài khoản</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm tên, email..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
              <th className="p-4 rounded-tl-lg">Người dùng</th>
              <th className="p-4">Liên hệ</th>
              <th className="p-4 text-center">Vai trò (Phân quyền)</th>
              <th className="p-4">Ngày tham gia</th>
              <th className="p-4 rounded-tr-lg text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${user.role === 'admin' ? 'bg-blue-50/30' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 relative">
                        <img 
                            src={getImageUrl(user.avatarUrl)} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=U'} 
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 flex items-center gap-1">
                            {user.name}
                            {user._id === currentUser._id && <span className="text-xs text-blue-500 font-normal">(Bạn)</span>}
                        </p>
                        <span className="text-xs text-gray-500">ID: {user._id.slice(-4).toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={14} /> {user.email}
                        </div>
                        {user.phone && <div className="flex items-center gap-2 text-gray-600"><Phone size={14} /> {user.phone}</div>}
                    </div>
                  </td>

                  {/* CỘT PHÂN QUYỀN */}
                  <td className="p-4 text-center">
                    {updatingId === user._id ? (
                        <div className="flex justify-center"><Loader size={18} className="animate-spin text-blue-500"/></div>
                    ) : (
                        <div className="inline-flex items-center gap-2 relative group">
                             {/* Icon hiển thị trạng thái */}
                            {user.role === 'admin' 
                                ? <ShieldAlert size={18} className="text-red-500" /> 
                                : <User size={18} className="text-blue-500" />
                            }
                            
                            {/* Dropdown chọn quyền */}
                            <select 
                                value={user.role} 
                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                disabled={user._id === currentUser._id} // Không cho tự sửa quyền mình
                                className={`
                                    appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-bold border cursor-pointer outline-none focus:ring-2 transition
                                    ${user.role === 'admin' 
                                        ? 'bg-red-50 text-red-600 border-red-200 focus:ring-red-200' 
                                        : 'bg-blue-50 text-blue-600 border-blue-200 focus:ring-blue-200'}
                                    ${user._id === currentUser._id ? 'opacity-70 cursor-not-allowed' : ''}
                                `}
                            >
                                <option value="user">User (Khách)</option>
                                <option value="admin">Admin (Quản trị)</option>
                            </select>
                            
                            {/* Mũi tên giả cho đẹp */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className={`w-3 h-3 ${user.role === 'admin' ? 'text-red-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    )}
                  </td>

                  <td className="p-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>

                  <td className="p-4 text-center">
                    <button 
                        onClick={() => handleDelete(user._id)}
                        disabled={user._id === currentUser._id}
                        className={`p-2 rounded-lg transition ${
                            user._id === currentUser._id 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                        title="Xóa người dùng"
                    >
                        <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                    Không tìm thấy người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;