import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js"; 

// ============================================================
// HELPER: Tính toán lại rating trung bình cho Product
// ============================================================
const calcAverageRating = async (productId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { product: productId, approved: true } }, // Chỉ tính các review đã được duyệt
      { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);

    const update = stats.length > 0 
      ? { avgRating: stats[0].avg.toFixed(1), reviewCount: stats[0].count }
      : { avgRating: 0, reviewCount: 0 };

    await Product.findByIdAndUpdate(productId, update);
  } catch (error) {
    console.error("Lỗi tính điểm trung bình:", error);
  }
};

// ============================================================
// 1. NGƯỜI DÙNG: Viết đánh giá (Yêu cầu đã mua & đơn đã hoàn thành)
// ============================================================
export const addReview = async (req, res, next) => {
  try {
    const userId = req.user.id; // Lấy ID user từ middleware protect
    const { productId, rating, title, content } = req.body;

    // 1. Kiểm tra sản phẩm có tồn tại không
    const p = await Product.findById(productId);
    if (!p) return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    // 2. KIỂM TRA ĐIỀU KIỆN: ĐÃ MUA & ĐƠN HÀNG "COMPLETED"
    // Dựa trên Model Order bạn cung cấp:
    // - status: "completed"
    // - items: mảng chứa { product: ObjectId }
    const hasPurchased = await Order.findOne({
        user: userId,
        status: "completed", 
        "items.product": productId 
    });

    if (!hasPurchased) {
        return res.status(400).json({ 
            message: "Bạn cần mua sản phẩm này và đơn hàng đã hoàn thành mới được phép đánh giá!" 
        });
    }

    // 3. Kiểm tra xem đã đánh giá chưa (để cập nhật hoặc tạo mới)
    const existing = await Review.findOne({ user: userId, product: productId });
    
    if (existing) {
      // Cập nhật review cũ
      existing.rating = rating;
      existing.title = title;
      existing.content = content;
      // existing.approved = false; // Bỏ comment dòng này nếu muốn review sửa xong phải chờ duyệt lại
      await existing.save();
      
      await calcAverageRating(p._id); // Tính lại điểm
      return res.json({ message: "Đã cập nhật đánh giá của bạn" });
    } else {
      // Tạo review mới
      await Review.create({ 
          user: userId, 
          product: productId, 
          rating, 
          title, 
          content 
      });
      
      await calcAverageRating(p._id); // Tính lại điểm
      return res.json({ message: "Đã gửi đánh giá thành công" });
    }

  } catch (err) { 
    next(err); 
  }
};

// ============================================================
// 2. PUBLIC: Lấy danh sách review của 1 sản phẩm (Chỉ lấy approved)
// ============================================================
export const listReviews = async (req, res, next) => {
  try {
    const { productId } = req.query;
    
    // Điều kiện: Review thuộc sản phẩm đó VÀ đã được duyệt
    const filter = { approved: true };
    if (productId) filter.product = productId;

    const reviews = await Review.find(filter)
      .populate("user", "name avatarUrl") // Lấy tên và avatar người dùng
      .sort("-createdAt"); // Mới nhất lên đầu

    res.json(reviews);
  } catch (err) { next(err); }
};

// ============================================================
// 3. ADMIN: Lấy tất cả review (Quản lý)
// ============================================================
export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find({})
      .populate("user", "name email")
      .populate("product", "name image images") // Lấy thông tin sản phẩm để admin biết review cái gì
      .sort("-createdAt");
    res.json(reviews);
  } catch (err) { next(err); }
};

// ============================================================
// 4. ADMIN: Duyệt hoặc Ẩn review
// ============================================================
export const toggleApproveReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Không tìm thấy review" });

    review.approved = !review.approved; // Đổi trạng thái true <-> false
    await review.save();

    // Tính lại điểm trung bình vì số lượng review được hiển thị đã thay đổi
    await calcAverageRating(review.product);

    res.json({ message: `Đã ${review.approved ? "hiện" : "ẩn"} đánh giá này` });
  } catch (err) { next(err); }
};

// ============================================================
// 5. ADMIN: Trả lời review
// ============================================================
export const replyReview = async (req, res, next) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Không tìm thấy review" });

    review.adminResponse = response;
    await review.save();

    res.json({ message: "Đã gửi câu trả lời" });
  } catch (err) { next(err); }
};

// ============================================================
// 6. ADMIN: Xóa review
// ============================================================
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (review) {
      // Review bị xóa thì phải tính lại điểm trung bình
      await calcAverageRating(review.product);
      res.json({ message: "Đã xóa đánh giá vĩnh viễn" });
    } else {
      res.status(404).json({ message: "Không tìm thấy review để xóa" });
    }
  } catch (err) { next(err); }
};