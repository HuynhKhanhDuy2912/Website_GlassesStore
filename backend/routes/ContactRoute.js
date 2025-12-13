const express = require('express');
const router = express.Router();
const contactController = require('../controllers/ContactController');

// Import Middleware
const { protect, isAdmin } = require('../middlewares/authMiddleware');

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
router.put('/:id/reply', isAdmin, contactController.replyContact);
router.get('/my-history', protect, contactController.getMyContacts);
router.put('/:id/chat', protect, contactController.addMessage);
module.exports = router;