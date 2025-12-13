const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/CategoryController');

// Import Middleware bảo vệ
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// --- PUBLIC ROUTES (Ai cũng xem được) ---

// GET /api/categories
// Có thể gọi: /api/categories?active_only=true để lấy danh sách hiển thị lên Menu
router.get('/', categoryController.getAllCategories);

// GET /api/categories/:slug
// Lấy chi tiết 1 danh mục (Ví dụ: /api/categories/gong-kinh-kim-loai)
router.get('/:slug', categoryController.getCategoryBySlug);


// --- ADMIN ROUTES (Chỉ Admin mới được dùng) ---
// Các route dưới đây sẽ đi qua 2 chốt chặn: protect (đăng nhập) -> isAdmin (quyền)

router.post('/', protect, isAdmin, categoryController.createCategory);

router.put('/:id', protect, isAdmin, categoryController.updateCategory);

router.delete('/:id', protect, isAdmin, categoryController.deleteCategory);

module.exports = router;