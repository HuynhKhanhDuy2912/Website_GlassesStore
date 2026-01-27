import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  content: { type: String },
  images: [String],
  approved: { type: Boolean, default: true }, // Bạn đang để mặc định là hiện luôn
  
  // ✅ THÊM TRƯỜNG NÀY:
  adminResponse: { type: String } 
}, { timestamps: true });

// Giữ nguyên index
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);