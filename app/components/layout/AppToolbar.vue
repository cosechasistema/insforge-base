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
      @click="emit('toggleDrawer')"
    />

    <v-toolbar-title class="text-white font-weight-bold">
      {{ APP_CONFIG.name }}
    </v-toolbar-title>

    <v-spacer />

    <span v-if="user" class="text-white text-body-2 mr-2 d-none d-sm-inline">
      {{ user.profile.name ?? user.email }}
    </span>

    <v-btn icon color="white" to="/">
      <v-icon icon="mdi-home" />
    </v-btn>

    <v-btn icon color="white" @click="signOut">
      <v-icon icon="mdi-logout" />
      <v-tooltip activator="parent" location="bottom">
        Sign out
      </v-tooltip>
    </v-btn>
  </v-app-bar>
</template>
