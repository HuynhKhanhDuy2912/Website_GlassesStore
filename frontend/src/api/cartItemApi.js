import axiosClient from "./axiosClient";

const cartItemApi = {
    // Lấy danh sách items và thông tin giỏ hàng tổng
    getMyCart: () => {
        return axiosClient.get('/cartItem');
    },

    // Thêm sản phẩm (Dùng Product ID)
    add: (data) => {
        // data: { product_id, quantity }
        return axiosClient.post('/cartItem', data);
    },

    // Cập nhật số lượng (QUAN TRỌNG: Dùng CartItem ID)
    update: (cartItemId, quantity) => {
        return axiosClient.put(`/cartItem/${cartItemId}`, { quantity });
    },

    // Xóa item (QUAN TRỌNG: Dùng CartItem ID)
    remove: (cartItemId) => {
        return axiosClient.delete(`/cartItem/${cartItemId}`);
    }
};

export default cartItemApi;