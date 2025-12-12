const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// --- TẤT CẢ PHẢI ĐĂNG NHẬP ---
router.use(protect);

/**
 * @route   POST /api/orders
 * @desc    Tạo đơn hàng mới (Checkout)
 * @access  Customer
 */
router.post('/', orderController.createOrder);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Xem lịch sử mua hàng của tôi
 * @access  Customer
 */
router.get('/my-orders', orderController.getMyOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Xem chi tiết 1 đơn hàng (Gồm cả list sản phẩm)
 * @access  Customer / Admin
 */
router.get('/:id', orderController.getOrderById);


// --- ADMIN ROUTES ---

/**
 * @route   GET /api/orders
 * @desc    Admin xem toàn bộ đơn hàng
 * @access  Admin
 */
router.get('/', isAdmin, orderController.getAllOrders);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Admin cập nhật trạng thái (Duyệt đơn)
 * @body    { "status": "processing" }
 * @access  Admin
 */
router.put('/:id/status', isAdmin, orderController.updateOrderStatus);

module.exports = router;