/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const src = fileURLToPath(new URL('./src', import.meta.url));
const iconsEsm = fileURLToPath(
  new URL('./node_modules/@ant-design/icons/es/index.js', import.meta.url),
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': src,
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    css: false,
    // No jsdom, `@ant-design/icons` resolve para o build CJS (`lib/`), que faz
    // `require()` de módulos ESM de `@ant-design/colors`. Forçar o build ESM
    // (`es/`) mantém toda a cadeia como ESM.
    alias: {
      '@ant-design/icons': iconsEsm,
    },
  },
});
