import axios from "axios";
import i18n from "../i18n";

// Utilise la variable d'environnement en production, sinon localhost en local
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (i18n?.language) {
      config.headers["Accept-Language"] = i18n.language;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLogin = error.config?.url?.includes("/auth/login");
      if (!isLogin) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;