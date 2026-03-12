<script setup lang="ts">
import { APP_CONFIG } from '~/utils/config'

const { isAdmin } = useAuth()

const drawer = defineModel<boolean>({ required: true })

const menuItems = computed(() => {
  const items = [
    { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/' },
    { title: 'Transferencias', icon: 'mdi-swap-horizontal', to: '/transferencias' },
    { title: 'Items', icon: 'mdi-format-list-bulleted', to: '/items' },
  ]

  if (isAdmin.value) {
    items.push({ title: 'Users', icon: 'mdi-account-group', to: '/admin/users' })
  }

  return items
})
</script>

<template>
  <v-navigation-drawer v-model="drawer" :width="240" data-testid="sidebar">
    <div class="pa-4 text-center">
      <v-icon :icon="APP_CONFIG.icon" size="48" color="secondary" />
      <h3 class="text-h6 mt-2">
        {{ APP_CONFIG.name }}
      </h3>
    </div>

    <v-divider />

    <v-list nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.to"
        rounded="lg"
      />
    </v-list>
  </v-navigation-drawer>
</template>
