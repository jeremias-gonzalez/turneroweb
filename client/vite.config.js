import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Esto permite que escuche en 0.0.0.0
    port: 5173, // (Opcional) Cambia el puerto si necesitas otro
  },
})
