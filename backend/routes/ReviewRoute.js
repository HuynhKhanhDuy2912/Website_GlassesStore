const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/ReviewController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---
// Xem đánh giá của sản phẩm thì ai cũng xem được (không cần login)
// GET /api/reviews/product/:productId
router.get('/product/:productId', reviewController.getReviewsByProduct);


// --- PRIVATE ROUTES (Cần đăng nhập) ---

// Đăng đánh giá mới
// POST /api/reviews
router.post('/', protect, reviewController.addReview);

// Xóa đánh giá (Của mình hoặc Admin xóa)
// DELETE /api/reviews/:id
router.delete('/:id', protect, reviewController.deleteReview);


// --- ADMIN ROUTES ---

// Admin đổi trạng thái ẩn/hiện
// PUT /api/reviews/:id/status
router.put('/:id/status', protect, isAdmin, reviewController.toggleReviewStatus);

// Admin xem tất cả đánh giá trong hệ thống
// GET /api/reviews/admin/all
router.get('/admin/all', protect, isAdmin, reviewController.getAllReviewsAdmin);

module.exports = router;