const CartItemSchema = new Schema({
    cart_id: { type: Schema.Types.ObjectId, ref: 'Cart', required: true },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },

    quantity: { type: Number, required: true, min: 1 },

    price_at_time: { type: Number, required: true },
    total_price: { type: Number, default: 0 },
}, {
    timestamps: true
});

// Tự tính total_price
CartItemSchema.pre("save", function(next) {
    this.total_price = this.quantity * this.price_at_time;
    next();
});

// Không cho trùng sản phẩm + variant
CartItemSchema.index(
    { cart_id: 1, product_id: 1 }, 
    { unique: true }
);

module.exports = mongoose.model('CartItem', CartItemSchema);
