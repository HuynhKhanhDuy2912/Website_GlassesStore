const Order = require('../models/Order');
const OrderItem = require('../models/OrderDetail');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

const orderController = {
    // 1. Tạo đơn hàng mới (Checkout)
    createOrder: async (req, res) => {
        try {
            const { shipping_address_id, shipping_fee = 30000, discount_amount = 0 } = req.body;
            const userId = req.user._id;

            // A. Lấy giỏ hàng của user
            const cart = await Cart.findOne({ user_id: userId });
            if (!cart) return res.status(400).json({ message: 'Giỏ hàng trống' });

            // B. Lấy các item trong giỏ hàng (Kèm thông tin Product để lấy giá hiện tại)
            const cartItems = await CartItem.find({ cart_id: cart._id }).populate('product_id');
            if (cartItems.length === 0) {
                return res.status(400).json({ message: 'Giỏ hàng không có sản phẩm nào' });
            }

            // C. Tính toán tổng tiền (Backend phải tự tính, không tin tưởng số từ Frontend gửi lên)
            let subtotal = 0;
            const orderItemsData = []; // Mảng tạm để lưu dữ liệu tạo OrderItem sau này

            for (const item of cartItems) {
                if (!item.product_id) continue; // Bỏ qua nếu sản phẩm bị xóa
                
                const price = item.product_id.price;
                const quantity = item.quantity;
                
                subtotal += price * quantity;

                // Chuẩn bị dữ liệu để lưu vào OrderItem
                orderItemsData.push({
                    product_id: item.product_id._id,
                    quantity: quantity,
                    price: price // Snapshot giá ngay lúc này
                });
            }

            const total_amount = subtotal + shipping_fee - discount_amount;

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
            // Gán order_id vừa tạo vào các item
            const itemsToSave = orderItemsData.map(item => ({
                ...item,
                order_id: newOrder._id
            }));
            await OrderItem.insertMany(itemsToSave);

            // F. Xóa sạch giỏ hàng (Sau khi đã tạo đơn thành công)
            await CartItem.deleteMany({ cart_id: cart._id });
            await Cart.findByIdAndUpdate(cart._id, { total_items: 0, total_amount: 0 });

            res.status(201).json({ 
                success: true, 
                message: 'Đặt hàng thành công!', 
                order_id: newOrder._id 
            });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Lấy danh sách đơn hàng của tôi (Customer xem lịch sử)
    getMyOrders: async (req, res) => {
        try {
            const orders = await Order.find({ user_id: req.user._id })
                .sort({ createdAt: -1 })
                .populate('shipping_address_id'); // Lấy chi tiết địa chỉ
            
            res.status(200).json({ success: true, data: orders });
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