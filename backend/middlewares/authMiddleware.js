const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Lấy token
      token = req.headers.authorization.split(' ')[1];

      // 2. Kiểm tra JWT Secret (Bắt buộc phải có trong .env)
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET chưa được cấu hình!');
      }

      // 3. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Lấy user từ DB (Loại bỏ password)
      const user = await User.findById(decoded.id).select('-password');

      // --- [QUAN TRỌNG] Kiểm tra user còn tồn tại không ---
      if (!user) {
        return res.status(401).json({ message: 'Người dùng không còn tồn tại.' });
      }

      // Gán user vào request để dùng ở các bước sau
      req.user = user;
      next();

    } catch (error) {
      console.error(error); // Log lỗi ra console để debug
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  }

  // Trường hợp không có token trong header
  if (!token) {
    return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập.' });
  }
};

const isAdmin = (req, res, next) => {
  // Kiểm tra user có tồn tại và role có phải Admin không
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    // 403: Forbidden (Biết là ai nhưng không có quyền)
    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên.' });
  }
};

module.exports = { protect, isAdmin };