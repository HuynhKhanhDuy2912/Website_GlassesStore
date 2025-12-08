const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({

    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    // ID địa chỉ giao hàng từ bảng ShippingAddress
    shipping_address_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'ShippingAddress', 
        required: true 
    },

    // Tiền hàng trước giảm
    subtotal: { 
        type: Number, 
        required: true 
    },

    // Số tiền giảm giá
    discount_amount: { 
        type: Number, 
        default: 0 
    },

    // Phí vận chuyển
    shipping_fee: { 
        type: Number, 
        default: 0 
    },

    // Tổng tiền thanh toán = subtotal - discount + shipping_fee
    total_amount: { 
        type: Number, 
        required: true 
    },

    // Trạng thái đơn hàng
    order_status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending',
    },

    // Liên kết Payment (nếu có)
    payment_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Payment' 
    },

}, {
    timestamps: true // createdAt & updatedAt
});

module.exports = mongoose.model('Order', OrderSchema);
