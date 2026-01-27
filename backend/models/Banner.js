import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
  title: { type: String, trim: true },       
  description: { type: String, trim: true }, 
  image: { type: String, required: true },   
  isActive: { type: Boolean, default: true }, 
  order: { type: Number, default: 0 },       
}, { timestamps: true });

export default mongoose.model("Banner", bannerSchema);