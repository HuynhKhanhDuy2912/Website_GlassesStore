const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/CartItemController');
const { protect } = require('../middlewares/authMiddleware');

// Tất cả thao tác giỏ hàng đều cần đăng nhập
router.use(protect);

// GET /api/cart-items -> Xem chi tiết các món trong giỏ
router.get('/', cartItemController.getMyCartItems);

// POST /api/cart-items -> Thêm mới (Body: product_id, quantity)
router.post('/', cartItemController.addItem);

// PUT /api/cart-items/:id -> Sửa số lượng (Param: ID của CartItem)
router.put('/:id', cartItemController.updateItem);

// DELETE /api/cart-items/:id -> Xóa món (Param: ID của CartItem)
router.delete('/:id', cartItemController.deleteItem);

module.exports = router;