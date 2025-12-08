const Category = require('../models/Category');
const slugify = require('slugify'); // Nhớ: npm install slugify

const categoryController = {
    // 1. Tạo danh mục mới
    createCategory: async (req, res) => {
        try {
            const { category_name, description, image } = req.body;

            // Kiểm tra tên danh mục đã tồn tại chưa
            const existingCategory = await Category.findOne({ category_name });
            if (existingCategory) {
                return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
            }

            // Tự động tạo slug từ tên (Ví dụ: "Gọng Kính Nhựa" -> "gong-kinh-nhua")
            const slug = slugify(category_name, { lower: true });

            const newCategory = new Category({
                category_name,
                slug,
                description,
                image,
                isActive: true // Mặc định là hiện
            });

            await newCategory.save();
            res.status(201).json({ success: true, data: newCategory });

        } catch (error) {
            // Lỗi trùng slug (nếu có) hoặc lỗi server
            if (error.code === 11000) {
                 return res.status(400).json({ message: 'Slug danh mục bị trùng lặp.' });
            }
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Lấy danh sách danh mục
    getAllCategories: async (req, res) => {
        try {
            // Hỗ trợ lọc: ?active_only=true (Dùng cho khách hàng xem menu)
            // Nếu không truyền gì thì lấy tất cả (Dùng cho Admin quản lý)
            const query = {};
            if (req.query.active_only === 'true') {
                query.isActive = true;
            }

            const categories = await Category.find(query).sort({ createdAt: -1 });
            res.status(200).json({ success: true, count: categories.length, data: categories });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Lấy chi tiết danh mục theo SLUG (Để hiển thị trang sản phẩm của danh mục đó)
    getCategoryBySlug: async (req, res) => {
        try {
            const { slug } = req.params;
            const category = await Category.findOne({ slug });

            if (!category) {
                return res.status(404).json({ message: 'Danh mục không tồn tại' });
            }

            res.status(200).json({ success: true, data: category });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 4. Cập nhật danh mục
    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { category_name, description, image, isActive } = req.body;

            const category = await Category.findById(id);
            if (!category) return res.status(404).json({ message: 'Danh mục không tìm thấy' });

            // Nếu đổi tên, cần tạo lại slug mới
            if (category_name && category_name !== category.category_name) {
                category.slug = slugify(category_name, { lower: true });
                category.category_name = category_name;
            }

            if (description !== undefined) category.description = description;
            if (image !== undefined) category.image = image;
            if (isActive !== undefined) category.isActive = isActive;

            await category.save();
            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: category });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 5. Xóa danh mục
    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedCategory = await Category.findByIdAndDelete(id);

            if (!deletedCategory) {
                return res.status(404).json({ message: 'Danh mục không tồn tại để xóa' });
            }

            res.status(200).json({ success: true, message: 'Đã xóa danh mục' });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = categoryController;