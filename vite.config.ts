import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
    headers: {
      // Allow Auth0 frames for authentication
      'Content-Security-Policy': "frame-src 'self' https://*.auth0.com; object-src 'none';"
    },
    proxy: {
      // Proxy API requests to local API Gateway in development
      '/api': {
        target: 'http://localhost:8765',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});
