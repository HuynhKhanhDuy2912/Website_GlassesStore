import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Hoặc service bạn đang dùng
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- TEMPLATE HTML ĐẸP ---
const createOrderTemplate = (order) => {
  const items = order.orderItems || order.items || [];
  const shippingAddress = order.shippingAddress || {};
  // Xử lý trường hợp user là object hoặc chỉ là ID (dù thường đã populate)
  const userName = order.user?.name || order.name || 'Khách hàng';
  
  const totalPrice = order.totalPrice?.toLocaleString('vi-VN') || 0;
  const shippingPrice = order.shippingPrice?.toLocaleString('vi-VN') || 0;

  const itemsHtml = items.map((item) => {
    const price = item.price ? item.price.toLocaleString('vi-VN') : 0;
    const totalItem = (item.price * item.qty).toLocaleString('vi-VN');
    // Ảnh placeholder nếu không có ảnh
    const image = item.image || 'https://via.placeholder.com/60'; 

    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; width: 70px;">
            <img src="${image.startsWith('http') ? image : 'cid:' + item.product}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">
            <strong>${item.name}</strong>
            <div style="font-size: 12px; color: #777;">${item.qty} x ${price} đ</div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
            ${totalItem} đ
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #d35400; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold;">XÁC NHẬN ĐƠN HÀNG</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Mã đơn: #${order._id}</p>
        </div>
        <div style="padding: 20px;">
            <p>Xin chào <strong>${userName}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng tại HanHan Bakery. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
            
            <div style="background-color: #fff8e1; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ffe082;">
                <h3 style="margin-top: 0; color: #d35400; font-size: 15px; margin-bottom: 5px;">📍 Địa chỉ nhận hàng</h3>
                <p style="margin: 0; font-size: 14px;"><strong>${shippingAddress.fullName || userName}</strong> (${shippingAddress.phone || '---'})</p>
                <p style="margin: 5px 0 0; font-size: 13px; color: #555;">${shippingAddress.addressLine || shippingAddress.address}, ${shippingAddress.city}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f5f5f5; text-align: left;">
                        <th style="padding: 10px;" colspan="2">Sản phẩm</th>
                        <th style="padding: 10px; text-align: right;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>

            <div style="text-align: right; margin-top: 15px;">
                <p style="margin: 5px 0; color: #666; font-size: 13px;">Phí vận chuyển: ${shippingPrice} đ</p>
                <p style="margin: 5px 0; font-size: 18px; color: #d35400; font-weight: bold;">
                    Tổng cộng: ${totalPrice} đ
                </p>
            </div>
        </div>
        <div style="background-color: #333; padding: 15px; text-align: center; font-size: 12px; color: #ccc;">
            <p style="margin: 0;">&copy; 2025 HanHan Bakery. Hotline: 090.123.4567</p>
        </div>
    </div>
  `;
};

// ✅ 1. Hàm gửi mail xác nhận đơn hàng (Dùng cho order.controller.js)
export const sendOrderConfirmationEmail = async (order) => {
  try {
    const userEmail = order.user?.email || order.email; // Lấy email an toàn
    if (!userEmail) return;

    const mailOptions = {
      from: `"HanHan Bakery" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `[HanHan Bakery] Xác nhận đơn hàng #${order._id}`,
      html: createOrderTemplate(order),
    };
    await transporter.sendMail(mailOptions);
    console.log(`📧 Đã gửi mail xác nhận đơn #${order._id}`);
  } catch (error) {
    console.error('❌ Lỗi gửi mail order:', error);
  }
};

// ✅ 2. Hàm gửi mail cập nhật trạng thái (Dùng cho order.controller.js)
export const sendOrderStatusEmail = async (order) => {
    try {
      const userEmail = order.user?.email || order.email;
      if (!userEmail) return;

      let statusText = '';
      let color = '#333';

      switch (order.status) {
          case 'confirmed': statusText = 'Đã được xác nhận'; color = '#2980b9'; break;
          case 'delivered': statusText = 'Đang được giao đến bạn'; color = '#e67e22'; break;
          case 'completed': statusText = 'Giao thành công'; color = '#27ae60'; break;
          case 'cancelled': statusText = 'Đã bị hủy'; color = '#c0392b'; break;
          default: statusText = 'Cập nhật trạng thái';
      }
  
      const mailOptions = {
        from: `"HanHan Bakery" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `[Cập nhật] Đơn hàng #${order._id} - ${statusText}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${color}; text-align: center;">${statusText.toUpperCase()}</h2>
            <p>Xin chào <strong>${order.user?.name || 'Khách hàng'}</strong>,</p>
            <p>Đơn hàng <strong>#${order._id}</strong> của bạn vừa chuyển sang trạng thái: <strong>${statusText}</strong>.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173/order/${order._id}" style="background-color: ${color}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xem chi tiết đơn hàng</a>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">Cảm ơn bạn đã mua sắm tại HanHan Bakery!</p>
          </div>
        `,
      };
  
      await transporter.sendMail(mailOptions);
      console.log(`📧 Đã gửi mail trạng thái đơn #${order._id}`);
    } catch (error) {
      console.error('❌ Lỗi gửi mail status:', error);
    }
};

// ✅ 3. Hàm gửi mail chung (Dùng cho quên mật khẩu, v.v...)
export const sendEmail = async (options) => {
    const mailOptions = {
      from: `"HanHan Bakery" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message, // Hỗ trợ cả 2 trường
    };
    await transporter.sendMail(mailOptions);
};

// Mặc định export sendEmail cho các file khác dùng
export default sendEmail;