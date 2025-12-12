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
    }
};

module.exports = contactController;