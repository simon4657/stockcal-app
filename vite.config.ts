import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // For Render deployment, use root path
  base: '/',
  build: {
    outDir: 'dist',
  }
})
