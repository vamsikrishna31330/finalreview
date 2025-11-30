import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  build: {
    outDir: "dist"
  },
  base: "/finalreview/",
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
});
