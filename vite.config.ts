import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      jpg: {
        quality: 82,
        mozjpeg: true,
        progressive: true,
      },
      jpeg: {
        quality: 82,
        mozjpeg: true,
        progressive: true,
      },
      png: {
        compressionLevel: 9,
        quality: 100,
      },
    }),
  ],
})
