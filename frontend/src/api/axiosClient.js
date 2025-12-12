import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Đảm bảo cổng đúng với backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptor: Tự động "bóc" dữ liệu ---
axiosClient.interceptors.response.use(
  (response) => {
    // Nếu có response.data, trả về trực tiếp data đó
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    throw error;
  }
);

export default axiosClient;