import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load env
dotenv.config();

// Import routes
import authRoute from "./routes/auth.route.js";
import categoryRoute from "./routes/category.route.js";
import productRoute from "./routes/product.route.js";
import cartRoute from "./routes/cart.route.js";
import orderRoute from "./routes/order.route.js";
import contactRoute from "./routes/contact.route.js";
import reviewRoute from "./routes/review.route.js";
import uploadRoute from "./routes/upload.route.js";
import userRoutes from "./routes/user.routes.js";
import bannerRoute from "./routes/banner.route.js";

// Import middleware
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // URL frontend của bạn
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// --- CẤU HÌNH ĐƯỜNG DẪN ẢNH (QUAN TRỌNG) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mở thư mục uploads ra public để frontend truy cập được
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- ĐĂNG KÝ CÁC ROUTE ---
app.use("/api/auth", authRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/contacts", contactRoute); // Nhớ là số nhiều 'contacts'
app.use("/api/upload", uploadRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/users", userRoutes);
app.use("/api/banners", bannerRoute);

// Error Handler
app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "BakeryDB",
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));