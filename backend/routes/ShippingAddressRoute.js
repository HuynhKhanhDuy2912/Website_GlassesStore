const express = require('express');
const router = express.Router();
const shippingAddressController = require('../controllers/ShippingAddressController');
const { protect } = require('../middleware/authMiddleware');

// Bảo vệ tất cả route
router.use(protect);

/**
 * @route   GET /api/addresses
 * @desc    Lấy danh sách địa chỉ của tôi
 */
router.get('/', shippingAddressController.getMyAddresses);

/**
 * @route   POST /api/addresses
 * @desc    Thêm địa chỉ mới
 */
router.post('/', shippingAddressController.createAddress);

/**
 * @route   GET /api/addresses/:id
 * @desc    Lấy chi tiết 1 địa chỉ
 */
router.get('/:id', shippingAddressController.getAddressById);

/**
 * @route   PUT /api/addresses/:id
 * @desc    Sửa địa chỉ
 */
router.put('/:id', shippingAddressController.updateAddress);

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Xóa địa chỉ
 */
router.delete('/:id', shippingAddressController.deleteAddress);

/**
 * @route   PUT /api/addresses/:id/set-default
 * @desc    Đặt làm địa chỉ mặc định nhanh
 */
router.put('/:id/set-default', shippingAddressController.setDefault);

module.exports = router;