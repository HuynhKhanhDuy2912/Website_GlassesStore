import express from "express";
//  1. Thêm updateUserRole vào dòng import này
import { updateUserProfile, getAllUsers, deleteUser, updateUserRole, updateUserStatus } from "../controllers/user.controller.js"; 
import { protect, admin } from "../middleware/auth.middleware.js";
import { uploadFiles } from "../middleware/upload.js"; 

const router = express.Router();

router.put("/profile", protect, uploadFiles.single("avatar"), updateUserProfile);
router.get("/", protect, admin, getAllUsers);
router.delete("/:id", protect, admin, deleteUser);
router.put("/:id/role", protect, admin, updateUserRole);
router.put("/:id/status", protect, admin, updateUserStatus);

export default router;