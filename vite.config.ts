import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(__dirname, 'src'),
      'pdfjs-dist': resolve(__dirname, 'node_modules/pdfjs-dist/legacy/build/pdf'),
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist'],
    exclude: ['pdfjs-dist/legacy/build/pdf.worker']
  },
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api2': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api2/, '')
      },
    }
  }
});