import axiosClient from "./axiosClient";

const cartApi = {
    // Lấy giỏ hàng
    getCart: () => {
        return axiosClient.get('/cart');
    },

    // Thêm vào giỏ
    addToCart: (data) => {
        // data: { product_id, quantity }
        return axiosClient.post('/cart/add', data);
    },

    // Cập nhật số lượng
    updateQuantity: (data) => {
        // data: { product_id, quantity }
        return axiosClient.put('/cart/update', data);
    },

    // Xóa 1 sản phẩm
    removeItem: (productId) => {
        return axiosClient.delete(`/cart/${productId}`);
    },

    // Xóa hết giỏ
    clearCart: () => {
        return axiosClient.delete('/cart/clear');
    }
};

export default cartApi;