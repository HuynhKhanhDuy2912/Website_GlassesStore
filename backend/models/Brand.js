const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BrandSchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },

    description: { type: String },

    image: { type: String },

    country: { type: String },
    
    isActive: { type: Boolean, default: true },

}, { timestamps: true });

module.exports = mongoose.model('Brand', BrandSchema);
