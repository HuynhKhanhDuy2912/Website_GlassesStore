const Order = require('../models/Order');
const OrderItem = require('../models/OrderDetail');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

const orderController = {
    // 1. Tạo đơn hàng mới (Checkout)
    // 1. Tạo đơn hàng mới (Checkout)
    createOrder: async (req, res) => {
        try {
            const { shipping_address_id, shipping_fee = 30000, discount_amount = 0 } = req.body;
            const userId = req.user._id;

            // Log để debug xem Frontend gửi gì lên
            console.log("📦 Dữ liệu đặt hàng:", req.body);

            // Kiểm tra ID địa chỉ có hợp lệ không
            if (!shipping_address_id || shipping_address_id.length < 24) {
                return res.status(400).json({ message: 'Địa chỉ giao hàng không hợp lệ' });
            }

            // A. Lấy giỏ hàng của user
            const cart = await Cart.findOne({ user_id: userId });
            if (!cart) return res.status(400).json({ message: 'Giỏ hàng trống' });

            // B. Lấy các item trong giỏ hàng
            const cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');
            if (cartItems.length === 0) {
                return res.status(400).json({ message: 'Giỏ hàng không có sản phẩm nào' });
            }

            // C. Tính toán tổng tiền
            let subtotal = 0;
            const orderItemsData = [];

            for (const item of cartItems) {
                // Bỏ qua nếu sản phẩm bị xóa hoặc null
                if (!item.product_id) continue;

                const price = item.product_id.price;
                const quantity = item.quantity;

                subtotal += price * quantity;

                // --- SỬA LỖI TẠI ĐÂY ---
                // Model OrderDetail yêu cầu 'unit_price', không phải 'price'
                orderItemsData.push({
                    product_id: item.product_id._id,
                    quantity: quantity,
                    unit_price: price // <--- Đã sửa thành unit_price cho khớp Model
                });
            }

            const total_amount = subtotal + Number(shipping_fee) - Number(discount_amount);

            // D. Tạo Order (Bảng cha)
            const newOrder = new Order({
                user_id: userId,
                shipping_address_id,
                subtotal,
                shipping_fee,
                discount_amount,
                total_amount,
                order_status: 'pending'
            });
            await newOrder.save();

            // E. Tạo các OrderItem (Bảng con)
            const itemsToSave = orderItemsData.map(item => ({
                ...item,
                order_id: newOrder._id
            }));
            await OrderItem.insertMany(itemsToSave);

            // F. Xóa sạch giỏ hàng
            await CartItem.deleteMany({ cart_id: cart._id });
            await Cart.findByIdAndUpdate(cart._id, { total_items: 0, total_amount: 0 });

            res.status(201).json({
                success: true,
                message: 'Đặt hàng thành công!',
                order_id: newOrder._id
            });

        } catch (error) {
            console.error("❌ Lỗi createOrder:", error); // Log lỗi ra terminal để dễ sửa
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Lấy danh sách đơn hàng của tôi (Customer xem lịch sử)
    getMyOrders: async (req, res) => {
        try {
            // Bước 1: Lấy danh sách Order
            const orders = await Order.find({ user_id: req.user._id })
                .sort({ createdAt: -1 });

            // Bước 2: Với mỗi order, lấy danh sách item của nó (Manual Populate)
            // Cách này hơi chậm nếu nhiều đơn, nhưng dễ hiểu. 
            // Cách tối ưu hơn là dùng Aggregate $lookup
            const ordersWithItems = await Promise.all(orders.map(async (order) => {
                const items = await OrderItem.find({ order_id: order._id })
                    .populate('product_id', 'product_name');

                // Trả về order dạng object thuần + thêm trường items
                return {
                    ...order.toObject(),
                    items: items // Frontend sẽ dùng cái này để hiện tên
                };
            }));

            res.status(200).json({ success: true, data: ordersWithItems });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    cancelOrderUser: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user._id;

            const order = await Order.findOne({ _id: id, user_id: userId });

            if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });

            // Chỉ cho hủy khi đang 'pending'
            if (order.order_status !== 'pending') {
                return res.status(400).json({ message: 'Không thể hủy đơn hàng đã được xử lý' });
            }

            order.order_status = 'cancelled';
            await order.save();

            res.status(200).json({ success: true, message: 'Đã hủy đơn hàng' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Xem chi tiết 1 đơn hàng (Kèm các sản phẩm bên trong)
    getOrderById: async (req, res) => {
        try {
            const orderId = req.params.id;

            // Tìm đơn hàng
            const order = await Order.findById(orderId).populate('shipping_address_id');
            if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

            // Check quyền: Chỉ chủ đơn hàng hoặc Admin mới được xem
            if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Bạn không có quyền xem đơn này' });
            }

            // Lấy danh sách sản phẩm trong đơn này
            const items = await OrderItem.find({ order_id: orderId }).populate('product_id', 'name image');

            res.status(200).json({ success: true, data: { order, items } });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 4. Admin: Lấy tất cả đơn hàng
    getAllOrders: async (req, res) => {
        try {
            // Có thể lọc theo status: ?status=pending
            const filter = {};
            if (req.query.status) {
                filter.order_status = req.query.status;
            }

            const orders = await Order.find(filter)
                .populate('user_id', 'fullname email') // Biết ai mua
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, count: orders.length, data: orders });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 5. Admin: Cập nhật trạng thái đơn hàng (Duyệt đơn, Giao hàng)
    updateOrderStatus: async (req, res) => {
        try {
            const { status } = req.body; // pending, processing, completed, cancelled
            const orderId = req.params.id;

            const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }

            const order = await Order.findByIdAndUpdate(
                orderId,
                { order_status: status },
                { new: true }
            );

            if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

            res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công', data: order });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = orderController;