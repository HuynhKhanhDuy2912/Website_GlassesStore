import express from "express";
import { 
  addReview, 
  listReviews, 
  getAllReviewsAdmin, 
  toggleApproveReview, 
  replyReview, 
  deleteReview 
} from "../controllers/review.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

// --- PUBLIC / USER ---
router.get("/", listReviews);          // Ai cũng xem được review đã duyệt
router.post("/", protect, addReview);  // User đăng nhập mới được viết

// --- ADMIN ONLY ---
// Lấy tất cả review để quản lý
router.get("/admin/all", protect, admin, getAllReviewsAdmin);

// Duyệt hoặc ẩn review
router.put("/:id/approve", protect, admin, toggleApproveReview);

// Trả lời review
router.put("/:id/reply", protect, admin, replyReview);

// Xóa review
router.delete("/:id", protect, admin, deleteReview);

export default router;