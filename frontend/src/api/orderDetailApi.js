import axiosClient from "./axiosClient";

const orderDetailApi = {
    // Lấy danh sách sản phẩm của đơn hàng
    getByOrderId: (orderId) => {
        return axiosClient.get(`/orderDetail/${orderId}`);
    },

    // Admin: Thêm món vào đơn
    add: (data) => {
        // data: { order_id, product_id, quantity }
        return axiosClient.post('/orderDetail', data);
    },

    // Admin: Xóa món khỏi đơn
    remove: (id) => {
        return axiosClient.delete(`/orderDetail/${id}`);
    }
};

export default orderDetailApi;