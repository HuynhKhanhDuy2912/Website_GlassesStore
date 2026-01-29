import User from "../models/User.js";
import bcrypt from "bcryptjs"; // Cần import thêm cái này để mã hóa nếu user đổi mật khẩu

// 1. Lấy danh sách tất cả user (Dành cho Admin)
export const getAllUsers = async (req, res) => {
  try {
    // const users = await User.find({ role: "user" })
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 2. Xóa user (Dành cho Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ message: "Đã xóa người dùng thành công" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi xóa người dùng", error: error.message });
  }
};

// 3. User tự cập nhật hồ sơ (Dành cho Khách hàng)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;

      // Logic lưu ảnh avatar (nếu có upload file)
      if (req.file) {
        user.avatarUrl = `/uploads/${req.file.filename}`;
      }

      // Nếu user nhập password mới thì hash và lưu
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
        token: req.headers.authorization.split(" ")[1],
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật hồ sơ", error: err.message });
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Cập nhật role mới từ request gửi lên
    user.role = req.body.role || user.role;

    const updatedUser = await user.save();

    res.json({
      message: "Cập nhật quyền thành công",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE USER STATUS 
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.status = status;
    await user.save();

    res.json({
      message: "Cập nhật trạng thái người dùng thành công",
      status: user.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
