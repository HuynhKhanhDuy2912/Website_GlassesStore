const express = require('express');
const router = express.Router();
const orderDetailController = require('../controllers/OrderDetailController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Tất cả đều cần đăng nhập
router.use(protect);

/**
 * @route   GET /api/order-details/:orderId
 * @desc    Lấy tất cả sản phẩm thuộc về Order ID kia
 * @access  Owner / Admin
 */
router.get('/:orderId', orderDetailController.getDetailsByOrder);

// --- ADMIN ROUTES ---
// Chỉ admin mới được phép can thiệp sửa đổi chi tiết đơn hàng đã đặt
router.post('/', isAdmin, orderDetailController.addDetail);
router.delete('/:id', isAdmin, orderDetailController.deleteDetail);

module.exports = router;