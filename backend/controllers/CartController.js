const Cart = require('../models/Cart');
const Product = require('../models/Product');

// --- Helper: Tính toán lại tổng tiền ---
const updateCartTotals = async (cart) => {
    // Populate tạm thời để lấy giá sản phẩm hiện tại từ bảng Product
    // (Nếu chưa populate thì mới populate, tránh làm nhiều lần)
    if (!cart.items[0] || !cart.items[0].product_id.price) {
        await cart.populate('items.product_id', 'price');
    }

    cart.total_items = cart.items.reduce((total, item) => total + item.quantity, 0);
    
    cart.total_amount = cart.items.reduce((total, item) => {
        // Nếu sản phẩm bị xóa khỏi DB (null) thì tính giá là 0
        const price = item.product_id ? item.product_id.price : 0;
        return total + (price * item.quantity);
    }, 0);
};

const cartController = {
  // 1. Lấy giỏ hàng
  getCart: async (req, res) => {
    try {
      let cart = await Cart.findOne({ user_id: req.user._id });

      if (!cart) {
        cart = new Cart({ user_id: req.user._id, items: [] });
        await cart.save();
        return res.status(200).json({ success: true, data: cart });
      }

      await cart.populate('items.product_id', 'name price image slug isActive');

      // Lọc bỏ sản phẩm rác (đã bị xóa hoặc ngưng hoạt động)
      const validItems = cart.items.filter(item => item.product_id && item.product_id.isActive);
      
      if (validItems.length !== cart.items.length) {
          cart.items = validItems;
      }

      // Tính toán lại tổng tiền dựa trên giá mới nhất
      let newTotalAmount = 0;
      let newTotalItems = 0;

      cart.items.forEach(item => {
        newTotalAmount += item.product_id.price * item.quantity;
        newTotalItems += item.quantity;
      });

      cart.total_amount = newTotalAmount;
      cart.total_items = newTotalItems;
      
      await cart.save();

      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 2. Thêm vào giỏ
  addToCart: async (req, res) => {
    const { product_id, quantity } = req.body;
    
    try {
      const product = await Product.findById(product_id);
      if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại.' });

      let cart = await Cart.findOne({ user_id: req.user._id });
      if (!cart) {
        cart = new Cart({ user_id: req.user._id, items: [] });
      }

      const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({
          product_id: product._id,
          quantity: quantity
        });
      }

      await updateCartTotals(cart);
      await cart.save();
      
      // Populate lại để trả về frontend hiển thị ngay
      await cart.populate('items.product_id', 'name price image slug');
      res.status(200).json({ success: true, message: 'Đã thêm vào giỏ', data: cart });

    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 3. Cập nhật số lượng
  updateItemQuantity: async (req, res) => {
      const { product_id, quantity } = req.body;
      try {
          const cart = await Cart.findOne({ user_id: req.user._id });
          if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống.' });

          const itemIndex = cart.items.findIndex(item => item.product_id.toString() === product_id);

          if (itemIndex > -1) {
              if (quantity > 0) {
                  cart.items[itemIndex].quantity = quantity;
              } else {
                  // Nếu quantity <= 0 thì xóa luôn item đó
                  cart.items.splice(itemIndex, 1);
              }
              
              await updateCartTotals(cart);
              await cart.save();
              
              await cart.populate('items.product_id', 'name price image slug');
              res.status(200).json({ success: true, message: 'Cập nhật thành công', data: cart });
          } else {
              res.status(404).json({ message: 'Sản phẩm không có trong giỏ.' });
          }
      } catch (error) {
          res.status(500).json({ message: 'Lỗi server', error: error.message });
      }
  },

  // 4. Xóa 1 sản phẩm (Fix lỗi của bạn ở đây)
  removeItem: async (req, res) => {
      const { product_id } = req.params; // Lấy từ URL params
      try {
          const cart = await Cart.findOne({ user_id: req.user._id });
          if (!cart) return res.status(404).json({ message: 'Giỏ hàng trống.' });

          // Lọc bỏ sản phẩm có id trùng với product_id gửi lên
          const newItems = cart.items.filter(item => item.product_id.toString() !== product_id);

          cart.items = newItems;

          await updateCartTotals(cart);
          await cart.save();

          await cart.populate('items.product_id', 'name price image slug');
          res.status(200).json({ success: true, message: 'Đã xóa sản phẩm', data: cart });
      } catch (error) {
          res.status(500).json({ message: 'Lỗi server', error: error.message });
      }
  },

  // 5. Xóa sạch giỏ hàng
  clearCart: async (req, res) => {
      try {
          const cart = await Cart.findOne({ user_id: req.user._id });
          if (cart) {
              cart.items = [];
              cart.total_items = 0;
              cart.total_amount = 0;
              await cart.save();
          }
          res.status(200).json({ success: true, message: 'Giỏ hàng đã được làm trống', data: cart });
      } catch (error) {
          res.status(500).json({ message: 'Lỗi server', error: error.message });
      }
  }
};

module.exports = cartController;