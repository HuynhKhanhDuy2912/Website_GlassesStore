import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  image: { type: String},
  description: { type: String }
}, { timestamps: true });

export default mongoose.model("Category", categorySchema);