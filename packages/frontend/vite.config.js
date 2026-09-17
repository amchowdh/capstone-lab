import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// JSX lives in .js files (carried over from the CRA setup), so tell the React
// plugin and esbuild to treat .js as JSX. /api is proxied to the Express backend.
export default defineConfig({
  plugins: [react({ include: '**/*.{js,jsx}' })],
  esbuild: { loader: 'jsx', include: /src\/.*\.js$/, exclude: [] },
  optimizeDeps: {
    esbuildOptions: { loader: { '.js': 'jsx' } }
  },
  server: {
    port: 3000,
    proxy: { '/api': 'http://localhost:3030' }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: false
  }
});
