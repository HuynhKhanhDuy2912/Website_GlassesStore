const Payment = require('../models/Payment');
const Order = require('../models/Order');

const paymentController = {

    // 1. Tạo thanh toán mới (Dùng cho COD hoặc khởi tạo trước khi gọi VNPAY)
    createPayment: async (req, res) => {
        try {
            const { order_id, amount, payment_method } = req.body;

            // Kiểm tra đơn hàng tồn tại
            const order = await Order.findById(order_id);
            if (!order) {
                return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
            }

            // Nếu là COD, trạng thái mặc định là pending
            // Nếu là VNPAY, cũng tạo pending trước, sau khi thanh toán xong sẽ update
            const newPayment = new Payment({
                order_id,
                amount,
                payment_method, // 'COD' hoặc 'VNPAY'
                payment_status: 'pending'
            });

            const savedPayment = await newPayment.save();

            // Cập nhật ngược lại payment_id vào bảng Order (để dễ truy vấn 2 chiều)
            order.payment_id = savedPayment._id;
            await order.save();

            res.status(201).json({ 
                success: true, 
                message: 'Đã tạo phiếu thanh toán', 
                data: savedPayment 
            });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Cập nhật kết quả thanh toán VNPAY (Dùng cho IPN hoặc Return URL)
    // Hàm này được gọi sau khi VNPAY trả kết quả về Backend
    updateVnpayResult: async (req, res) => {
        try {
            const { 
                order_id, 
                vnp_transaction_no, 
                vnp_bank_code, 
                vnp_order_info, 
                vnp_response_code 
            } = req.body;

            // Tìm phiếu thanh toán của đơn hàng này
            const payment = await Payment.findOne({ order_id });
            if (!payment) {
                return res.status(404).json({ message: 'Phiếu thanh toán không tồn tại' });
            }

            // Kiểm tra mã phản hồi từ VNPAY (00 là thành công)
            if (vnp_response_code === '00') {
                payment.payment_status = 'completed';
                payment.vnp_transaction_no = vnp_transaction_no;
                payment.vnp_bank_code = vnp_bank_code;
                payment.vnp_order_info = vnp_order_info;
                
                await payment.save();

                // Cập nhật luôn trạng thái đơn hàng sang 'processing' (hoặc 'paid')
                await Order.findByIdAndUpdate(order_id, { order_status: 'processing' });

                return res.status(200).json({ success: true, message: 'Thanh toán VNPAY thành công' });
            } else {
                // Thanh toán thất bại
                payment.payment_status = 'pending'; // Hoặc failed tùy logic
                await payment.save();
                return res.status(400).json({ success: false, message: 'Thanh toán VNPAY thất bại hoặc bị hủy' });
            }

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Xem thông tin thanh toán theo Order ID
    getPaymentByOrder: async (req, res) => {
        try {
            const { orderId } = req.params;
            const payment = await Payment.findOne({ order_id: orderId });

            if (!payment) {
                return res.status(404).json({ message: 'Chưa có thông tin thanh toán cho đơn này' });
            }

            res.status(200).json({ success: true, data: payment });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    }
};

module.exports = paymentController;