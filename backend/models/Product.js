import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  flavor: { 
      type: String, 
      trim: true,        
      default: '' 
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  images: [{ url: String, alt: String }],
  avgRating: { type: Number, default: 0 }, 
  reviewCount: { type: Number, default: 0 },

  // --- FLASH SALE FIELDS (Cấu trúc chuẩn) ---
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: { type: Number, default: 0 },
  totalFlashSale: { type: Number, default: 0 },   
  soldCount: { type: Number, default: 0 },       
  flashSaleStartDate: { type: Date },             
  flashSaleEndTime: { type: Date },               

}, { timestamps: true });

export default mongoose.model("Product", productSchema);