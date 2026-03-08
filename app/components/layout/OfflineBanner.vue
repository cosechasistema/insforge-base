<script setup lang="ts">
const isOffline = ref(false)

function updateStatus() {
  isOffline.value = !navigator.onLine
}

onMounted(() => {
  updateStatus()
  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateStatus)
  window.removeEventListener('offline', updateStatus)
})
</script>

<template>
  <v-banner
    v-if="isOffline"
    icon="mdi-wifi-off"
    color="warning"
    sticky
    lines="one"
    class="offline-banner"
  >
    <template #text>
      No internet connection — Changes will not be saved until you reconnect.
    </template>
  </v-banner>
</template>

<style scoped>
.offline-banner {
  z-index: 1000;
}
</style>
