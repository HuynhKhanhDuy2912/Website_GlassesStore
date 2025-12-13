const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Kiểm tra header có dạng: "Bearer eyJhbGci..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Lấy token (Bỏ chữ 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Lấy user từ DB (Loại bỏ password)
      // .select('-password') cực quan trọng để bảo mật thông tin
      req.user = await User.findById(decoded.id).select('-password');

      // 4. [QUAN TRỌNG] Kiểm tra user còn tồn tại không
      // Phòng trường hợp User bị Admin xóa nick nhưng Token cũ vẫn còn hạn
      if (!req.user) {
        return res.status(401).json({ message: 'Người dùng không còn tồn tại.' });
      }

      next(); // Cho phép đi tiếp

    } catch (error) {
      console.error("Auth Error:", error.message); 
      return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
  }

  // Nếu không vào được khối if ở trên (tức là không có token)
  if (!token) {
    return res.status(401).json({ message: 'Không có token, vui lòng đăng nhập.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') { 
    next();
  } else {

    return res.status(403).json({ message: 'Bạn không có quyền quản trị viên.' });
  }
};

module.exports = { protect, isAdmin };