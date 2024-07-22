import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/account': {
        target: 'http://89.116.110.42:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/account/, '/account')
      },
      '/workorder': {
        target: 'http://89.116.110.42:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/workorder/, '/workorder')
      }
    },
  },
  plugins: [react()],
});
