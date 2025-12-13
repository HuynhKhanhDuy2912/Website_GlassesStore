import axiosClient from "./axiosClient";

const contactApi = {
    // 1. Lấy tất cả tin nhắn (Dành cho Admin)
    getAll: () => {
        return axiosClient.get('/contact'); 
    },

    // 2. Gửi tin nhắn (Dành cho User - dùng ở trang Client)
    send: (data) => {
        return axiosClient.post('/contact', data);
    },
    send: (data) => {
        return axiosClient.post('/contact', data);
    },

    // 3. Xóa tin nhắn (Dành cho Admin)
    delete: (id) => {
        return axiosClient.delete(`/contact/${id}`);
    },
    reply: (id, replyContent) => {
        return axiosClient.put(`/contact/${id}/reply`, { reply: replyContent });
    },
    getMyHistory: () => {
        return axiosClient.get('/contact/my-history');
    },
    chat: (id, message) => {
        return axiosClient.put(`/contact/${id}/chat`, { message });
    }
};

export default contactApi;