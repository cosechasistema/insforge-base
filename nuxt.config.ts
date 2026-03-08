// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  experimental: {
    appManifest: false,
  },

  modules: [
    'vuetify-nuxt-module',
    '@vite-pwa/nuxt',
  ],

  runtimeConfig: {
    public: {
      insforgeUrl: '',
      insforgeKey: '',
    },
  },

  vuetify: {
    moduleOptions: {
      styles: true,
      autoImport: true,
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: 'insforgeBaseTheme',
        themes: {
          insforgeBaseTheme: {
            dark: false,
            colors: {
              primary: '#1565C0',
              secondary: '#26A69A',
              background: '#FAFAFA',
              surface: '#FFFFFF',
              error: '#D32F2F',
              warning: '#FFA000',
              info: '#1976D2',
              success: '#388E3C',
            },
          },
        },
      },
      defaults: {
        VBtn: {
          rounded: 'lg',
        },
        VTextField: {
          variant: 'outlined',
          density: 'comfortable',
        },
        VCard: {
          rounded: 'lg',
        },
      },
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'InsForge Base',
      short_name: 'InsForge',
      description: 'InsForge Base Template',
      theme_color: '#1565C0',
      background_color: '#FAFAFA',
      display: 'standalone',
      lang: 'es',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      runtimeCaching: [
        {
          urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
          handler: 'NetworkFirst' as const,
          options: {
            cacheName: 'pages-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24,
            },
          },
        },
        {
          urlPattern: ({ request }: { request: Request }) =>
            ['style', 'script', 'image', 'font'].includes(request.destination),
          handler: 'StaleWhileRevalidate' as const,
          options: {
            cacheName: 'assets-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },
})
