
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order'); // Dùng nếu muốn check "đã mua mới được review"

const reviewController = {

    // 1. Thêm đánh giá mới
    addReview: async (req, res) => {
        try {
            const { product_id, rating, comment } = req.body;
            const userId = req.user._id;

            // A. Kiểm tra sản phẩm có tồn tại không
            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            }

            // B. (Nâng cao) Kiểm tra xem User đã mua sản phẩm này chưa?
            // Nếu bạn muốn bật tính năng này, hãy bỏ comment đoạn dưới:
            /*
            const hasPurchased = await Order.findOne({
                user_id: userId,
                "orderItems.product_id": product_id,
                status: 'completed' // Chỉ đơn hàng thành công mới được review
            });
            if (!hasPurchased) {
                return res.status(400).json({ message: 'Bạn cần mua sản phẩm này để viết đánh giá.' });
            }
            */

            // C. Kiểm tra xem User đã từng review sản phẩm này chưa?
            const existingReview = await Review.findOne({ user_id: userId, product_id });
            if (existingReview) {
                return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi.' });
            }

            // D. Tạo review
            const newReview = new Review({
                user_id: userId,
                product_id,
                rating,
                comment,
                status: 'Show' // Mặc định hiện
            });

            await newReview.save();

            res.status(201).json({ success: true, message: 'Đánh giá thành công', data: newReview });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Lấy danh sách đánh giá của 1 sản phẩm (Public)
    getReviewsByProduct: async (req, res) => {
        try {
            const { productId } = req.params;

            // Chỉ lấy các review có status là 'Show'
            const reviews = await Review.find({ product_id: productId, status: 'Show' })
                .populate('user_id', 'fullname avatar') // Lấy tên và avatar người review
                .sort({ created_at: -1 }); // Mới nhất lên đầu

            // Tính điểm trung bình (Optional - để hiển thị lên UI)
            const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
            const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

            res.status(200).json({ 
                success: true, 
                count: reviews.length, 
                average_rating: avgRating,
                data: reviews 
            });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Xóa đánh giá (User xóa của mình, Admin xóa tất cả)
    deleteReview: async (req, res) => {
        try {
            const { id } = req.params;
            const review = await Review.findById(id);

            if (!review) {
                return res.status(404).json({ message: 'Đánh giá không tồn tại' });
            }

            // Kiểm tra quyền: Chỉ chủ sở hữu HOẶC Admin mới được xóa
            if (review.user_id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
            }

            await Review.findByIdAndDelete(id);
            res.status(200).json({ success: true, message: 'Đã xóa đánh giá' });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // --- ADMIN ONLY ---

    // 4. Admin duyệt/ẩn đánh giá (Ví dụ: Ẩn các comment chửi bậy)
    toggleReviewStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body; // 'Show' hoặc 'Hidden'

            if (!['Show', 'Hidden'].includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }

            const review = await Review.findByIdAndUpdate(
                id, 
                { status: status }, 
                { new: true }
            );

            if (!review) return res.status(404).json({ message: 'Review không tìm thấy' });

            res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', data: review });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 5. Admin xem tất cả đánh giá (Kể cả Hidden) để quản lý
    getAllReviewsAdmin: async (req, res) => {
        try {
            const reviews = await Review.find()
                .populate('user_id', 'fullname email')
                .populate('product_id', 'product_name slug')
                .sort({ created_at: -1 });

            res.status(200).json({ success: true, count: reviews.length, data: reviews });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = reviewController;