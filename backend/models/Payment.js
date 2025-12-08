const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    order_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true 
    },

    payment_date: { 
        type: Date, 
        default: Date.now 
    },

    amount: { 
        type: Number, 
        required: true 
    },

    payment_method: { 
        type: String, 
        enum: ['COD', 'VNPAY'], 
        required: true 
    },

    payment_status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending',
    },

    // Thông tin giao dịch VNPAY
    vnp_transaction_no: { type: String },   // Mã giao dịch VNPAY
    vnp_bank_code: { type: String },        // Ngân hàng thanh toán
    vnp_order_info: { type: String },       // Nội dung thanh toán
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);
