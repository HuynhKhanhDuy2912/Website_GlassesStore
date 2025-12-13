import axiosClient from "./axiosClient";

const paymentApi = {
    // Lấy tất cả thanh toán (Admin)
    getAll: () => {
        return axiosClient.get('/payment'); 
    },

    // Lấy thanh toán theo đơn hàng
    getByOrder: (orderId) => {
        return axiosClient.get(`/payment/${orderId}`);
    },
    
    // (Optional) Nếu bạn muốn làm nút xác nhận thanh toán thủ công cho Admin
    // updateStatus: (id, status) => ...
};

export default paymentApi;