import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  
  // ✅ Đã có trường role để phân quyền (quan trọng)
  role: { type: String, enum: ["user", "admin"], default: "user" },
  
  avatarUrl: { type: String },
  
  // Các trường cho chức năng quên mật khẩu
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Hàm so sánh mật khẩu
userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);