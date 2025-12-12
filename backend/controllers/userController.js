const User = require('../models/User'); // Đảm bảo đường dẫn model đúng
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 1. Lấy danh sách tất cả user (GET /)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// 2. Tạo User mới (POST /) - Dùng cho Admin tạo, hoặc Register
const createUser = async (req, res) => {
  // Lấy dữ liệu từ body (khớp với form bên Frontend)
  const { fullName, email, password, role, phone, address } = req.body;

  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = new User({
      fullname: fullName, // Map từ fullName (frontend) sang fullname (db)
      email,
      password: hashedPassword,
      role: role || 'customer',
      phone_number: phone, // Map từ phone (frontend) sang phone_number (db)
      address,
      username: email.split('@')[0] // Tự tạo username từ email nếu không nhập
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tạo người dùng: ' + error.message });
  }
};

// 3. Cập nhật User theo ID (PUT /:id)
const updateUser = async (req, res) => {
  const { id } = req.params; // Lấy ID từ URL
  const { fullName, email, role, phone, address, password } = req.body;
  
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    // Cập nhật thông tin cơ bản
    user.fullname = fullName || user.fullname;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone_number = phone || user.phone_number;
    user.address = address || user.address;

    // Nếu có nhập password mới thì mới mã hóa và cập nhật
    if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ message: 'Cập nhật thành công', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cập nhật: ' + error.message });
  }
};

// 4. Xóa User (DELETE /:id)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi xóa người dùng' });
  }
};

// 5. Đăng nhập (Giữ nguyên logic cũ của bạn)
const login = async (req, res) => {
  const { email, password } = req.body; // Thường login bằng email tiện hơn username

  try {
    // Tìm user theo email (hoặc username tùy bạn chọn)
    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác' });
    }

    const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET || 'secretkey', 
        { expiresIn: '1d' }
    );

    res.json({ 
      message: 'Đăng nhập thành công', 
      token, 
      user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          avatar: user.avatar
      }
  });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đăng nhập' });
  }
};

// Xuất khẩu đầy đủ các hàm để Route sử dụng
module.exports = { 
    getAllUsers, 
    createUser,   // Quan trọng: Phải có cái này để fix lỗi TypeError
    updateUser, 
    deleteUser,
    login 
};