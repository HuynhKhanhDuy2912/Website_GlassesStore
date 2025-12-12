const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true // <--- Nên đổi thành true
    },

    // Nội dung khách hàng gửi
    message: {
        type: String,
        required: true,
        trim: true
    },

    // Thời gian gửi yêu cầu
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Tạo createdAt 
});

module.exports = mongoose.model('Contact', ContactSchema);
