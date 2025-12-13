const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); 

// 1. Import Middleware bảo vệ
// (Đảm bảo đường dẫn '../middleware/authMiddleware' là đúng với cấu trúc folder của bạn)
const { protect, isAdmin } = require('../middlewares/authMiddleware'); // <--- THÊM DÒNG NÀY

// GET /api/users/ 
router.get('/', protect, isAdmin, userController.getAllUsers);

// POST /api/users/ (Tạo user từ trang Admin)
router.post('/', protect, isAdmin, userController.createUser);

// PUT /api/users/:id 
router.put('/:id', protect, isAdmin, userController.updateUser);

// DELETE /api/users/:id 
router.delete('/:id', protect, isAdmin, userController.deleteUser);


// --- ROUTE CÔNG KHAI (PUBLIC) ---
// Đăng nhập thì ai cũng được phép, không được chặn!
router.post('/login', userController.login);

module.exports = router;