import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cablepro_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cablepro_token");
      localStorage.removeItem("cablepro_user");
      window.dispatchEvent(new Event("cablepro:logout"));
    }
    return Promise.reject(error);
  }
);

export default api;
