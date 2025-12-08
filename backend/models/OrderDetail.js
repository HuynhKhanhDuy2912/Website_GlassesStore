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
    quantity: { type: Number, required: true, default: 0 },
}, {
    timestamps: true
});

// Tự tính subtotal
OrderDetailSchema.pre("save", function(next) {
    this.subtotal = this.quantity * this.unit_price;
    next();
});

module.exports = mongoose.model('OrderDetail', OrderDetailSchema);
