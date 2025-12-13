const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Config Storage (Nơi lưu và cách lưu)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'glasses-store', // Tên folder trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Định dạng cho phép
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Resize ảnh nếu muốn
  },
});

const upload = multer({ storage });

module.exports = upload;