const OrderDetail = require('../models/OrderDetail');
const Order = require('../models/Order');
const Product = require('../models/Product');

const orderDetailController = {
    
    // 1. Xem danh sách sản phẩm của một đơn hàng cụ thể
    // Dùng khi khách nhấn vào "Xem chi tiết đơn hàng"
    getDetailsByOrder: async (req, res) => {
        try {
            const { orderId } = req.params;

            // Kiểm tra đơn hàng có tồn tại không
            const order = await Order.findById(orderId);
            if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });

            // Kiểm tra quyền: Chỉ chủ đơn hàng hoặc Admin mới được xem
            if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Bạn không có quyền xem đơn này' });
            }

            // Lấy list sản phẩm, populate để lấy tên và ảnh hiển thị
            const details = await OrderDetail.find({ order_id: orderId })
                .populate('product_id', 'name image slug');

            res.status(200).json({ success: true, count: details.length, data: details });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Thêm một món vào đơn hàng đã có (Thường dùng cho Admin xử lý sự cố)
    addDetail: async (req, res) => {
        try {
            const { order_id, product_id, quantity } = req.body;

            // Lấy giá sản phẩm hiện tại
            const product = await Product.findById(product_id);
            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

            // Kiểm tra đơn hàng
            const order = await Order.findById(order_id);
            if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });

            // Tạo OrderDetail mới
            const newDetail = new OrderDetail({
                order_id,
                product_id,
                quantity,
                unit_price: product.price // Snapshot giá
                // subtotal sẽ tự tính nhờ pre-save hook
            });

            await newDetail.save();

            // QUAN TRỌNG: Sau khi thêm món, cần cập nhật lại tổng tiền (total_amount) ở bảng Order cha
            // Bạn có thể viết logic cập nhật Order ở đây (cộng thêm subtotal vào Order.total_amount)

            res.status(201).json({ success: true, message: 'Đã thêm sản phẩm vào đơn', data: newDetail });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Xóa một món khỏi đơn hàng (Admin only)
    deleteDetail: async (req, res) => {
        try {
            const { id } = req.params; // ID của OrderDetail

            const detail = await OrderDetail.findByIdAndDelete(id);
            if (!detail) return res.status(404).json({ message: 'Không tìm thấy chi tiết đơn hàng' });

            // Tương tự: Cần trừ tiền bên bảng Order cha nếu làm logic chặt chẽ

            res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi đơn hàng' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = orderDetailController;