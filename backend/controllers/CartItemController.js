const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// --- Helper: Đồng bộ tổng tiền lên bảng Cart cha ---
const syncCartTotals = async (cartId) => {
    const items = await CartItem.find({ cart_id: cartId });
    
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);

    await Cart.findByIdAndUpdate(cartId, {
        total_items: totalItems,
        total_amount: totalAmount
    });
};

const cartItemController = {
    // 1. Thêm sản phẩm vào giỏ (Hoặc tạo mới, hoặc cộng dồn số lượng)
    addItem: async (req, res) => {
        const { product_id, quantity } = req.body;
        const userId = req.user._id;

        try {
            // A. Tìm hoặc tạo Cart cho user này trước
            let cart = await Cart.findOne({ user_id: userId });
            if (!cart) {
                cart = await Cart.create({ user_id: userId });
            }

            // B. Lấy giá sản phẩm hiện tại (Đảm bảo giá đúng từ DB)
            const product = await Product.findById(product_id);
            if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
            if (!product.isActive) return res.status(400).json({ message: 'Sản phẩm ngừng kinh doanh' });

            // C. Kiểm tra xem item này đã có trong giỏ chưa
            let cartItem = await CartItem.findOne({ cart_id: cart._id, product_id: product_id });

            if (cartItem) {
                // Nếu có rồi -> Cộng dồn số lượng
                cartItem.quantity += Number(quantity);
                cartItem.price_at_time = product.price; // Cập nhật lại giá mới nhất luôn
                // total_price sẽ tự tính nhờ pre('save') hook trong model
            } else {
                // Nếu chưa có -> Tạo mới
                cartItem = new CartItem({
                    cart_id: cart._id,
                    product_id: product._id,
                    quantity: quantity,
                    price_at_time: product.price
                });
            }

            await cartItem.save();

            // D. Đồng bộ lại tổng tiền cho Cart cha
            await syncCartTotals(cart._id);

            res.status(200).json({ success: true, message: 'Đã thêm vào giỏ', data: cartItem });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Cập nhật số lượng (Tăng/Giảm ở trang giỏ hàng)
    updateItem: async (req, res) => {
        const { id } = req.params; // ID của CartItem
        const { quantity } = req.body;

        try {
            const cartItem = await CartItem.findById(id);
            if (!cartItem) return res.status(404).json({ message: 'Không tìm thấy item' });

            // Kiểm tra quyền (CartItem này có thuộc về User đang login không?)
            // Bước này hơi phức tạp vì CartItem chỉ link tới Cart, không link trực tiếp User
            // Nên ta phải check thông qua Cart
            const cart = await Cart.findById(cartItem.cart_id);
            if (!cart || cart.user_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Không có quyền sửa giỏ hàng này' });
            }

            if (quantity <= 0) {
                // Nếu số lượng <= 0 thì xóa luôn
                await CartItem.findByIdAndDelete(id);
            } else {
                // Cập nhật số lượng
                cartItem.quantity = quantity;
                
                // (Tùy chọn) Có muốn cập nhật lại giá theo thời điểm hiện tại không?
                // Nếu muốn giữ giá lúc thêm vào giỏ thì bỏ qua dòng dưới.
                // Nếu muốn refresh giá:
                // const product = await Product.findById(cartItem.product_id);
                // cartItem.price_at_time = product.price;

                await cartItem.save(); // pre('save') sẽ tính lại total_price
            }

            // Đồng bộ lại Cart cha
            await syncCartTotals(cartItem.cart_id);

            res.status(200).json({ success: true, message: 'Đã cập nhật số lượng' });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Xóa 1 item
    deleteItem: async (req, res) => {
        const { id } = req.params; // ID của CartItem

        try {
            const cartItem = await CartItem.findById(id);
            if (!cartItem) return res.status(404).json({ message: 'Item không tồn tại' });

            // Check quyền sở hữu (Giống hàm update)
            const cart = await Cart.findById(cartItem.cart_id);
            if (!cart || cart.user_id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Không có quyền' });
            }

            await CartItem.findByIdAndDelete(id);

            // Đồng bộ lại Cart cha
            await syncCartTotals(cartItem.cart_id);

            res.status(200).json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ' });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 4. Lấy danh sách item trong giỏ (Dùng để hiển thị trang Cart)
    getMyCartItems: async (req, res) => {
        try {
            const cart = await Cart.findOne({ user_id: req.user._id });
            if (!cart) {
                return res.status(200).json({ success: true, data: [] });
            }

            // Populate để lấy thông tin chi tiết sản phẩm (tên, ảnh)
            const items = await CartItem.find({ cart_id: cart._id })
                                        .populate('product_id', 'name image slug');

            res.status(200).json({ success: true, data: items, cart_summary: cart });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = cartItemController;