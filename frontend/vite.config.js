import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5000,
    watch: { ignored: ['**/public/sprites/**'] },
  },
  build: {
    rollupOptions: {
      input: {
        main:         'index.html',
        sceneBuilder: 'scene-builder.html',
      }
    }
  }
})
