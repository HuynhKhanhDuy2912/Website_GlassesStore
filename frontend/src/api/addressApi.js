import axiosClient from "./axiosClient";

const addressApi = {
    // Lấy danh sách địa chỉ
    getMyAddresses: () => {
        return axiosClient.get('/shippingAddress');
    },

    // Thêm mới
    create: (data) => {
        return axiosClient.post('/shippingAddress', data);
    },

    // Xóa
    delete: (id) => {
        return axiosClient.delete(`/shippingAddress/${id}`);
    },

    // Set mặc định
    setDefault: (id) => {
        return axiosClient.put(`/shippingAddress/${id}/set-default`);
    }
};

export default addressApi;