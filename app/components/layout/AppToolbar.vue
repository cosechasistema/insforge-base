<script setup lang="ts">
import { APP_CONFIG } from '~/utils/config'

const { user, signOut } = useAuth()

const emit = defineEmits<{
  toggleDrawer: []
}>()
</script>

<template>
  <v-app-bar color="primary" flat>
    <v-app-bar-nav-icon
      color="white"
      aria-label="Abrir menu"
      data-testid="toolbar-menu"
      @click="emit('toggleDrawer')"
    />

    <v-toolbar-title class="text-white font-weight-bold">
      {{ APP_CONFIG.name }}
    </v-toolbar-title>

    <v-spacer />

    <span v-if="user" class="text-white text-body-medium mr-2 d-none d-sm-inline" data-testid="toolbar-username">
      {{ user.profile.name ?? user.email }}
    </span>

    <v-btn icon color="white" to="/" aria-label="Ir al inicio" data-testid="toolbar-home">
      <v-icon icon="mdi-home" />
    </v-btn>

    <v-btn icon color="white" aria-label="Cerrar sesion" data-testid="toolbar-logout" @click="signOut">
      <v-icon icon="mdi-logout" />
    </v-btn>
  </v-app-bar>
</template>
