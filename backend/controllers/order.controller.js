import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
} from "../utils/email.service.js";

// Import thêm thư viện xử lý VNPay
import moment from "moment";
import qs from "qs";
import crypto from "crypto";

// --- HÀM BỔ TRỢ (Helper) ---
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    // Lấy tất cả các key của object và đưa vào mảng str
    for (key in obj) {
        // Thay đổi dòng check hasOwnProperty cũ bằng cách gọi từ Prototype
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// --- 1. TẠO ĐƠN HÀNG (Đã tích hợp VNPay) ---
export const addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    const FIXED_SHIPPING_FEE = 25000;

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Không có sản phẩm nào trong đơn hàng" });
    }

    const finalOrderItems = [];
    let calculatedItemsPrice = 0;
    const now = Date.now();

    for (const item of orderItems) {
      const product = await Product.findById(item.product || item._id);
      if (!product)
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      if (product.stock < item.qty)
        return res
          .status(400)
          .json({ message: `Sản phẩm ${product.name} hết hàng` });

      let realPrice = product.price;
      const isFlashSaleOn = product.isFlashSale === true;
      const tStart = product.flashSaleStartDate
        ? new Date(product.flashSaleStartDate).getTime()
        : 0;
      const tEnd = product.flashSaleEndTime
        ? new Date(product.flashSaleEndTime).getTime()
        : 0;
      const isTimeValid = now >= tStart && now <= tEnd;

      if (isFlashSaleOn && isTimeValid && product.flashSalePrice > 0) {
        realPrice = product.flashSalePrice;
        product.soldCount = (product.soldCount || 0) + item.qty;
      } else if (product.salePrice > 0 && product.salePrice < product.price) {
        realPrice = product.salePrice;
      }

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
        attrs: item.attrs || {},
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
      isPaid: "pending",
      status: "pending",
    });

    const createdOrder = await order.save();

    // Xóa giỏ hàng
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      const purchasedIds = finalOrderItems.map((item) =>
        item.product.toString(),
      );
      cart.items = cart.items.filter(
        (item) => !purchasedIds.includes(item.product.toString()),
      );
      await cart.save();
    }

    // --- XỬ LÝ THANH TOÁN VNPAY ---
    if (paymentMethod === "VNPay") {
      const vnpUrl = createVNPayUrl(req, createdOrder);
      return res.status(201).json({
        message: "Đơn hàng đã tạo, đang chuyển hướng thanh toán",
        paymentUrl: vnpUrl,
        orderId: createdOrder._id,
      });
    }

    res.status(201).json(createdOrder);
  } catch (err) {
    next(err);
  }
};

// --- HÀM TẠO URL VNPAY ---
const createVNPayUrl = (req, order) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";
  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let tmnCode = "4CXUYYFD"; // Thay bằng code thật
  let secretKey = "AGLCBHO0GMBQ7IJ686NQ6OUF0NTSS9SA"; // Thay bằng key thật
  let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  let returnUrl = `http://localhost:5000/api/orders/vnpay_return`; // URL web của bạn

  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = "VND";
  vnp_Params["vnp_TxnRef"] = order._id.toString(); // Dùng ID đơn hàng làm mã GD
  vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang:" + order._id;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = order.totalPrice * 100; // VNPay tính theo đơn vị đồng * 100
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  vnp_Params["vnp_CreateDate"] = createDate;

  vnp_Params = sortObject(vnp_Params);

  let signData = qs.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;
  return vnpUrl + "?" + qs.stringify(vnp_Params, { encode: false });
};


// --- XỬ LÝ PHẢN HỒI TỪ VNPAY (IPN) ---
export const vnpayIPN = async (req, res, next) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = "AGLCBHO0GMBQ7IJ686NQ6OUF0NTSS9SA";
    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      let orderId = vnp_Params["vnp_TxnRef"];
      let responseCode = vnp_Params["vnp_ResponseCode"];

      const order = await Order.findById(orderId);
      if (order) {
        if (responseCode === "00") {
          // 1. THANH TOÁN THÀNH CÔNG
          order.isPaid = "completed"; 
          order.status = "pending"; // Đơn hàng chuyển sang trạng thái đã xác nhận
          order.paidAt = Date.now();
        } else {
          // 2. THANH TOÁN THẤT BẠI
          order.isPaid = "failed";
          order.status = "cancelled"; // Tự động hủy đơn nếu thanh toán lỗi
        }
        await order.save();
        res.status(200).json({ RspCode: "00", Message: "Success" });
      } else {
        res.status(404).json({ RspCode: "01", Message: "Order not found" });
      }
    } else {
      res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
    }
  } catch (err) { next(err); }
};

// --- 2. LẤY DANH SÁCH ĐƠN HÀNG ---
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
  } catch (err) {
    next(err);
  }
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
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
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
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          name: "$productInfo.name",
          price: "$productInfo.price",
          image: { $arrayElemAt: ["$productInfo.images.url", 0] },
        },
      },
    ]);

    // 4. Doanh thu 7 ngày gần nhất cho biểu đồ
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailyRevenue = await Order.aggregate([
      { $match: { status: "completed", updatedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      counts: {
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
        revenue: totalRevenue,
      },
      recentOrders: recentOrders || [],
      topProducts: topProducts || [],
      chartData: dailyRevenue || [],
    });
  } catch (err) {
    next(err);
  }
};

// --- 4. CẬP NHẬT TRẠNG THÁI (Admin) ---
export const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, isPaid } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) return res.status(404).json({ message: "Không tìm thấy" });

        if (status) order.status = status;
        if (isPaid) {
            order.isPaid = isPaid;
            if (isPaid === "completed") order.paidAt = Date.now();
        }

        await order.save();
        res.json(order);
    } catch (err) { next(err); }
};

// --- 5. ADMIN XÁC NHẬN ĐƠN ---
export const confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) return res.status(404).json({ message: "Không tìm thấy" });

    order.status = "confirmed";
    const updatedOrder = await order.save();

    // Gửi email chi tiết xác nhận
    sendOrderConfirmationEmail({
      ...updatedOrder._doc,
      orderItems: updatedOrder.items,
    }).catch(console.error);

    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
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
  } catch (err) {
    next(err);
  }
};

// --- 7. LẤY CHI TIẾT 1 ĐƠN HÀNG ---
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product");
    if (!order) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// --- 8. XÓA ĐƠN HÀNG (Admin) ---
export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json({ message: "Đã xóa đơn hàng thành công" });
  } catch (err) {
    next(err);
  }
};
export const vnpayReturn = async (req, res, next) => {
  try {
    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    // Sửa lỗi hasOwnProperty bằng cách dùng Prototype
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
    vnp_Params = sortObject(vnp_Params);

    const secretKey = "AGLCBHO0GMBQ7IJ686NQ6OUF0NTSS9SA";
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const orderId = vnp_Params["vnp_TxnRef"];

      if (responseCode === "00") {
        // --- THÀNH CÔNG: Cập nhật trạng thái ---
        await Order.findByIdAndUpdate(orderId, {
          isPaid: "completed", // Theo Schema mới
          status: "pending",
          paidAt: Date.now(),
        });
        res.redirect(`https://website-glassesstore.pages.dev/order/success?vnp_ResponseCode=00&vnp_TxnRef=${orderId}`);
      } else {
        // --- THẤT BẠI: HOÀN TÁC (ROLLBACK) ---
        const order = await Order.findById(orderId);
        if (order) {
          // 1. Cộng trả lại số lượng vào kho (Product stock)
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.qty }
            });
          }
          // 2. Xoá đơn hàng khỏi Database
          await Order.findByIdAndDelete(orderId);
        }
        // 3. Đẩy khách quay lại trang thanh toán kèm mã báo lỗi
        res.redirect(`https://website-glassesstore.pages.dev/checkout?payment_error=true`);
      }
    } else {
      res.redirect(`https://website-glassesstore.pages.dev/order/success?vnp_ResponseCode=97`);
    }
  } catch (err) {
    next(err);
  }
};