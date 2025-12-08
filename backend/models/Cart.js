const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true 
    },

    items: [{
        product_id: { 
            type: Schema.Types.ObjectId, 
            ref: 'Product', // Liên kết với bảng Sản phẩm (Mắt kính)
            required: true 
        },
        quantity: { type: Number, required: true, default: 1 },
    }],
    total_amount: {          // Tổng tiền giỏ hàng
        type: Number,
        default: 0,
    },

    total_items: {           // Tổng số CartItem
        type: Number,
        default: 0,
    }

}, {
    timestamps: true // createdAt + updatedAt
});

module.exports = mongoose.model('Cart', CartSchema);
