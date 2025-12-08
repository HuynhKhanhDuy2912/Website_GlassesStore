const express = require('express');
const router = express.Router();
const brandController = require('../controllers/BrandController');
// Import middleware
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Đường dẫn tùy file của bạn

// --- PUBLIC ---
router.get('/', brandController.getAllBrands);
router.get('/:slug', brandController.getBrandBySlug);

// --- PROTECTED (Chỉ Admin mới làm được) ---
// Thứ tự: protect chạy trước (để lấy user) -> isAdmin chạy sau (để check quyền)
router.post('/', protect, isAdmin, brandController.createBrand);
router.put('/:id', protect, isAdmin, brandController.updateBrand);
router.delete('/:id', protect, isAdmin, brandController.deleteBrand);

module.exports = router;