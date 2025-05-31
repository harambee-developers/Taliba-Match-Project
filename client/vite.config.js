import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import removeConsole from 'vite-plugin-remove-console'

export default defineConfig({
  plugins: [
    react(),           // Enables React with Fast Refresh
    removeConsole({
      external: [],
      include: ['**/*.js'],
      exclude: [],
    })   // Removes console.* calls from production build
  ],
  server: {
    watch: {
      usePolling: true,     // Useful in Docker or VM environments
      interval: 1000,
    },
    host: '0.0.0.0',         // Allows access via LAN/IP
    port: 5173,              // Standard Vite dev port
    proxy: {
      '/api/user': {
        target: 'http://localhost:7777',  // Backend server target
        changeOrigin: true,
        secure: false,
      }
    }
  },
})
