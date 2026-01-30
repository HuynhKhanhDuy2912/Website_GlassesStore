import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../utils/email.service.js';

// --- 1. TẠO ĐƠN HÀNG (User đặt hàng) ---
export const addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    const FIXED_SHIPPING_FEE = 25000; //  Cố định phí ship 25k

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm nào trong đơn hàng" });
    }

    const finalOrderItems = [];
    let calculatedItemsPrice = 0;
    const now = Date.now(); 

    for (const item of orderItems) {
      const product = await Product.findById(item.product || item._id);
      if (!product) return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      if (product.stock < item.qty) return res.status(400).json({ message: `Sản phẩm ${product.name} hết hàng` });

      // Tính giá: Ưu tiên Flash Sale > Sale thường > Giá gốc
      let realPrice = product.price; 
      const isFlashSaleOn = product.isFlashSale === true;
      const tStart = product.flashSaleStartDate ? new Date(product.flashSaleStartDate).getTime() : 0;
      const tEnd = product.flashSaleEndTime ? new Date(product.flashSaleEndTime).getTime() : 0;
      const isTimeValid = (now >= tStart) && (now <= tEnd);

      if (isFlashSaleOn && isTimeValid && product.flashSalePrice > 0) {
        realPrice = product.flashSalePrice;
        product.soldCount = (product.soldCount || 0) + item.qty;
      } else if (product.salePrice > 0 && product.salePrice < product.price) {
        realPrice = product.salePrice;
      }

      //  Lưu Snapshot ảnh vào đơn hàng để không bị mất khi Product thay đổi
      let savedImage = "";
      if (product.images && product.images.length > 0) {
          savedImage = product.images[0].url || product.images[0];
      }

      finalOrderItems.push({
        product: product._id,
        name: product.name,
        qty: item.qty,
        image: item.image || savedImage,
        price: realPrice,
        attrs: item.attrs || {}
      });

      calculatedItemsPrice += realPrice * item.qty;
      product.stock -= item.qty;
      await product.save();
    }

    const order = new Order({
      user: req.user._id,
      items: finalOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: calculatedItemsPrice,
      shippingPrice: FIXED_SHIPPING_FEE,
      totalPrice: calculatedItemsPrice + FIXED_SHIPPING_FEE,
      status: "pending",
    });

    const createdOrder = await order.save();
    
    // Xóa giỏ hàng sau khi đặt thành công
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
        const purchasedIds = finalOrderItems.map(item => item.product.toString());
        cart.items = cart.items.filter(item => !purchasedIds.includes(item.product.toString()));
        await cart.save();
    }
    
    res.status(201).json(createdOrder);
  } catch (err) { next(err); }
};

// --- 2. LẤY DANH SÁCH ĐƠN HÀNG (Admin/User) ---
export const listOrders = async (req, res, next) => {
  try {
    const filter = {};
    //  Kiểm tra role: Nếu không phải admin thì chỉ lấy đơn của User đó
    if (req.user.role !== "admin") {
      filter.user = req.user._id;
    }
    
    const orders = await Order.find(filter)
      .populate("user", "name email") // Lấy thông tin khách hàng cho Admin xem
      .sort("-createdAt");
    res.json(orders);
  } catch (err) { next(err); }
};

// --- 3. THỐNG KÊ DASHBOARD ---
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Số lượng tổng quát
    const usersCount = await User.countDocuments({ role: "user" });
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    
    const revenueAgg = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // 2. Lấy 5 đơn hàng gần nhất 
    const recentOrders = await Order.find()
      .select("user totalPrice status createdAt shippingAddress")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Top 4 sản phẩm bán chạy nhất
    const topProducts = await Order.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", totalSold: { $sum: "$items.qty" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 4 },
      { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productInfo" } },
      { $unwind: "$productInfo" },
      { $project: { 
          _id: 1, 
          totalSold: 1, 
          name: "$productInfo.name", 
          price: "$productInfo.price", 
          image: { $arrayElemAt: ["$productInfo.images.url", 0] } 
      } },
    ]);

    // 4. Doanh thu 7 ngày gần nhất cho biểu đồ
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyRevenue = await Order.aggregate([
      { $match: { status: "completed", updatedAt: { $gte: sevenDaysAgo } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }, 
          revenue: { $sum: "$totalPrice" } 
      } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ 
      counts: { 
        users: usersCount, 
        products: productsCount, 
        orders: ordersCount, 
        revenue: totalRevenue 
      }, 
      recentOrders: recentOrders || [], 
      topProducts: topProducts || [], 
      chartData: dailyRevenue || [] 
    });
  } catch (err) { next(err); }
};

// --- 4. CẬP NHẬT TRẠNG THÁI (Admin) ---
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate("user", "email name");
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.status = status;
    if (status === "completed") {
      order.deliveredAt = Date.now(); // Lưu thời gian giao hàng
    }
    const updatedOrder = await order.save();

    // Gửi mail thông báo trạng thái mới
    if (["delivered", "completed", "cancelled"].includes(status)) {
        sendOrderStatusEmail(updatedOrder).catch(err => console.error("Lỗi gửi mail:", err));
    }

    res.json(updatedOrder);
  } catch (err) { next(err); }
};

// --- 5. ADMIN XÁC NHẬN ĐƠN ---
export const confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Không tìm thấy" });
    
    order.status = "confirmed"; 
    const updatedOrder = await order.save();

    // Gửi email chi tiết xác nhận
    sendOrderConfirmationEmail({ ...updatedOrder._doc, orderItems: updatedOrder.items }).catch(console.error);

    res.json(updatedOrder);
  } catch (err) { next(err); }
};

// --- 6. HỦY ĐƠN HÀNG ---
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy" });
    
    order.status = "cancelled";
    order.cancelledAt = Date.now();
    const updatedOrder = await order.save();
    
    res.json({ message: "Hủy thành công", order: updatedOrder });
  } catch (err) { next(err); }
};

// --- 7. LẤY CHI TIẾT 1 ĐƠN HÀNG ---
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email").populate("items.product");
    if (!order) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(order);
  } catch (err) { next(err); }
};

// --- 8. XÓA ĐƠN HÀNG (Admin) ---
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json({ message: "Đã xóa đơn hàng thành công" });
  } catch (err) { next(err); }
};