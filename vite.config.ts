import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('bootstrap')) {
              return 'bootstrap-vendor';
            }
            // Group other large vendor libraries
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
          
          // App chunks
          if (id.includes('AdminDashboard') || id.includes('ApprovedTopics')) {
            return 'admin';
          }
          if (id.includes('Login') || id.includes('PrivateRoute')) {
            return 'auth';
          }
          if (id.includes('Pledge')) {
            return 'forms';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Additional optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Enable source maps for debugging (disable in production if needed)
    sourcemap: false,
  }
})
