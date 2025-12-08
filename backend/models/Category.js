const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    category_name: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
    },

    description: {
        type: String,
    },

    image: {
        type: String, // URL ảnh
    },

    isActive: {
        type: Boolean,
        default: true,
    }

}, {
    timestamps: true,
});

module.exports = mongoose.model('Category', CategorySchema);
