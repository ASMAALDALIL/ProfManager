import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* ─────────────────────────────────────────────────────────
   OPTION A (recommandée) : vite-plugin-pwa
   Installe avec :  npm install -D vite-plugin-pwa
   Puis ajoutez et configurez VitePWA si vous souhaitez activer le PWA.
   ───────────────────────────────────────────────────────── */

export default defineConfig({
  plugins: [
    react(),

    // Option A : vite-plugin-pwa est désactivé. Décommentez cette section si vous installez vite-plugin-pwa.
  ],

  server: {
    port: 5173,
    host: true, // accessible sur le réseau local (mobile sur même réseau Wi-Fi)
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        /* Code splitting : sépare les vendors pour meilleur cache */
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          i18n:   ["react-i18next", "i18next"],
          http:   ["axios"],
        },
      },
    },
  },
});