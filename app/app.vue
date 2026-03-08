<script setup lang="ts">
import { APP_CONFIG } from '~/utils/config'

useHead({
  htmlAttrs: {
    lang: 'es',
  },
  title: APP_CONFIG.name,
  meta: [
    { name: 'description', content: APP_CONFIG.description },
    { name: 'theme-color', content: '#1565C0' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: APP_CONFIG.name },
    { property: 'og:title', content: APP_CONFIG.name },
    { property: 'og:description', content: APP_CONFIG.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/icon-512.png' },
  ],
  link: [
    { rel: 'apple-touch-icon', href: '/icon-192.png' },
    { rel: 'manifest', href: '/manifest.webmanifest' },
  ],
})
</script>

<template>
  <LayoutOfflineBanner />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
