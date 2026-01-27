import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true // 🔥 MỖI USER CHỈ 1 CONTACT
    },

    subject: { type: String, default: "Hỗ trợ khách hàng" },

    status: {
        type: String,
        enum: ["new", "processing", "completed"],
        default: "new"
    },

    // Trạng thái đã đọc
    isReadByAdmin: { type: Boolean, default: false },
    isReadByUser: { type: Boolean, default: true },

    conversation: [
        {
            sender: {
                type: String,
                enum: ["user", "admin"],
                required: true
            },
            message: { type: String },
            image: { type: String },
            timestamp: { type: Date, default: Date.now }
        }
    ]
}, { timestamps: true });

export default mongoose.model("Contact", contactSchema);
