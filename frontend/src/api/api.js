import axios from "axios";
import i18n from "../i18n";

// Utilise la variable d'environnement injectée lors du build/docker, sinon localhost en local
const baseURL = import.meta.env.VITE_API_URL || "https://profmanager.onrender.com/";

const api = axios.create({
  baseURL,
});

// Intercepteur de requête : injection du token et normalisation de la langue
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Normalisation stricte de la langue (envoie "fr" ou "ar" au lieu de "fr-FR")
    if (i18n?.language) {
      const cleanLang = i18n.language.toLowerCase().startsWith("ar") ? "ar" : "fr";
      config.headers["Accept-Language"] = cleanLang;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse : purge automatique du stockage si le token est invalide ou expiré
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const url = error.config?.url || "";
      const isAuthRoute = url.includes("auth/login") || url.includes("connexion");

      if (!isAuthRoute) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/connexion";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
