import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// --- HELPER: Xử lý logic Flash Sale ---
const processCartProduct = (product) => {
  if (!product) return null;

  // Chuyển Mongoose Document sang Object để chỉnh sửa
  const p = product.toObject ? product.toObject() : product;

  const now = Date.now();
  const start = p.flashSaleStartDate
    ? new Date(p.flashSaleStartDate).getTime()
    : 0;
  const end = p.flashSaleEndTime ? new Date(p.flashSaleEndTime).getTime() : 0;

  // Nếu đang bật FlashSale NHƯNG hết giờ (hoặc chưa đến giờ)
  if (p.isFlashSale && (now < start || now > end)) {
    p.isFlashSale = false; // Tắt sale ảo
  }
  return p;
};

// --- 1. LẤY GIỎ HÀNG ---
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      return res.json({ items: [] });
    }

    const cartObj = cart.toObject();

    cartObj.items = cartObj.items.map((item) => {
      if (item.product) {
        item.product = processCartProduct(item.product);
      }
      return item;
    });

    res.json(cartObj);
  } catch (err) {
    next(err);
  }
};

// --- 2. THÊM VÀO GIỎ HÀNG ---
export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty, attrs } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Kiểm tra sản phẩm có tồn tại không (để tránh lỗi rác)
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });

    const itemIndex = cart.items.findIndex(
      (p) => p.product.toString() === productId,
    );

    if (itemIndex > -1) {
      // Nếu đã có -> Cộng dồn số lượng
      cart.items[itemIndex].qty += qty;
    } else {
      // Nếu chưa có -> Thêm mới
      cart.items.push({ product: productId, qty, attrs });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
    );

    const cartObj = populatedCart.toObject();
    cartObj.items = cartObj.items.map((item) => {
      if (item.product) item.product = processCartProduct(item.product);
      return item;
    });

    res.json(cartObj);
  } catch (err) {
    next(err);
  }
};

// --- 3. CẬP NHẬT SỐ LƯỢNG ---
export const updateCartItem = async (req, res, next) => {
  try {
    const { itemIndex, qty } = req.body;
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

    if (cart.items[itemIndex]) {
      cart.items[itemIndex].qty = qty;
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
    );
    const cartObj = populatedCart.toObject();
    cartObj.items = cartObj.items.map((item) => {
      if (item.product) item.product = processCartProduct(item.product);
      return item;
    });

    res.json(cartObj);
  } catch (err) {
    next(err);
  }
};

// --- 4. XÓA SẢN PHẨM KHỎI GIỎ HÀNG---
export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    const before = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === before) {
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ" });
    }

    await cart.save();

    // 🔥 BẮT BUỘC populate lại
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    // 🔥 TÍNH subtotal TỪ product.price
    populatedCart.subTotal = populatedCart.items.reduce((sum, item) => {
      const price = Number(item.product?.price || 0);
      const qty = Number(item.qty || 0);
      return sum + price * qty;
    }, 0);

    populatedCart.total =
      populatedCart.subTotal + populatedCart.shipping;

    await populatedCart.save();

    // 🔥 Process flash sale
    const cartObj = populatedCart.toObject();
    cartObj.items = cartObj.items.map((item) => {
      if (item.product) {
        item.product = processCartProduct(item.product);
      }
      return item;
    });

    res.json(cartObj);
  } catch (err) {
    next(err);
  }
};

