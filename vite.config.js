import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Target modern browsers — avoids the Object.groupBy polyfill and enables
    // native ES module features. Remove or lower if you need wider browser support.
    target: 'es2022',
  },
  server: {
    allowedHosts: ['terminal.local'],
    hmr: false,
  },
});
