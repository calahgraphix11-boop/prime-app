import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Verification-only builds skip service-worker generation, which costs ~21s of
// the build (workbox-build module load + Rollup SW bundling — not asset volume).
// Triggered by `npm run build:check`, which runs `vite build --mode check`.
// The default production build (`npm run build`) is unaffected: skipPWA is false
// for every other mode, so the service worker is generated exactly as before.
export default defineConfig(({ mode }) => {
  const skipPWA = mode === 'check';

  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        disable: skipPWA,
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.png', 'favicon.svg'],
        manifest: {
          name: 'Prime — Study Smarter',
          short_name: 'Prime',
          description: 'AI-powered study app for university students in Cameroon',
          theme_color: '#001a10',
          background_color: '#001a10',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/login',
          icons: [
            {
              src: 'favicon.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'favicon.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5000000,
          skipWaiting: true,
          clientsClaim: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
              }
            }
          ]
        }
      })
    ],
  };
});
