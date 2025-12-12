const Product = require('../models/Product');
const slugify = require('slugify'); // npm install slugify

const productController = {
    // 1. Tạo sản phẩm mới (Admin)
    createProduct: async (req, res) => {
        try {
            // Destructuring dữ liệu từ body
            // Lưu ý: category_id và brand_id phải là ID hợp lệ của MongoDB
            const { 
                product_name, price, discount, description, 
                image_url, images, category_id, brand_id, 
                size, color, material, quantity, isFeatured, status 
            } = req.body;

            // Tự động tạo slug từ tên
            const slug = slugify(product_name, { lower: true, strict: true });

            // Kiểm tra trùng slug
            const existingProduct = await Product.findOne({ slug });
            if (existingProduct) {
                return res.status(400).json({ message: 'Tên sản phẩm (slug) đã tồn tại' });
            }

            const newProduct = new Product({
                product_name,
                slug,
                price,
                discount,
                description,
                image_url,
                images,
                category_id,
                brand_id, // Đã thay thế theo yêu cầu của bạn
                size,
                color,
                material,
                quantity,
                isFeatured,
                status: quantity > 0 ? 'in_stock' : 'out_of_stock' // Logic tự động set status
            });

            await newProduct.save();
            res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: newProduct });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Lấy danh sách sản phẩm (Có Lọc, Tìm kiếm, Phân trang)
    // Quan trọng nhất cho trang chủ và trang Shop
    getAllProducts: async (req, res) => {
        try {
            // A. Xây dựng bộ lọc (Filter)
            const queryObj = { ...req.query };
            const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
            excludedFields.forEach(el => delete queryObj[el]);

            // 1. Lọc cơ bản (brand_id, category_id, isFeatured...)
            let queryStr = JSON.stringify(queryObj);
            
            // 2. Lọc theo giá (gte = lớn hơn, lte = nhỏ hơn)
            // URL ví dụ: ?price[gte]=100000&price[lte]=500000
            queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
            
            let query = Product.find(JSON.parse(queryStr));

            // 3. Tìm kiếm theo tên (Keyword)
            if (req.query.keyword) {
                const keyword = req.query.keyword;
                query = query.find({
                    product_name: { $regex: keyword, $options: 'i' } // 'i' là không phân biệt hoa thường
                });
            }

            // B. Sắp xếp (Sort)
            if (req.query.sort) {
                // Ví dụ: ?sort=-price (Giá giảm dần), ?sort=price (Giá tăng dần)
                const sortBy = req.query.sort.split(',').join(' ');
                query = query.sort(sortBy);
            } else {
                query = query.sort('-createdAt'); // Mặc định mới nhất lên đầu
            }

            // C. Phân trang (Pagination)
            const page = req.query.page * 1 || 1;
            const limit = req.query.limit * 1 || 10;
            const skip = (page - 1) * limit;

            query = query.skip(skip).limit(limit);

            // D. Populate (Để hiển thị tên Brand và Category thay vì ID)
            query = query.populate('category_id', 'category_name slug')
                         .populate('brand_id', 'name slug country');

            // THỰC THI QUERY
            const products = await query;

            // Đếm tổng số sản phẩm (để frontend tính số trang)
            const totalProducts = await Product.countDocuments(JSON.parse(queryStr));

            res.status(200).json({ 
                success: true, 
                count: products.length, 
                total: totalProducts,
                page,
                data: products 
            });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Lấy chi tiết 1 sản phẩm theo SLUG
    getProductBySlug: async (req, res) => {
        try {
            const product = await Product.findOne({ slug: req.params.slug })
                                         .populate('category_id', 'category_name slug')
                                         .populate('brand_id', 'name slug image');

            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            res.status(200).json({ success: true, data: product });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 4. Cập nhật sản phẩm (Admin)
    updateProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const { product_name } = req.body;

            // Nếu user sửa tên sản phẩm, cần tạo lại slug
            if (product_name) {
                req.body.slug = slugify(product_name, { lower: true, strict: true });
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { 
                new: true, // Trả về data mới
                runValidators: true // Chạy validate lại theo Schema
            });

            if (!updatedProduct) {
                return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
            }

            res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedProduct });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 5. Xóa sản phẩm (Admin)
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedProduct = await Product.findByIdAndDelete(id);

            if (!deletedProduct) {
                return res.status(404).json({ message: 'Sản phẩm không tìm thấy' });
            }

            res.status(200).json({ success: true, message: 'Đã xóa sản phẩm' });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = productController;