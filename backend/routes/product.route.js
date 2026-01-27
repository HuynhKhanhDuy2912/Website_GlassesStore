import express from "express";
import { 
    createProduct, 
    listProducts, 
    deleteProduct, 
    getProductBySlug,
    getProduct,
    updateProduct
} from "../controllers/product.controller.js";

import { uploadFiles } from "../middleware/upload.js"; // file bạn vừa tạo

const router = express.Router();

// --- PUBLIC ROUTES ---

router.get("/", listProducts);
router.get("/:id", getProduct);
router.get("/slug/:slug", getProductBySlug);

// Tạo mới sản phẩm (POST) + upload nhiều ảnh
router.post("/", uploadFiles.array("images"), createProduct);

// Cập nhật sản phẩm (PUT) + upload nhiều ảnh
router.put("/:id", uploadFiles.array("images"), updateProduct);

// Xóa sản phẩm
router.delete("/:id", deleteProduct);

export default router;
