import axiosClient from "./axiosClient"; 

const brandApi = {
  getAll: (params) => {
    const url = '/brands';
    return axiosClient.get(url, { params });
  },
  
  getBySlug: (slug) => {
    const url = `/brands/${slug}`;
    return axiosClient.get(url);
  },

  create: (data) => {
    const url = '/brands';
    return axiosClient.post(url, data);
  },

  update: (id, data) => {
    const url = `/brands/${id}`;
    return axiosClient.put(url, data);
  },

  delete: (id) => {
    const url = `/brands/${id}`;
    return axiosClient.delete(url);
  }
};

export default brandApi;