import express from "express";
import contactController from "../controllers/contact.controller.js";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// USER
router.post("/", verifyToken, upload.single("image"), contactController.sendContact);
router.get("/my-history", verifyToken, contactController.getMyContacts);
router.put("/:id/chat", verifyToken, upload.single("image"), contactController.addMessage);

// ADMIN
router.get("/", verifyToken, isAdmin, contactController.getAllContacts);

// CẢ HAI
router.put("/:id/read", verifyToken, contactController.markAsRead);
router.delete("/:id", verifyToken, contactController.deleteContact);

export default router;
