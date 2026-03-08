<script setup lang="ts">
import type { UserRole } from '~/types'

definePageMeta({
  middleware: ['auth', 'admin'],
})

const insforge = useInsforge()

const users = ref<(UserRole & { id: string; created_at: string })[]>([])
const loading = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const headers = [
  { title: 'User ID', key: 'user_id', sortable: true },
  { title: 'Rol', key: 'role', sortable: true },
  { title: 'Creado', key: 'created_at', sortable: true },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const },
]

async function fetchUsers() {
  loading.value = true
  try {
    const { data, error } = await insforge.database
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      snackbar.value = { show: true, text: 'Error al cargar usuarios', color: 'error' }
      return
    }
    users.value = data ?? []
  }
  finally {
    loading.value = false
  }
}

async function toggleRole(userRole: UserRole & { id: string }) {
  const newRole = userRole.role === 'admin' ? 'user' : 'admin'
  const { error } = await insforge.database
    .from('user_roles')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('user_id', userRole.user_id)
    .select()

  if (error) {
    snackbar.value = { show: true, text: 'Error al cambiar rol', color: 'error' }
    return
  }

  snackbar.value = { show: true, text: `Rol cambiado a ${newRole}`, color: 'success' }
  await fetchUsers()
}

onMounted(fetchUsers)
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center ga-3">
        <v-icon icon="mdi-account-group" size="40" color="primary" />
        <h1 class="text-h4">
          Usuarios
        </h1>
      </div>
    </div>

    <v-skeleton-loader
      v-if="loading"
      type="table-heading, table-row-divider@5, table-row"
      class="mb-4 elevation-1 rounded-lg"
    />

    <v-data-table
      v-else
      :headers="headers"
      :items="users"
      item-value="id"
      class="elevation-1 rounded-lg"
      no-data-text="No hay usuarios con roles asignados"
      data-testid="users-table"
    >
      <template #item.user_id="{ item }">
        <code class="text-caption" :title="item.user_id">{{ item.user_id.slice(0, 8) }}...</code>
      </template>

      <template #item.role="{ item }">
        <v-chip
          :color="item.role === 'admin' ? 'primary' : 'default'"
          size="small"
        >
          {{ item.role }}
        </v-chip>
      </template>

      <template #item.created_at="{ item }">
        {{ new Date(item.created_at).toLocaleDateString('es-AR') }}
      </template>

      <template #item.actions="{ item }">
        <v-btn
          size="small"
          variant="tonal"
          :color="item.role === 'admin' ? 'warning' : 'primary'"
          data-testid="toggle-role"
          @click="toggleRole(item)"
        >
          {{ item.role === 'admin' ? 'Quitar admin' : 'Hacer admin' }}
        </v-btn>
      </template>
    </v-data-table>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>
