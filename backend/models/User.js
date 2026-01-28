import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  avatarUrl: { type: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw(error);
  }
});

// Hàm so sánh mật khẩu
userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);