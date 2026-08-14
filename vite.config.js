import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-v2-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-v2-${Date.now()}.js`,
        assetFileNames: `assets/[name]-v2-${Date.now()}.[ext]`
      }
    }
  }
});
