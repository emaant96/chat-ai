import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    sourcemap: true,
    cssCodeSplit: false,
    outDir: '../extension/dist/page',
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: `index.js`,
        assetFileNames: `index.css`
      }
    }
  }
});
