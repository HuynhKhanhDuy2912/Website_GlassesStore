import Banner from "../models/Banner.js";

// 1. Lấy danh sách Banner đang hoạt động (Cho trang chủ - Public)
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải banner" });
  }
};

// 2. Lấy tất cả Banner (Cho Admin)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tải danh sách banner" });
  }
};

// 3. Thêm Banner mới (Admin)
export const createBanner = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn ảnh banner" });
    }

    const newBanner = await Banner.create({
      title,
      description,
      image: `/uploads/${req.file.filename}`, // Lưu đường dẫn ảnh
      isActive: true
    });

    res.status(201).json(newBanner);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo banner", error: error.message });
  }
};

// 4. Xóa Banner (Admin)
export const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa banner" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa banner" });
  }
};

// 5. Bật/Tắt Banner (Admin)
export const toggleBannerActive = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if(banner) {
      banner.isActive = !banner.isActive;
      await banner.save();
      res.json(banner);
    } else {
      res.status(404).json({ message: "Không tìm thấy banner" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật trạng thái" });
  }
};