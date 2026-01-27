import express from "express";
import { getCart, addToCart, updateCartItem, removeCartItem } from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// mọi hành động trong giỏ hàng cần đăng nhập
router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/item", updateCartItem);
router.delete("/item/:productId", removeCartItem);

export default router;
