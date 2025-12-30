import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Group heavy libs/viewers into dedicated chunks
          if (id.includes('pdfjs-dist')) return 'pdf-worker'
          if (id.includes('react-router')) return 'router'
          if (id.includes('@tanstack')) return 'query'
          if (id.includes('zustand')) return 'store'
          if (id.includes('lucide-react')) return 'icons'
          // Large pages split
          if (id.includes('/pages/Document')) return 'page-document'
          if (id.includes('/pages/Matter')) return 'page-matter'
          if (id.includes('/pages/Settings')) return 'page-settings'
          return undefined
        },
      },
      // You can add more granular control here if needed
    },
    chunkSizeWarningLimit: 1100,
  },
  server: {
    host: true,
    port: 5173,
  },
})
