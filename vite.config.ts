import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const getEnv = (key: string): string => {
    return (
      process.env[key] ||
      env[key] ||
      process.env[`VITE_${key}`] ||
      env[`VITE_${key}`] ||
      ''
    );
  };

  const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
  const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');
  const adminSecurityKey = getEnv('VITE_ADMIN_SECURITY_KEY') || getEnv('ADMIN_SECURITY_KEY');
  const brevoApiKey = getEnv('VITE_BREVO_API_KEY') || getEnv('BREVO_API_KEY');
  const brevoSenderEmail = getEnv('VITE_BREVO_SENDER_EMAIL') || getEnv('BREVO_SENDER_EMAIL');
  const brevoListId = getEnv('VITE_BREVO_LIST_ID') || getEnv('BREVO_LIST_ID');

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.png', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Église du Nazaréen de Damé',
          short_name: 'NazareenDamé',
          description: 'Site officiel de l’Église du Nazaréen de Damé, Haïti. Cultes, ministères, CDEJ HA 0926 et prédications.',
          theme_color: '#0b1b33',
          background_color: '#071322',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    assetsInclude: ['**/*.x-icon', '**/*.heic'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'import.meta.env.VITE_ADMIN_SECURITY_KEY': JSON.stringify(adminSecurityKey),
      'import.meta.env.VITE_BREVO_API_KEY': JSON.stringify(brevoApiKey),
      'import.meta.env.VITE_BREVO_SENDER_EMAIL': JSON.stringify(brevoSenderEmail),
      'import.meta.env.VITE_BREVO_LIST_ID': JSON.stringify(brevoListId),
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

