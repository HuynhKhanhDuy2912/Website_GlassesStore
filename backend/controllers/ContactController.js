const Contact = require('../models/Contact');
const User = require('../models/User'); // Import để dùng nếu cần check kỹ hơn

const contactController = {
    // 1. Gửi liên hệ (Bắt buộc phải có Token đăng nhập)
    sendContact: async (req, res) => {
        try {
            const { message } = req.body;

            // Validation: Kiểm tra nội dung
            if (!message) {
                return res.status(400).json({ message: 'Vui lòng nhập nội dung tin nhắn' });
            }

            // Lấy user_id từ req.user (được giải mã từ middleware protect)
            // Nếu không đăng nhập, middleware đã chặn lại ở ngoài rồi.
            const newContact = new Contact({
                user_id: req.user._id,
                message
            });

            await newContact.save();

            res.status(201).json({
                success: true,
                message: 'Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất!',
                data: newContact
            });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 2. Lấy danh sách liên hệ (Chỉ dành cho Admin)
    getAllContacts: async (req, res) => {
        try {
            // Populate: Lấy thông tin người gửi (Họ tên, Email, SĐT, Avatar) để Admin biết mà liên lạc lại
            const contacts = await Contact.find()
                .populate('user_id', 'fullname email phone_number avatar')
                .sort({ created_at: -1 }); // Tin nhắn mới nhất hiện lên đầu

            res.status(200).json({ success: true, count: contacts.length, data: contacts });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    // 3. Xóa liên hệ (Admin xóa sau khi đã xử lý xong)
    deleteContact: async (req, res) => {
        try {
            const { id } = req.params;
            const deletedContact = await Contact.findByIdAndDelete(id);

            if (!deletedContact) {
                return res.status(404).json({ message: 'Tin nhắn liên hệ không tồn tại' });
            }

            res.status(200).json({ success: true, message: 'Đã xóa tin nhắn liên hệ' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },
    replyContact: async (req, res) => {
        try {
            const { id } = req.params;
            const { reply } = req.body; // Nội dung trả lời

            if (!reply) return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' });

            const contact = await Contact.findByIdAndUpdate(
                id,
                {
                    reply: reply,
                    status: 'replied',
                    replied_at: Date.now()
                },
                { new: true }
            );

            if (!contact) return res.status(404).json({ message: 'Tin nhắn không tồn tại' });


            res.status(200).json({ success: true, message: 'Đã gửi phản hồi thành công', data: contact });

        } catch (error) {
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },
   getMyContacts: async (req, res) => {
        try {
            const contacts = await Contact.find({ user_id: req.user._id }).sort({ updatedAt: -1 });
            res.status(200).json({ success: true, data: contacts });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    sendContact: async (req, res) => {
        try {
            const { message } = req.body;
            const userId = req.user._id; // Lấy từ token

            // --- KIỂM TRA ĐẦU VÀO ---
            if (!message || message.trim().length === 0) {
                return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
            }

            // --- TẠO CONTACT THEO CẤU TRÚC MỚI (Mảng conversation) ---
            const newContact = new Contact({
                user_id: userId,
                // Tạo tiêu đề tự động từ 50 ký tự đầu của tin nhắn
                subject: message.length > 50 ? message.substring(0, 50) + "..." : message,
                status: 'new',
                conversation: [
                    {
                        sender: 'user',
                        message: message, // Tin nhắn đầu tiên
                        timestamp: new Date()
                    }
                ]
            });

            await newContact.save();

            res.status(201).json({ 
                success: true, 
                message: 'Đã gửi yêu cầu thành công', 
                data: newContact 
            });

        } catch (error) {
            console.error("Lỗi sendContact:", error); // Log ra terminal để debug
            res.status(500).json({ message: 'Lỗi server', error: error.message });
        }
    },

    addMessage: async (req, res) => {
        try {
            const { id } = req.params;
            const { message } = req.body;
            // Xác định ai là người nhắn dựa vào role
            const sender = req.user.role === 'admin' ? 'admin' : 'user';

            const contact = await Contact.findByIdAndUpdate(
                id,
                {
                    $push: { 
                        conversation: { 
                            sender: sender, 
                            message: message 
                        } 
                    },
                    // Nếu user nhắn -> set lại là 'new' để admin chú ý
                    // Nếu admin nhắn -> set là 'processing'
                    status: sender === 'user' ? 'new' : 'processing'
                },
                { new: true }
            );
            
            res.status(200).json({ success: true, data: contact });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

module.exports = contactController;