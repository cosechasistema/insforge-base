<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { logs, loading, listar } = useSyncLog()
const syncTriggered = ref(false)
const syncLoading = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

const WEBHOOK_URL = 'https://n8nmutual.easypanel-cosecha.lat/webhook/bind-sync-transferencias'

const ultimoSync = computed(() => {
  if (logs.value.length === 0) return null
  return logs.value[0]
})

const estadoColor: Record<string, string> = {
  OK: 'success',
  ERROR: 'error',
  PARCIAL: 'warning',
}

const headers = [
  { title: 'Fecha', key: 'created_at', width: '180px' },
  { title: 'Estado', key: 'estado', width: '120px' },
  { title: 'Registros', key: 'registros', width: '100px', align: 'center' as const },
  { title: 'Nuevos', key: 'nuevos', width: '100px', align: 'center' as const },
  { title: 'Actualizados', key: 'actualizados', width: '120px', align: 'center' as const },
  { title: 'Errores', key: 'errores', width: '100px', align: 'center' as const },
  { title: 'Duracion', key: 'duracion_ms', width: '100px', align: 'center' as const },
  { title: 'Detalle', key: 'detalle_error' },
]

async function triggerSync() {
  syncLoading.value = true
  try {
    await $fetch(WEBHOOK_URL, { method: 'POST', body: { source: 'frontend' } })
    syncTriggered.value = true
    snackbar.value = { show: true, text: 'Sincronizacion iniciada. Actualizando en 15 segundos...', color: 'info' }
    setTimeout(async () => {
      await listar()
      syncLoading.value = false
    }, 15000)
  }
  catch {
    syncLoading.value = false
    snackbar.value = { show: true, text: 'Error al iniciar sincronizacion', color: 'error' }
  }
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatDuracion(ms: number | null) {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

onMounted(listar)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 ga-4">
      <div class="d-flex align-center ga-3 flex-shrink-0">
        <v-icon icon="mdi-sync" size="40" color="primary" />
        <h1 class="text-h4">
          Sync Logs
        </h1>
      </div>
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-refresh"
        :loading="syncLoading"
        :disabled="syncTriggered"
        data-testid="sync-trigger-btn"
        @click="triggerSync"
      >
        {{ syncTriggered ? 'Sincronizacion enviada' : 'Sincronizar ahora' }}
      </v-btn>
    </div>

    <!-- Ultimo sync card -->
    <v-card class="mb-6 pa-4" v-if="ultimoSync">
      <div class="d-flex align-center ga-4 flex-wrap">
        <div class="flex-grow-1">
          <div class="text-caption text-medium-emphasis">
            Ultima sincronizacion
          </div>
          <div class="text-h6 font-weight-bold">
            {{ formatFecha(ultimoSync.created_at) }}
          </div>
        </div>
        <v-chip
          :color="estadoColor[ultimoSync.estado] || 'grey'"
          size="large"
          variant="tonal"
        >
          {{ ultimoSync.estado }}
        </v-chip>
        <div class="text-center">
          <div class="text-caption text-medium-emphasis">
            Registros
          </div>
          <div class="text-h6 font-weight-bold">
            {{ ultimoSync.registros }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-caption text-medium-emphasis">
            Nuevos
          </div>
          <div class="text-h6 font-weight-bold text-success">
            {{ ultimoSync.nuevos }}
          </div>
        </div>
        <div class="text-center">
          <div class="text-caption text-medium-emphasis">
            Errores
          </div>
          <div class="text-h6 font-weight-bold" :class="ultimoSync.errores > 0 ? 'text-error' : ''">
            {{ ultimoSync.errores }}
          </div>
        </div>
      </div>
    </v-card>

    <v-alert v-else-if="!loading" type="info" variant="tonal" class="mb-6">
      No hay registros de sincronizacion. Presiona "Sincronizar ahora" para ejecutar la primera sync.
    </v-alert>

    <!-- Loading -->
    <v-skeleton-loader
      v-if="loading"
      type="table-heading, table-row-divider@5, table-row"
      class="mb-4 elevation-1 rounded-lg"
    />

    <!-- Tabla de logs -->
    <v-card v-else>
      <v-data-table
        :headers="headers"
        :items="logs"
        :items-per-page="15"
        data-testid="sync-logs-table"
        class="elevation-0"
      >
        <template #item.created_at="{ item }">
          {{ formatFecha(item.created_at) }}
        </template>

        <template #item.estado="{ item }">
          <v-chip
            :color="estadoColor[item.estado] || 'grey'"
            size="small"
            variant="tonal"
          >
            {{ item.estado }}
          </v-chip>
        </template>

        <template #item.errores="{ item }">
          <span :class="item.errores > 0 ? 'text-error font-weight-bold' : ''">
            {{ item.errores }}
          </span>
        </template>

        <template #item.duracion_ms="{ item }">
          {{ formatDuracion(item.duracion_ms) }}
        </template>

        <template #item.detalle_error="{ item }">
          <span v-if="item.detalle_error" class="text-error text-caption">
            {{ item.detalle_error }}
          </span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <template #no-data>
          <div class="text-center pa-4 text-medium-emphasis">
            No hay registros de sincronizacion
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Info card -->
    <v-card class="mt-4 pa-4" variant="outlined">
      <div class="d-flex align-center ga-2 mb-2">
        <v-icon icon="mdi-information-outline" size="20" color="info" />
        <span class="text-subtitle-2 font-weight-bold">Configuracion del cron</span>
      </div>
      <div class="text-body-2 text-medium-emphasis">
        La sincronizacion automatica se ejecuta todos los dias a las <strong>10:00 AM (Argentina)</strong>.
        El boton "Sincronizar ahora" permite ejecutar una sync manual (1 vez por sesion).
      </div>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>
