const express = require('express');
const router = express.Router();
const upload = require('../config/cloudinary'); // Import file cấu hình vừa tạo

// API: POST /api/upload
// 'image' là tên key mà frontend phải gửi đúng
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file nào được tải lên' });
  }

  // Trả về link ảnh online
  res.status(200).json({
    success: true,
    message: 'Upload thành công',
    imageUrl: req.file.path // <-- Đây là cái link bạn cần lưu vào DB (Brand, Product...)
  });
});

module.exports = router;