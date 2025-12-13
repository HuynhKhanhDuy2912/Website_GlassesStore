// src/api/uploadApi.js
import axiosClient from "./axiosClient";

const uploadApi = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file); // Chữ 'image' phải khớp với backend

        return axiosClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Bắt buộc cho upload file
            }
        });
    }
};
export default uploadApi;