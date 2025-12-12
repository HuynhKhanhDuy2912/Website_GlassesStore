import axiosClient from "./axiosClient";

const userApi = {
    login: (data) => axiosClient.post('/users/login', data),
    getAll: () => axiosClient.get('/users'), // Kết hợp lại thành: http://localhost:5000/api/users
    create: (data) => axiosClient.post('/users', data),
    update: (id, data) => axiosClient.put(`/users/${id}`, data),
    delete: (id) => axiosClient.delete(`/users/${id}`),
};
export default userApi;