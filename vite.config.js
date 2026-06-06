import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import path from 'path'

export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/api': path.resolve(__dirname, 'src', 'api'),
      '@/utils': path.resolve(__dirname, 'src', 'utils'),
      '@/store': path.resolve(__dirname, 'src', 'store'),
      '@/config': path.resolve(__dirname, 'src', 'config'),
    },
  },
})
