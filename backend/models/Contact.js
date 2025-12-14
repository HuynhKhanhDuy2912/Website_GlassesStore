const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    user_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    subject: { 
        type: String, 
        default: 'Hỗ trợ mới' 
    },
    status: { 
        type: String, 
        enum: ['new', 'processing', 'completed'], 
        default: 'new' 
    },
    conversation: [
        {
            sender: { type: String, enum: ['user', 'admin'], required: true },
            message: { type: String, required: true }, 
            timestamp: { type: Date, default: Date.now }
        }
    ]

}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);