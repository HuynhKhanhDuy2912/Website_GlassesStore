import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exist = await User.findOne({ email });
    if(exist) return res.status(400).json({ message: "Email đã tồn tại" });
    const user = await User.create({ name, email, password });
    const token = signToken(user);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch(err){ next(err); }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    const token = signToken(user);

    // Trả về chuẩn { user, token }
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    next(err);
  }
};


export const logout = async (req, res, next) => {
  try {
    // Ở phía client sẽ xoá token trong localStorage hoặc context
    res.json({ message: "Đăng xuất thành công" });
  } catch (err) {
    next(err);
  }
};
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng với email này" });

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token và lưu vào DB
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút

    await user.save();

    // Tạo URL (frontend của bạn)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu. Vui lòng nhấn vào đường dẫn sau:\n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Đặt lại mật khẩu HanHan Bakery",
        message,
      });
      res.status(200).json({ message: "Email đã được gửi!" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Không thể gửi email" });
    }
  } catch (err) { next(err); }
};

export const resetPasswordDirect = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm người dùng theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email này không tồn tại trong hệ thống" });
    }

    // 2. Cập nhật mật khẩu mới 
    // (Mật khẩu sẽ tự động được hash nhờ hàm userSchema.pre('save') trong Model User)
    user.password = password;
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("Lỗi đổi mật khẩu:", err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};