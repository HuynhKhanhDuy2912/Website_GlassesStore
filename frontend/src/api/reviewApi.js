import axiosClient from "./axiosClient";

const reviewApi = {
    // 1. Lấy tất cả đánh giá (Admin)
    getAllAdmin: () => {
        return axiosClient.get('/review/admin/all');
    },

    // 2. Lấy đánh giá theo sản phẩm (Public - Dùng ở trang chi tiết sản phẩm)
    getByProduct: (productId) => {
        return axiosClient.get(`/review/product/${productId}`);
    },

    // 3. Admin đổi trạng thái (Show/Hidden)
    toggleStatus: (id, status) => {
        return axiosClient.put(`/review/${id}/status`, { status });
    },

    // 4. Xóa đánh giá
    delete: (id) => {
        return axiosClient.delete(`/review/${id}`);
    }
};

export default reviewApi;