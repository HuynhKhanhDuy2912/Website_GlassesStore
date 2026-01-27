// import express from "express";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from "url";

// const router = express.Router();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Cấu hình Multer
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, path.join(__dirname, "../uploads"));
//     },
//     filename: function (req, file, cb) {
//         const ext = path.extname(file.originalname);
//         cb(null, `${Date.now()}${ext}`);
//     }
// });

// const upload = multer({ storage });

// // Route upload ảnh
// router.post("/", upload.single("image"), (req, res) => {
//     if (!req.file) return res.status(400).json({ message: "Không có file được upload" });
//     res.json({ image: `/uploads/${req.file.filename}` });
// });

// export default router;
import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Thư mục lưu ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // thư mục uploads nằm ngang hàng server.js
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Chưa có file" });

  // Trả về đường dẫn để client lưu vào DB
 res.status(200).json({ image: `/uploads/${req.file.filename}` });

});

export default router;
