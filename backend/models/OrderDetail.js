const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderDetailSchema = new Schema({
    order_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Order', 
        required: true 
    },
    product_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true, 
        default: 1 
    },
    unit_price: { 
        type: Number, 
        required: true 
    },
    subtotal: { 
        type: Number, 
        default: 0 
    }
}, {
    timestamps: true
});

// Middleware tính tiền tự động trước khi lưu
OrderDetailSchema.pre("save", function(next) {
    // Chỉ tính nếu có quantity và unit_price
    if (this.quantity && this.unit_price) {
        this.subtotal = this.quantity * this.unit_price;
    }
    next();
});

module.exports = mongoose.model('OrderDetail', OrderDetailSchema);