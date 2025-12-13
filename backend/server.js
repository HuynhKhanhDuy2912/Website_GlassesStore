const express = require('express');
const mongoose = require('mongoose'); // Import mongoose
const cors = require('cors');
require('dotenv').config(); 

// Import các route
const userRoutes = require('./routes/userRoute'); 
const brand = require('./routes/BrandRoute');
const cart = require('./routes/CartRoute');
const cartItem = require('./routes/CartItemRoute');
const category = require('./routes/CategoryRoute');
const contact = require('./routes/ContactRoute');
const order = require('./routes/OrderRoute');
const orderDetail = require('./routes/OrderDetailRoute');
const payment = require('./routes/PaymentRoute');
const product = require('./routes/ProductRoute');
const review = require('./routes/ReviewRoute');
const shippingAddress = require('./routes/ShippingAddressRoute');
const upload = require('./routes/UploadRoute');

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
app.use('/api/brands', brand);
app.use('/api/cart', cart);
app.use('/api/cartItem', cartItem);
app.use('/api/category', category);
app.use('/api/contact', contact);
app.use('/api/order', order);
app.use('/api/orderDetail', orderDetail);
app.use('/api/payment', payment);
app.use('/api/product', product);
app.use('/api/review', review);
app.use('/api/shippingAddress', shippingAddress);
app.use('/api/upload', upload);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));