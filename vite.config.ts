import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ★★★ 請注意：如果您上傳到 GitHub Pages，請將 '/stockcal/' 改為您的儲存庫名稱 ★★★
  base: '/stockcal/',
  build: {
    outDir: 'dist',
  }
})