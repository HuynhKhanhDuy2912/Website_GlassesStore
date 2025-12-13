const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/PaymentController');
const { protect , isAdmin } = require('../middlewares/authMiddleware');

// Yêu cầu đăng nhập
router.use(protect);

/**
 * @route   POST /api/payments
 * @desc    Tạo phiếu thanh toán (Thường gọi ngay sau khi tạo Order)
 * @access  Private
 */
router.post('/', paymentController.createPayment);

/**
 * @route   POST /api/payments/vnpay-update
 * @desc    Cập nhật kết quả từ VNPAY (Frontend gửi data về sau khi redirect)
 * @access  Private
 */
router.post('/vnpay-update', paymentController.updateVnpayResult);

/**
 * @route   GET /api/payments/:orderId
 * @desc    Xem trạng thái thanh toán của đơn hàng
 * @access  Private
 */
router.get('/:orderId', paymentController.getPaymentByOrder);

router.get('/', protect, isAdmin, paymentController.getAllPayments);
module.exports = router;