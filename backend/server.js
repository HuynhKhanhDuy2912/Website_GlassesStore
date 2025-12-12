const express = require('express');
const mongoose = require('mongoose'); // Import mongoose
const cors = require('cors');
require('dotenv').config(); 

// Import các route
const userRoutes = require('./routes/userRoute'); 

const app = express();
app.use(cors());
app.use(express.json());

// --- KHU VỰC KẾT NỐI DB (Kiểm tra kỹ đoạn này) ---
const connectDB = async () => {
  try {
    // Nếu dùng local: đảm bảo MongoDB Compass đang chạy
    // Nếu dùng Cloud (Atlas): đảm bảo IP đã được whitelist
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully!"); // Phải thấy dòng này thì mới gọi API được
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // Dừng server nếu lỗi DB
  }
};

// Gọi hàm kết nối
connectDB(); 

// Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));