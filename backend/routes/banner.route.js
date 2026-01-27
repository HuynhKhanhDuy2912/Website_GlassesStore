import express from "express";
import { 
  getActiveBanners, 
  getAllBanners, 
  createBanner, 
  deleteBanner, 
  toggleBannerActive 
} from "../controllers/banner.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";
import { uploadFiles } from "../middleware/upload.js"; // Import file upload có sẵn của bạn

const router = express.Router();

// Public: Lấy banner hiện ra trang chủ
router.get("/", getActiveBanners);

// Admin: Quản lý
router.get("/admin", protect, admin, getAllBanners);
router.post("/", protect, admin, uploadFiles.single("image"), createBanner);
router.delete("/:id", protect, admin, deleteBanner);
router.put("/:id/toggle", protect, admin, toggleBannerActive);

export default router;