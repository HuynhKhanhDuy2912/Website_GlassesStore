import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail", // Hoặc service bạn đang dùng
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const createOrderTemplate = (order) => {
  const items = order.orderItems || order.items || [];
  const shippingAddress = order.shippingAddress || {};
  const userName = order.user?.name || order.name || "Quý khách";

  const totalPrice = order.totalPrice?.toLocaleString("vi-VN") || 0;
  const shippingPrice = order.shippingPrice?.toLocaleString("vi-VN") || 0;

  const itemsHtml = items
    .map((item) => {
      const price = item.price?.toLocaleString("vi-VN") || 0;
      const totalItem = (item.price * item.qty).toLocaleString("vi-VN");
      const image =
        item.image || "https://via.placeholder.com/60x60?text=GLASSES";

      return `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;width:70px">
            <img src="${image.startsWith("http") ? image : image}"
              alt="${item.name}"
              style="width:60px;height:60px;object-fit:cover;border-radius:6px"/>
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee">
            <strong style="color:#111">${item.name}</strong>
            <div style="font-size:12px;color:#666;margin-top:4px">
              ${item.qty} × ${price} đ
            </div>
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">
            ${totalItem} đ
          </td>
        </tr>
      `;
    })
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
    
    <!-- HEADER -->
    <div style="background:#111827;padding:24px;text-align:center;color:#fff">
      <h1 style="margin:0;font-size:22px;letter-spacing:1px">
        DHD GLASSES
      </h1>
      <p style="margin:6px 0 0;font-size:13px;color:#d1d5db">
        Xác nhận đơn hàng • Mã đơn #${order._id}
      </p>
    </div>

    <!-- BODY -->
    <div style="padding:24px">
      <p style="margin-top:0">Xin chào <strong>${userName}</strong>,</p>
      <p style="color:#374151;font-size:14px;line-height:1.6">
        Cảm ơn bạn đã lựa chọn <strong>DHD Glasses</strong>.
        Chúng tôi đã nhận được đơn đặt hàng của bạn và đang tiến hành xử lý.
      </p>

      <!-- ADDRESS -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
        <h3 style="margin:0 0 8px;font-size:14px;color:#111">
          📍 Thông tin giao hàng
        </h3>
        <p style="margin:0;font-size:13px;color:#374151">
          <strong>${shippingAddress.fullName || userName}</strong> • ${shippingAddress.phone || "---"}
        </p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280">
          ${shippingAddress.addressLine || shippingAddress.address || ""}, ${shippingAddress.city || ""}
        </p>
      </div>

      <!-- ITEMS -->
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f3f4f6;text-align:left">
            <th style="padding:10px" colspan="2">Sản phẩm</th>
            <th style="padding:10px;text-align:right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- TOTAL -->
      <div style="text-align:right;margin-top:16px">
        <p style="margin:4px 0;font-size:13px;color:#6b7280">
          Phí vận chuyển: ${shippingPrice} đ
        </p>
        <p style="margin:6px 0;font-size:18px;font-weight:700;color:#111827">
          Tổng cộng: ${totalPrice} đ
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:28px">
        <a href="http://localhost:5173/order/${order._id}"
          style="display:inline-block;background:#111827;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600">
          Xem chi tiết đơn hàng
        </a>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="background:#f3f4f6;padding:14px;text-align:center;font-size:12px;color:#6b7280">
      © 2026 DHD Glasses • Thời trang & Mắt kính chính hãng  
      <br/>Hotline: 090 123 4567
    </div>
  </div>
  `;
};

//  1. Hàm gửi mail xác nhận đơn hàng (Dùng cho order.controller.js)
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const userEmail = order.user?.email || order.email; // Lấy email an toàn
    if (!userEmail) return;

    const mailOptions = {
      from: `"DHD - GlassesShop" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `[DHD - GlassesShop] Xác nhận đơn hàng #${order._id}`,
      html: createOrderTemplate(order),
    };
    await transporter.sendMail(mailOptions);
    console.log(` Đã gửi mail xác nhận đơn #${order._id}`);
  } catch (error) {
    console.error(" Lỗi gửi mail order:", error);
  }
};

//  2. Hàm gửi mail cập nhật trạng thái (Dùng cho order.controller.js)
export const sendOrderStatusEmail = async (order) => {
  try {
    const userEmail = order.user?.email || order.email;
    if (!userEmail) return;

    let statusText = "";
    let color = "#333";

    switch (order.status) {
      case "confirmed":
        statusText = "Đã được xác nhận";
        color = "#2980b9";
        break;
      case "delivered":
        statusText = "Đang được giao đến bạn";
        color = "#e67e22";
        break;
      case "completed":
        statusText = "Giao thành công";
        color = "#27ae60";
        break;
      case "cancelled":
        statusText = "Đã bị hủy";
        color = "#c0392b";
        break;
      default:
        statusText = "Cập nhật trạng thái";
    }

    const mailOptions = {
      from: `"DHD - GlassesShop" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `[Cập nhật] Đơn hàng #${order._id} - ${statusText}`,
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${color}; text-align: center;">${statusText.toUpperCase()}</h2>
            <p>Xin chào <strong>${order.user?.name || "Khách hàng"}</strong>,</p>
            <p>Đơn hàng <strong>#${order._id}</strong> của bạn vừa chuyển sang trạng thái: <strong>${statusText}</strong>.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173/order/${order._id}" style="background-color: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xem chi tiết đơn hàng</a>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">Cảm ơn bạn đã mua sắm tại DHD - GlassesShop!</p>
          </div>
        `,
    };

    await transporter.sendMail(mailOptions);
    console.log(` Đã gửi mail trạng thái đơn #${order._id}`);
  } catch (error) {
    console.error(" Lỗi gửi mail status:", error);
  }
};

//  3. Hàm gửi mail chung (Dùng cho quên mật khẩu, v.v...)
export const sendEmail = async (options) => {
  const mailOptions = {
    from: `"DHD - GlassesShop" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html || options.message, // Hỗ trợ cả 2 trường
  };
  await transporter.sendMail(mailOptions);
};

// Mặc định export sendEmail cho các file khác dùng
export default sendEmail;
