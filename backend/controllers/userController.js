const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Đăng ký người dùng
const register = async (req, res) => {
  const { username, password, fullname, email, phone_number, address } = req.body;

  try {
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username đã tồn tại' });
    }

    // Mã hóa mật khẩu trước khi lưu vào DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = new User({
      username,
      password: hashedPassword,
      fullname,
      email,
      phone_number,
      address,
    });

    // Lưu người dùng vào DB
    await newUser.save();
    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

// Đăng nhập người dùng
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác' });
    }

    // Tạo token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secretkey', {
      expiresIn: '1h', // Token sẽ hết hạn sau 1 giờ
    });

    res.json({ message: 'Đăng nhập thành công', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

// Lấy thông tin người dùng
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  const { fullname, email, phone_number, address } = req.body;
  
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.phone_number = phone_number || user.phone_number;
    user.address = address || user.address;

    await user.save();
    res.json({ message: 'Cập nhật thông tin thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

// Xóa người dùng (chỉ admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Có lỗi xảy ra' });
  }
};

module.exports = { register, login, getUser, updateUser, deleteUser };
