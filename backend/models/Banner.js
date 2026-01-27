import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  title: { type: String, trim: true },       // Tiêu đề lớn (Ví dụ: Vị Ngọt Của Hạnh Phúc)
  description: { type: String, trim: true }, // Mô tả nhỏ bên dưới
  image: { type: String, required: true },   // Đường dẫn ảnh
  isActive: { type: Boolean, default: true }, // Có đang hiện hay không
  order: { type: Number, default: 0 },       // Thứ tự hiển thị (nếu làm Slider nhiều ảnh)
}, { timestamps: true });

export default mongoose.model("Banner", bannerSchema);