const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

router.use(protect);

// 1. --- ROUTE CỤ THỂ (Đặt lên đầu tiên) ---
// Frontend đang gọi api/order (từ server.js) + /my-orders (từ đây)
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders); // <--- QUAN TRỌNG: Đặt ở trên /:id

// 2. --- ROUTE THAM SỐ ĐỘNG (Đặt xuống dưới) ---
// Nếu đặt /:id ở trên, server sẽ tưởng 'my-orders' là một cái id -> Lỗi 500
router.get('/:id', orderController.getOrderById); 

// 3. --- Admin Route ---
router.get('/', isAdmin, orderController.getAllOrders);
router.put('/:id/status', isAdmin, orderController.updateOrderStatus);
router.put('/:id/cancel', orderController.cancelOrderUser);
module.exports = router;