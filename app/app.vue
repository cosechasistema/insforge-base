<script setup lang="ts">
useHead({
  meta: [
    { name: 'theme-color', content: '#1565C0' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'InsForge Base' },
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
