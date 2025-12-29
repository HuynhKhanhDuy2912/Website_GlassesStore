import axiosClient from "./axiosClient";

const productApi = {
    getAll: (params) => {
        const url = '/product';
        return axiosClient.get(url, { params });
    },

    getBySlug: (slug) => {
        const url = `/product/${slug}`;
        return axiosClient.get(url);
    },

    create: (data) => {
        const url = '/product';
        return axiosClient.post(url, data);
    },

    update: (id, data) => {
        const url = `/product/${id}`;
        return axiosClient.put(url, data);
    },

    delete: (id) => {
        const url = `/product/${id}`;
        return axiosClient.delete(url);
    },
    getDetail: (slug) => {
        const url = `/product/${slug}`; 
        return axiosClient.get(url);
    }
};

export default productApi;