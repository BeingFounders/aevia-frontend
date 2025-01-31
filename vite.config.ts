import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '84da-2800-a4-29a2-a100-a97f-3cb2-82c1-da81.ngrok-free.app'
    ]
  }
})
