const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // --- THÊM TRƯỜNG NÀY ---
    subject: { 
        type: String, 
        default: 'Hỗ trợ mới' 
    },

    // --- SỬA TRƯỜNG NÀY ---
    status: { 
        type: String, 
        enum: ['new', 'processing', 'completed'], 
        default: 'new' 
    },

    // --- QUAN TRỌNG: CẤU TRÚC MỚI LÀ MẢNG CONVERSATION ---
    // (Đảm bảo bạn KHÔNG còn trường "message: { type: String... }" ở ngoài này nữa)
    conversation: [
        {
            sender: { type: String, enum: ['user', 'admin'], required: true },
            message: { type: String, required: true }, // Message nằm ở trong này mới đúng
            timestamp: { type: Date, default: Date.now }
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);