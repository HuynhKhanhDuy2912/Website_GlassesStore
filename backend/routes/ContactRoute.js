const express = require('express');
const router = express.Router();
const contactController = require('../controllers/ContactController');

// Import Middleware
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- CẤU HÌNH BẢO VỆ CHUNG ---
// Tất cả các route bên dưới đều phải có Token (Đã đăng nhập)
router.use(protect);

/**
 * @route   POST /api/contacts
 * @desc    Gửi liên hệ (User gửi cho Admin)
 * @access  Private (Logged in User)
 */
router.post('/', contactController.sendContact);


// --- KHU VỰC ADMIN ---
/**
 * @route   GET /api/contacts
 * @desc    Admin xem danh sách tin nhắn
 * @access  Private (Admin Only)
 */
router.get('/', isAdmin, contactController.getAllContacts);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Admin xóa tin nhắn
 * @access  Private (Admin Only)
 */
router.delete('/:id', isAdmin, contactController.deleteContact);

module.exports = router;