import axiosClient from "./axiosClient";

const orderApi = {
    // Admin: Lấy tất cả đơn hàng (có thể lọc theo ?status=...)
    getAll: (params) => {
        return axiosClient.get('/order', { params });
    },

    // Admin/User: Xem chi tiết 1 đơn hàng (kèm sản phẩm)
    getDetail: (id) => {
        return axiosClient.get(`/order/${id}`);
    },

    // Admin: Cập nhật trạng thái
    updateStatus: (id, status) => {
        // status: 'pending' | 'processing' | 'completed' | 'cancelled'
        return axiosClient.put(`/order/${id}/status`, { status });
    },
    createOrder: (data) => {
        return axiosClient.post('/order', data);
    },
    // User: Lấy đơn hàng của tôi
    getMyOrders: () => {
        return axiosClient.get('/order/my-orders');
    },
    cancelOrder: (orderId) => {
        return axiosClient.put(`/order/${orderId}/cancel`);
    }
};

export default orderApi;