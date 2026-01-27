import express from "express";
// ✅ 1. Thêm updateUserRole vào dòng import này
import { updateUserProfile, getAllUsers, deleteUser, updateUserRole } from "../controllers/user.controller.js"; 
import { protect, admin } from "../middleware/auth.middleware.js";

// Import cái biến uploadFiles từ file CỦA BẠN
import { uploadFiles } from "../middleware/upload.js"; 

const router = express.Router();

// Gắn uploadFiles.single("avatar") vào giữa
router.put("/profile", protect, uploadFiles.single("avatar"), updateUserProfile);

// Các route khác giữ nguyên
router.get("/", protect, admin, getAllUsers);
router.delete("/:id", protect, admin, deleteUser);

// ✅ 2. THÊM DÒNG NÀY: Route cập nhật quyền (User <-> Admin)
// Chỉ Admin mới được truy cập
router.put("/:id/role", protect, admin, updateUserRole);

export default router;