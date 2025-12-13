const express = require('express');
const router = express.Router();

// Import Controller
const cartController = require('../controllers/CartController');

// Import Middleware xác thực (Để đảm bảo req.user luôn tồn tại)
const { protect } = require('../middlewares/authMiddleware');

// --- CẤU HÌNH MIDDLEWARE CHUNG ---
// Dòng này áp dụng 'protect' cho tất cả các route bên dưới. 
// Bạn không cần viết lặp lại 'protect' ở từng dòng nữa.
router.use(protect);


// --- CÁC ROUTE GIỎ HÀNG ---

/**
 * @route   GET /api/cart
 * @desc    Lấy giỏ hàng hiện tại (Sẽ tự động cập nhật giá mới nhất từ Product)
 * @access  Private (Customer)
 */
router.get('/', cartController.getCart);

/**
 * @route   POST /api/cart/add
 * @desc    Thêm sản phẩm vào giỏ hàng
 * @body    { "product_id": "...", "quantity": 1 }
 * @access  Private (Customer)
 */
router.post('/add', cartController.addToCart);

/**
 * @route   PUT /api/cart/update
 * @desc    Cập nhật số lượng của một sản phẩm trong giỏ
 * @body    { "product_id": "...", "quantity": 3 }
 * @access  Private (Customer)
 */
router.put('/update', cartController.updateItemQuantity);

/**
 * @route   DELETE /api/cart/clear
 * @desc    Làm trống giỏ hàng (Xóa tất cả)
 * @access  Private (Customer)
 */
router.delete('/clear', cartController.clearCart);

/**
 * @route   DELETE /api/cart/:product_id
 * @desc    Xóa một sản phẩm cụ thể khỏi giỏ
 * @param   product_id (Lấy từ URL)
 * @access  Private (Customer)
 */
router.delete('/:product_id', cartController.removeItem);

module.exports = router;