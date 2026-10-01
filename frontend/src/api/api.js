import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://profmanager.onrender.com",
});

// Intercepteur de requête : ajoute le token ET désactive le cache
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Interdit au navigateur de mettre en cache les requêtes GET
  if (config.method === "get") {
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";
    
    // Ajoute un paramètre horodaté pour garantir une réponse fraîche
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
  }

  return config;
});

export default api;
