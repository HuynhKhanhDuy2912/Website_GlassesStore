const express = require('express');
const router = express.Router();
const productController = require('../controllers/ProductController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// --- PUBLIC ROUTES (Ai cũng xem được) ---

/**
 * @route   GET /api/products
 * @desc    Lấy danh sách sản phẩm (kèm lọc, sort, search)
 * @params  ?page=1&limit=10&keyword=rayban&price[gte]=1000000&brand_id=...
 */
router.get('/', productController.getAllProducts);

/**
 * @route   GET /api/products/:slug
 * @desc    Xem chi tiết sản phẩm (Dùng slug cho URL đẹp)
 * @example /api/products/kinh-ram-rayban-aviator
 */
router.get('/:slug', productController.getProductBySlug);


// --- ADMIN ROUTES (Cần Login & Quyền Admin) ---

/**
 * @route   POST /api/products
 * @desc    Tạo sản phẩm mới
 */
router.post('/', protect, isAdmin, productController.createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Cập nhật sản phẩm (Dùng ID, không dùng slug khi sửa để chính xác)
 */
router.put('/:id', protect, isAdmin, productController.updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Xóa sản phẩm
 */
router.delete('/:id', protect, isAdmin, productController.deleteProduct);

module.exports = router;