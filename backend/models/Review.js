const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    product_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },

    // Điểm đánh giá, ví dụ: từ 1 đến 5 sao
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },

    // Bình luận của khách hàng
    comment: { 
        type: String, 
        required: false, 
        trim: true 
    },

    // Trạng thái duyệt đánh giá
    status: {
        type: String,
        enum: ['Show', 'Hidden'],
        default: 'Show'
    },

    created_at: { 
        type: Date, 
        default: Date.now 
    },

    updated_at: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

// Cập nhật thời gian cập nhật khi duyệt hoặc chỉnh sửa đánh giá
ReviewSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Review', ReviewSchema);
