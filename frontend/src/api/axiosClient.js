import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- 1. Request Interceptor: Tự động gửi Token ---
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage (hoặc nơi bạn lưu)
    const token = localStorage.getItem('accessToken');
    
    // Nếu có token, gắn vào Header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 2. Response Interceptor: Xử lý dữ liệu và lỗi ---
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data để đỡ phải gọi response.data ở component
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Xử lý lỗi tập trung
    // Ví dụ: Nếu token hết hạn (401), có thể tự động logout hoặc refresh token ở đây
    if (error.response && error.response.status === 401) {
        // Tùy chọn: Xóa token và reload trang nếu cần
        // localStorage.removeItem('accessToken');
        // window.location.href = '/login';
        console.warn("Phiên đăng nhập hết hạn hoặc không hợp lệ.");
    }

    // Trả về lỗi để component hiển thị (toast)
    // Ưu tiên lấy message từ backend trả về
    throw error; 
  }
);

export default axiosClient;