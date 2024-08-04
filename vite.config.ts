import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/account': {
        target: 'https://auto-reporting-server.sphinx-international.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/account/, '/account')
      },
      '/workorder': {
        target: 'https://auto-reporting-server.sphinx-international.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/workorder/, '/workorder')
      },
      '/ws': {
        target: 'wss://auto-reporting-server.sphinx-international.online',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying
        rewrite: (path) => path.replace(/^\/ws/, '/ws')
      },
    },
  },
  plugins: [react()],
});
