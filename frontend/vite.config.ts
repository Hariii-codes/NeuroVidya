import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Report compressed size
    reportCompressedSize: true,
    // Enable source maps for production debugging
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Design system chunk
          'design-system': [
            './src/design-system/index.ts',
            './src/design-system/DyslexiaProvider.tsx',
            './src/design-system/DyslexiaTheme.ts',
          ],
          // Vendor chunks - React ecosystem
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // State management
          'state-management': [
            'zustand',
          ],
          // Data fetching
          'data-fetching': [
            '@tanstack/react-query',
            'axios',
          ],
          // Charts
          'charts': [
            'recharts',
          ],
          // OCR
          'ocr': [
            'tesseract.js',
          ],
          // Date utilities
          'date-utils': [
            'date-fns',
          ],
        },
      },
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'axios',
    ],
  },
});
