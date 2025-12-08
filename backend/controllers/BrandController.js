const Brand = require('../models/Brand'); // Đường dẫn tới file model của bạn
const slugify = require('slugify'); // Cần cài: npm install slugify

const brandController = {
  // 1. Tạo thương hiệu mới
  createBrand: async (req, res) => {
    try {
      const { name, description, image, country } = req.body;

      // Tự động tạo slug nếu frontend không gửi lên
      const slug = req.body.slug || slugify(name, { lower: true });

      // Kiểm tra trùng lặp (dù Schema đã có unique, check ở đây để báo lỗi rõ hơn)
      const existingBrand = await Brand.findOne({ $or: [{ name }, { slug }] });
      if (existingBrand) {
        return res.status(400).json({ message: 'Thương hiệu hoặc slug đã tồn tại.' });
      }

      const newBrand = new Brand({
        name,
        slug,
        description,
        image, // Ở đây giả sử bạn gửi lên đường dẫn ảnh (string)
        country
      });

      await newBrand.save();
      res.status(201).json({ success: true, data: newBrand });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 2. Lấy tất cả thương hiệu
  getAllBrands: async (req, res) => {
    try {
      // Có thể lọc chỉ lấy những brand đang active (cho khách hàng xem)
      // Nếu là Admin thì có thể muốn xem tất cả. Ví dụ check query params.
      const query = {};
      if (req.query.active_only === 'true') {
        query.isActive = true;
      }

      const brands = await Brand.find(query).sort({ createdAt: -1 }); // Mới nhất lên đầu
      res.status(200).json({ success: true, count: brands.length, data: brands });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 3. Lấy chi tiết thương hiệu theo SLUG (Tốt cho SEO hơn là dùng ID)
  getBrandBySlug: async (req, res) => {
    try {
      const brand = await Brand.findOne({ slug: req.params.slug });
      if (!brand) {
        return res.status(404).json({ message: 'Không tìm thấy thương hiệu này.' });
      }
      res.status(200).json({ success: true, data: brand });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 4. Cập nhật thương hiệu (Theo ID)
  updateBrand: async (req, res) => {
    try {
      const { name } = req.body;
      let updateData = { ...req.body };

      // Nếu có sửa tên, thì nên update lại slug cho đồng bộ
      if (name) {
        updateData.slug = slugify(name, { lower: true });
      }

      const updatedBrand = await Brand.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true } // Trả về data mới sau khi update
      );

      if (!updatedBrand) {
        return res.status(404).json({ message: 'Không tìm thấy thương hiệu để sửa.' });
      }

      res.status(200).json({ success: true, data: updatedBrand });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 5. Xóa thương hiệu (Theo ID)
  deleteBrand: async (req, res) => {
    try {
      const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
      
      if (!deletedBrand) {
        return res.status(404).json({ message: 'Không tìm thấy thương hiệu để xóa.' });
      }

      res.status(200).json({ success: true, message: 'Đã xóa thương hiệu thành công.' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
};

module.exports = brandController;