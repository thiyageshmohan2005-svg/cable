import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          vendor: ["axios", "lucide-react", "react-hot-toast"]
        }
      }
    }
  },
  server: {
    port: 5173
  }
});
