import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from 'vite-plugin-remove-console';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    removeConsole()
  ],
  server: {
    watch: {
      usePolling: true,
      interval: 1000,  // Adjust interval to control how often it checks for file changes
    },
    host: '0.0.0.0',  // Make sure Vite listens on all interfaces
    port: 5173,        // Ensure the correct port
    proxy: {
      '/api/user': {
        target: 'http://localhost:7777',
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
