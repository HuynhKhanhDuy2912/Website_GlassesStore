const ShippingAddress = require('../models/ShippingAddress');

const shippingAddressController = {
    
    // 1. Thêm địa chỉ mới
    createAddress: async (req, res) => {
        try {
            const { recipient, phone, address_line, postal_code, isDefault } = req.body;
            const userId = req.user._id;

            // Logic: Nếu người dùng set địa chỉ này là Default
            // -> Ta phải tìm tất cả địa chỉ cũ của user này và set isDefault = false
            if (isDefault === true) {
                await ShippingAddress.updateMany(
                    { user: userId },
                    { isDefault: false }
                );
            }

            const newAddress = new ShippingAddress({
                user: userId,
                recipient,
                phone,
                address_line,
                postal_code,
                isDefault: isDefault || false 
            });

            // Nếu đây là địa chỉ ĐẦU TIÊN của user, tự động set làm mặc định luôn cho tiện
            const count = await ShippingAddress.countDocuments({ user: userId });
            if (count === 0) {
                newAddress.isDefault = true;
            }

            await newAddress.save();

            res.status(201).json({ success: true, message: 'Thêm địa chỉ thành công', data: newAddress });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Lấy danh sách địa chỉ của User đang đăng nhập
    getMyAddresses: async (req, res) => {
        try {
            // Sắp xếp: Địa chỉ mặc định lên đầu (-1), sau đó đến mới nhất
            const addresses = await ShippingAddress.find({ user: req.user._id })
                .sort({ isDefault: -1, created_at: -1 });

            res.status(200).json({ success: true, count: addresses.length, data: addresses });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Lấy chi tiết 1 địa chỉ (để Edit)
    getAddressById: async (req, res) => {
        try {
            const address = await ShippingAddress.findById(req.params.id);

            if (!address) {
                return res.status(404).json({ message: 'Địa chỉ không tồn tại' });
            }

            // Bảo mật: Không cho xem địa chỉ của người khác
            if (address.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Bạn không có quyền truy cập địa chỉ này' });
            }

            res.status(200).json({ success: true, data: address });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 4. Cập nhật địa chỉ
    updateAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const { recipient, phone, address_line, postal_code, isDefault } = req.body;
            const userId = req.user._id;

            const address = await ShippingAddress.findById(id);
            if (!address) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
            
            // Check quyền sở hữu
            if (address.user.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'Không có quyền sửa địa chỉ này' });
            }

            // Logic xử lý isDefault khi update
            if (isDefault === true) {
                // Reset các địa chỉ khác thành false
                await ShippingAddress.updateMany(
                    { user: userId, _id: { $ne: id } }, // Trừ địa chỉ đang sửa ra
                    { isDefault: false }
                );
            }

            // Cập nhật
            address.recipient = recipient || address.recipient;
            address.phone = phone || address.phone;
            address.address_line = address_line || address.address_line;
            address.postal_code = postal_code || address.postal_code;
            if (isDefault !== undefined) address.isDefault = isDefault;

            await address.save();

            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: address });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 5. Xóa địa chỉ
    deleteAddress: async (req, res) => {
        try {
            const { id } = req.params;
            const address = await ShippingAddress.findById(id);

            if (!address) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
            
            if (address.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Không có quyền xóa' });
            }

            await ShippingAddress.findByIdAndDelete(id);

            res.status(200).json({ success: true, message: 'Đã xóa địa chỉ' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 6. Đặt một địa chỉ làm mặc định (Quick Action)
    setDefault: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            // 1. Reset tất cả về false
            await ShippingAddress.updateMany({ user: userId }, { isDefault: false });

            // 2. Set địa chỉ được chọn thành true
            const updatedAddress = await ShippingAddress.findOneAndUpdate(
                { _id: id, user: userId },
                { isDefault: true },
                { new: true }
            );

            if (!updatedAddress) return res.status(404).json({ message: 'Địa chỉ không tồn tại' });

            res.status(200).json({ success: true, message: 'Đã đặt làm mặc định', data: updatedAddress });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = shippingAddressController;