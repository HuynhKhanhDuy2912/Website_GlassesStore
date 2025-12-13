const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Helper tính tiền an toàn
const syncCartTotals = async (cartId) => {
    const items = await CartItem.find({ cart_id: cartId });
    
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalAmount = items.reduce((sum, item) => {
        // Phòng hờ item.total_price bị null
        const price = item.total_price || ((item.quantity || 0) * (item.price_at_time || 0));
        return sum + price;
    }, 0);

    await Cart.findByIdAndUpdate(cartId, {
        total_items: totalItems,
        total_amount: totalAmount
    });
};

const cartItemController = {
    // 1. Thêm vào giỏ
    addItem: async (req, res) => {
        try {
            const { product_id, quantity } = req.body;
            const userId = req.user._id;

            // Log để debug
            console.log("Adding item:", { product_id, quantity, userId });

            // Validate
            if (!quantity || Number(quantity) <= 0) {
                return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
            }

            // A. Tìm/Tạo Cart
            let cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                cart = await Cart.create({ user_id: userId });
            }

            // B. Check Product
            const product = await Product.findById(product_id);
            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            
            // Check kho & status
            if (product.quantity < quantity) return res.status(400).json({ message: 'Kho không đủ hàng' });
            // Logic check status (dùng status hoặc isActive tùy model của bạn)
            if (product.status === 'out_of_stock' || (product.isActive === false)) {
                 return res.status(400).json({ message: 'Sản phẩm ngừng kinh doanh' });
            }

            // C. Tìm Item trong giỏ
            let cartItem = await CartItem.findOne({ cart_id: cart._id, product_id: product_id });

            if (cartItem) {
                // UPDATE: Cộng dồn
                cartItem.quantity += Number(quantity);
                cartItem.price_at_time = product.price; 
                // Tự tính tiền
                cartItem.total_price = cartItem.quantity * product.price;
            } else {
                // CREATE: Mới
                cartItem = new CartItem({
                    cart_id: cart._id,
                    product_id: product._id,
                    quantity: quantity,
                    price_at_time: product.price,
                    // Tự tính tiền
                    total_price: Number(quantity) * product.price
                });
            }

            await cartItem.save();
            
            // D. Đồng bộ Cart cha
            await syncCartTotals(cart._id);

            // E. Populate trả về
            await cartItem.populate('product_id', 'product_name image_url slug price');

            res.status(200).json({ success: true, message: 'Đã thêm vào giỏ', data: cartItem });

        } catch (error) {
            console.error("Lỗi addItem:", error); // Quan trọng: Log lỗi ra terminal
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Cập nhật số lượng
    updateItem: async (req, res) => {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            const cartItem = await CartItem.findById(id);
            if (!cartItem) return res.status(404).json({ message: 'Item không tồn tại' });

            // Check quyền
            const cart = await Cart.findById(cartItem.cart_id);
            if (!cart || cart.user_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Không có quyền' });
            }

            if (Number(quantity) <= 0) {
                await CartItem.findByIdAndDelete(id);
            } else {
                cartItem.quantity = Number(quantity);
                // Tự tính lại tiền khi update số lượng
                cartItem.total_price = cartItem.quantity * cartItem.price_at_time;
                await cartItem.save();
            }

            await syncCartTotals(cartItem.cart_id);
            
            const updatedCart = await Cart.findById(cart._id);
            res.status(200).json({ success: true, message: 'Đã cập nhật', cart_summary: updatedCart });

        } catch (error) {
            console.error("Lỗi updateItem:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Xóa item
    deleteItem: async (req, res) => {
        try {
            const { id } = req.params;
            const cartItem = await CartItem.findById(id);
            if (!cartItem) return res.status(404).json({ message: 'Item không tồn tại' });

            const cart = await Cart.findById(cartItem.cart_id);
            if (!cart || cart.user_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Không có quyền' });
            }

            await CartItem.findByIdAndDelete(id);
            await syncCartTotals(cartItem.cart_id);

            const updatedCart = await Cart.findById(cart._id);
            res.status(200).json({ success: true, message: 'Đã xóa', cart_summary: updatedCart });

        } catch (error) {
            console.error("Lỗi deleteItem:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 4. Lấy danh sách
    getMyCartItems: async (req, res) => {
        try {
            const cart = await Cart.findOne({ user_id: req.user._id });
            if (!cart) {
                return res.status(200).json({ success: true, data: [], cart_summary: { total_items: 0, total_amount: 0 } });
            }

            const items = await CartItem.find({ cart_id: cart._id })
                .populate('product_id', 'product_name image_url slug price')
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, data: items, cart_summary: cart });
        } catch (error) {
            console.error("Lỗi getMyCartItems:", error);
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = cartItemController;