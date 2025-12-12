const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Đảm bảo đường dẫn đúng

// GET /api/users/  -> Sẽ gọi userController.getAllUsers
// Lưu ý: Chỉ để dấu '/' chứ KHÔNG để '/api/users' hay '/users' ở đây nữa
router.get('/', userController.getAllUsers);

// POST /api/users/ (Tạo mới)
router.post('/', userController.createUser);

// PUT /api/users/:id (Sửa)
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id (Xóa)
router.delete('/:id', userController.deleteUser);

router.post('/login', userController.login);
module.exports = router;