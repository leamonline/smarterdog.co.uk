import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const APP_VERSION = process.env.npm_package_version ?? '0.0.0';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        faqs: resolve(__dirname, 'faqs.html'),
        cookies: resolve(__dirname, 'cookies.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        terms: resolve(__dirname, 'terms.html'),
        offline: resolve(__dirname, 'offline.html'),
        notFound: resolve(__dirname, '404.html')
      }
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION)
  }
});
