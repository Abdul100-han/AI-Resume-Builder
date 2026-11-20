import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // 127.0.0.1, not localhost: on Windows localhost often resolves to IPv6
      // and the proxy then resets the request (the profile save shows as a generic failure).
      '/api': 'http://127.0.0.1:5000',
    },
  },
})
