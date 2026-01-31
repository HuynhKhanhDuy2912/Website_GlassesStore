import axios from "axios";

const BACKENDURL = import.meta.env.VITE_BECKEND_API_URL||"http://localhost:5000/api";
const axiosClient = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: BACKENDURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Gắn token tự động
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // USER BỊ BLOCK
    if (status === 403 && message?.includes("bị khóa")) {
      alert("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
