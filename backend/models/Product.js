const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    product_name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },

    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    description: { type: String, trim: true },

    image_url: { type: String },
    images: [{ type: String }],

    category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

    // ⬇⬇⬇ thay thế brand string bằng brand_id
    brand_id: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },

    size: { type: String },
    color: { type: String },
    material: { type: String },

    quantity: { type: Number, required: true, default: 0 },

    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },

    status: {
        type: String,
        enum: ['active', 'in_stock', 'out_of_stock'],
        default: 'active',
    }

}, {
    timestamps: true,
});

module.exports = mongoose.model('Product', ProductSchema);
