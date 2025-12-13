import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import addressApi from '../../api/addressApi';

const AddressModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        recipient: '',
        phone: '',
        address_line: '', // Tỉnh/Thành, Quận/Huyện, Phường/Xã...
        isDefault: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await addressApi.create(formData);
            toast.success("Thêm địa chỉ thành công!");
            
            // Reset form
            setFormData({ recipient: '', phone: '', address_line: '', isDefault: false });
            
            // Báo cho cha biết là xong rồi (để reload list)
            onSuccess(); 
            onClose();
        } catch (error) {
            toast.error("Lỗi thêm địa chỉ");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Thêm địa chỉ mới</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
                        <input 
                            type="text" name="recipient" required
                            value={formData.recipient} onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input 
                            type="text" name="phone" required
                            value={formData.phone} onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="0901..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                        <textarea 
                            name="address_line" required rows="3"
                            value={formData.address_line} onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                            placeholder="Số nhà, Đường, Phường, Quận, Tỉnh/Thành phố"
                        ></textarea>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" name="isDefault"
                            checked={formData.isDefault} onChange={handleChange}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
                    </label>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                    >
                        {loading ? "Đang lưu..." : "Lưu địa chỉ"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddressModal;