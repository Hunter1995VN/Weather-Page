import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Use relative path for flawless GitHub Pages & subfolder deployments
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
