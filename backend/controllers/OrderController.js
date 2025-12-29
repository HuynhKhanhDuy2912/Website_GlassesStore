const Order = require('../models/Order');
const OrderItem = require('../models/OrderDetail');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

const orderController = {
    // 1. Tạo đơn hàng mới (Checkout)
    // 1. Tạo đơn hàng mới (Checkout)
// 1. Tạo đơn hàng mới
createOrder: async (req, res) => {
    try {
        // Lấy cả 'items' (từ giỏ) và 'direct_items' (mua ngay)
        const { shipping_address_id, shipping_fee = 30000, discount_amount = 0, items, direct_items } = req.body;
        const userId = req.user._id;

        console.log("📦 Body nhận được:", req.body); // <-- Debug xem frontend gửi gì lên

        let orderItemsData = [];
        let subtotal = 0;

        // --- TRƯỜNG HỢP 1: Mua từ GIỎ HÀNG (Logic cũ) ---
        if (items && items.length > 0) {
            const cartItems = await CartItem.find({ 
                _id: { $in: items }, 
                user_id: userId 
            }).populate('product_id');

            for (const item of cartItems) {
                if (!item.product_id) continue;
                const price = item.product_id.price;
                subtotal += price * item.quantity;
                orderItemsData.push({
                    product_id: item.product_id._id,
                    quantity: item.quantity,
                    unit_price: price
                });
            }
        } 
        
        // --- TRƯỜNG HỢP 2: Mua NGAY (Logic MỚI - Bạn đang thiếu cái này) ---
        else if (direct_items && direct_items.length > 0) {
            for (const item of direct_items) {
                // Phải query lại Product để lấy giá chính xác từ DB
                const product = await Product.findById(item.product_id);
                if (!product) continue;

                const price = product.price;
                const qty = Number(item.quantity);
                
                subtotal += price * qty; // Cộng dồn tiền
                
                // Đẩy vào mảng để tí nữa lưu vào DB
                orderItemsData.push({
                    product_id: product._id,
                    quantity: qty,
                    unit_price: price
                });
            }
        } 
        // Nếu không có cả 2 -> Báo lỗi
        else {
            return res.status(400).json({ message: 'Không có sản phẩm nào để đặt hàng' });
        }

        // Tính tổng tiền cuối cùng
        const total_amount = subtotal + Number(shipping_fee) - Number(discount_amount);

        // A. Tạo Order (Bảng cha)
        const newOrder = new Order({
            user_id: userId,
            shipping_address_id,
            subtotal, // <-- Cái này giờ mới có giá trị
            shipping_fee,
            discount_amount,
            total_amount,
            order_status: 'pending'
        });
        await newOrder.save();

        // B. Tạo OrderItems (Bảng con - Lưu chi tiết sản phẩm)
        if (orderItemsData.length > 0) {
            const itemsToSave = orderItemsData.map(item => ({
                ...item,
                order_id: newOrder._id
            }));
            await OrderItem.insertMany(itemsToSave);
        }

        // C. Nếu mua từ giỏ thì mới xóa giỏ
        if (items && items.length > 0) {
            await CartItem.deleteMany({ _id: { $in: items } });
            // Cập nhật lại số lượng giỏ hàng (nếu cần thiết)
            const cart = await Cart.findOne({ user_id: userId });
            if(cart) {
                const remaining = await CartItem.countDocuments({ cart_id: cart._id });
                cart.total_items = remaining;
                await cart.save();
            }
        }

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công!',
            order_id: newOrder._id
        });

    } catch (error) {
        console.error("❌ Lỗi createOrder:", error);
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