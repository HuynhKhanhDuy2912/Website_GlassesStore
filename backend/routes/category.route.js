import express from "express";
import {
  createCategory,
  listCategories,
  deleteCategory,
  getCategory,
  updateCategory,
} from "../controllers/category.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", listCategories);
router.get("/:id", getCategory);
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

export default router;
