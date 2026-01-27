import Contact from "../models/Contact.js";

const contactController = {

    // USER GỬI TIN NHẮN (CHỈ 1 HỘI THOẠI / USER)
    sendContact: async (req, res) => {
        try {
            const { message, subject } = req.body;
            const userId = req.user._id;

            let imagePath = null;
            if (req.file) {
                imagePath = `/uploads/${req.file.filename}`;
            }

            if ((!message || message.trim() === "") && !imagePath) {
                return res.status(400).json({
                    message: "Vui lòng nhập tin nhắn hoặc gửi ảnh"
                });
            }

            // 🔥 TÌM CONTACT CŨ
            let contact = await Contact.findOne({ user_id: userId });

            // ✅ NẾU ĐÃ CÓ → CHAT TIẾP
            if (contact) {
                contact.conversation.push({
                    sender: "user",
                    message: message || "",
                    image: imagePath
                });

                contact.status = "new";
                contact.isReadByAdmin = false;
                contact.isReadByUser = true;

                await contact.save();

                return res.status(200).json({
                    success: true,
                    data: contact
                });
            }

            // ✅ CHƯA CÓ → TẠO DUY NHẤT 1 LẦN
            const newContact = new Contact({
                user_id: userId,
                subject: subject || "Hỗ trợ khách hàng",
                status: "new",
                isReadByAdmin: false,
                isReadByUser: true,
                conversation: [
                    {
                        sender: "user",
                        message: message || "",
                        image: imagePath
                    }
                ]
            });

            await newContact.save();

            res.status(201).json({
                success: true,
                data: newContact
            });

        } catch (error) {
            console.error("SEND CONTACT ERROR:", error);
            res.status(500).json({ message: error.message });
        }
    },

    // ADMIN - LẤY TẤT CẢ CONTACT
    getAllContacts: async (req, res) => {
        try {
            const contacts = await Contact.find()
                .populate("user_id", "fullname email phone avatarUrl")
                .sort({ updatedAt: -1 });

            res.status(200).json({ success: true, data: contacts });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // USER - LỊCH SỬ CHAT (LUÔN TỐI ĐA 1 RECORD)
    getMyContacts: async (req, res) => {
        try {
            const contact = await Contact.findOne({
                user_id: req.user._id
            }).populate("user_id", "fullname email phone avatarUrl");

            res.status(200).json({
                success: true,
                data: contact ? [contact] : []
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // CHAT 2 CHIỀU
    addMessage: async (req, res) => {
        try {
            const { id } = req.params;
            const { message } = req.body;
            const sender = req.user.role === "admin" ? "admin" : "user";

            let imagePath = null;
            if (req.file) {
                imagePath = `/uploads/${req.file.filename}`;
            }

            if ((!message || message.trim() === "") && !imagePath) {
                return res.status(400).json({
                    message: "Vui lòng nhập tin nhắn hoặc gửi ảnh"
                });
            }

            const update = {
                $push: {
                    conversation: {
                        sender,
                        message: message || "",
                        image: imagePath
                    }
                },
                status: sender === "admin" ? "processing" : "new",
                isReadByAdmin: sender === "admin",
                isReadByUser: sender === "user"
            };

            const contact = await Contact.findByIdAndUpdate(
                id,
                update,
                { new: true }
            ).populate("user_id", "fullname email phone avatarUrl");

            if (!contact) {
                return res.status(404).json({ message: "Không tìm thấy hội thoại" });
            }

            res.status(200).json({ success: true, data: contact });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // ĐÁNH DẤU ĐÃ ĐỌC
    markAsRead: async (req, res) => {
        try {
            const { id } = req.params;
            const role = req.user.role;

            const update =
                role === "admin"
                    ? { isReadByAdmin: true }
                    : { isReadByUser: true };

            await Contact.findByIdAndUpdate(id, update);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // XOÁ (OPTIONAL – CÓ THỂ KHÔNG DÙNG)
    deleteContact: async (req, res) => {
        try {
            const { id } = req.params;
            const contact = await Contact.findById(id);

            if (!contact) {
                return res.status(404).json({ message: "Không tồn tại" });
            }

            if (
                req.user.role !== "admin" &&
                !contact.user_id.equals(req.user._id)
            ) {
                return res.status(403).json({ message: "Không có quyền" });
            }

            await Contact.findByIdAndDelete(id);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default contactController;
