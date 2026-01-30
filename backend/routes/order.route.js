import express from "express";
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js";
import {
  addOrderItems,
  getOrder,
  listOrders,
  updateOrderStatus,
  getDashboardStats,
  cancelOrder,
  confirmOrder,
  deleteOrder,
  vnpayIPN,
  vnpayReturn,
} from "../controllers/order.controller.js";

const router = express.Router();

// --- VNPAY ROUTES ---
// Route nhận kết quả trả về từ VNPAY để hiển thị lên giao diện (User)
router.get("/vnpay_return", vnpayReturn);

// Route IPN để VNPAY cập nhật trạng thái đơn hàng ngầm (Public - Không cần verifyToken vì VNPAY gọi)
router.get("/vnpay_ipn", vnpayIPN);
// --------------------
// 1. Đặt hàng (User) - Trong này đã tích hợp logic tạo link VNPAY nếu paymentMethod là 'VNPay'
router.post("/", verifyToken, addOrderItems);

// 2. Lấy danh sách (Admin xem tất cả, User xem của mình)
router.get("/", verifyToken, listOrders);

// 3. Thống kê Dashboard (Chỉ Admin)
router.get("/stats", verifyToken, isAdmin, getDashboardStats);

// 4. Lấy chi tiết đơn
router.get("/:id", verifyToken, getOrder);

// 5. Admin xác nhận đơn
router.put("/:id/confirm", verifyToken, isAdmin, confirmOrder);

// 6. Admin cập nhật trạng thái khác
router.put("/:id", verifyToken, isAdmin, updateOrderStatus);

// 7. Hủy và xóa đơn
router.put("/:id/cancel", verifyToken, cancelOrder);
router.delete("/:id", verifyToken, isAdmin, deleteOrder);

export default router;
