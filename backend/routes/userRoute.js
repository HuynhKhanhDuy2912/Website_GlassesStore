const express = require('express');
const router = express.Router();
const { register, login, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// Route đăng ký người dùng
router.post('/register', register);

// Route đăng nhập người dùng
router.post('/login', login);

// Route lấy thông tin người dùng (cần xác thực)
router.get('/profile', protect, getUser);

// Route cập nhật thông tin người dùng (cần xác thực)
router.put('/profile', protect, updateUser);

// Route xóa người dùng (chỉ dành cho admin)
router.delete('/:id', protect, isAdmin, deleteUser);

module.exports = router;
