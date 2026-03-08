<script setup lang="ts">
const drawer = ref(true)
</script>

<template>
  <v-app>
    <LayoutAppToolbar @toggle-drawer="drawer = !drawer" />
    <LayoutAppSidebar v-model="drawer" />
    <v-main class="bg-background">
      <v-container fluid>
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
