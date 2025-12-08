const Cart = require('../models/Cart');
const Product = require('../models/Product');

const cartController = {
  // 1. Lấy giỏ hàng (Tính toán lại giá mới nhất)
  getCart: async (req, res) => {
    try {
      let cart = await Cart.findOne({ user_id: req.user._id });

      if (!cart) {
        cart = new Cart({ user_id: req.user._id, items: [] });
        await cart.save();
        return res.status(200).json({ success: true, data: cart });
      }

      // --- BƯỚC QUAN TRỌNG: Populate để lấy giá hiện tại ---
      // Lấy thông tin product (name, price, image, etc.)
      await cart.populate('items.product_id', 'name price image slug isActive');

      // Lọc bỏ các sản phẩm đã bị xóa hoặc ngừng kinh doanh (isActive = false)
      // Đây là bước xử lý logic thực tế rất cần thiết
      const validItems = cart.items.filter(item => item.product_id && item.product_id.isActive);
      
      // Nếu có sản phẩm bị xóa/ẩn, cập nhật lại mảng items
      if (validItems.length !== cart.items.length) {
          cart.items = validItems;
      }

      // --- TÍNH TOÁN LẠI TỔNG TIỀN THEO GIÁ MỚI ---
      let newTotalAmount = 0;
      let newTotalItems = 0;

      cart.items.forEach(item => {
        // item.product_id bây giờ là object chứa thông tin sản phẩm (do đã populate)
        newTotalAmount += item.product_id.price * item.quantity;
        newTotalItems += item.quantity;
      });

      // Cập nhật lại vào DB để đồng bộ
      cart.total_amount = newTotalAmount;
      cart.total_items = newTotalItems;
      
      // Lưu lại các thay đổi (xóa item lỗi, update giá mới)
      await cart.save();

      res.status(200).json({ success: true, data: cart });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // 2. Thêm vào giỏ (Sửa lại: Không lưu price)
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
          // KHÔNG lưu price ở đây nữa
        });
      }

      // Lưu tạm, việc tính toán tổng tiền chính xác sẽ do hàm getCart lo 
      // hoặc tính sơ bộ để update total_amount cho database
      // Nhưng để nhất quán, ta nên gọi hàm tính toán ở đây luôn:
      await updateCartTotals(cart); // Xem hàm helper ở dưới

      await cart.save();
      
      // Populate trả về cho đẹp
      await cart.populate('items.product_id', 'name price image slug');
      res.status(200).json({ success: true, message: 'Đã thêm vào giỏ', data: cart });

    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  },

  // ... (Các hàm updateItemQuantity, removeItem giữ nguyên logic, chỉ nhớ gọi updateCartTotals sau khi sửa)
  updateItemQuantity: async (req, res) => {
        // ... Logic tìm cart và itemIndex ...
        // Sau khi update quantity:
        // await updateCartTotals(cart);
        // await cart.save();
  },
   
  removeItem: async (req, res) => {
        // ... Logic xóa item ...
        // await updateCartTotals(cart);
        // await cart.save();
  }
};

// --- Helper mới: Phải query giá từ Product để tính ---
const updateCartTotals = async (cart) => {
    // Vì trong items chỉ có product_id (string/ObjectId) chưa có price,
    // ta cần populate hoặc loop qua để lấy giá.
    
    // Cách tối ưu: Populate tạm để tính toán
    if (!cart.populated('items.product_id')) {
        await cart.populate('items.product_id', 'price');
    }

    cart.total_items = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.total_amount = cart.items.reduce((total, item) => {
        // Cẩn thận trường hợp product bị null (đã bị xóa khỏi DB)
        const price = item.product_id ? item.product_id.price : 0;
        return total + (price * item.quantity);
    }, 0);
};

module.exports = cartController;