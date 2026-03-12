<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

const { transferencias, loading, listar } = useTransferencias()

const showReporte = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })
const searchQuery = ref('')

const transferenciasFiltered = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return transferencias.value

  return transferencias.value.filter((t) => {
    return (t.origen_nombre && t.origen_nombre.toLowerCase().includes(query))
      || (t.origen_cuit && t.origen_cuit.includes(query))
      || (t.descripcion && t.descripcion.toLowerCase().includes(query))
      || (t.bind_id && t.bind_id.toLowerCase().includes(query))
  })
})

const resumen = computed(() => {
  const completadas = transferencias.value.filter(t => t.estado === 'COMPLETED')
  const total = completadas.reduce((sum, t) => sum + Number(t.monto), 0)
  return {
    total: transferencias.value.length,
    completadas: completadas.length,
    fallidas: transferencias.value.filter(t => t.estado === 'FAILED').length,
    enProgreso: transferencias.value.filter(t => t.estado === 'IN_PROGRESS' || t.estado === 'UNKNOWN').length,
    montoTotal: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(total),
  }
})

onMounted(async () => {
  const { error } = await listar()
  if (error) {
    snackbar.value = { show: true, text: 'Error al cargar transferencias', color: 'error' }
  }
})

function verDetalle(id: string) {
  navigateTo(`/transferencias/${id}`)
}
</script>

<template>
  <div>
    <!-- Resumen cards -->
    <div class="d-flex ga-4 mb-6 flex-wrap">
      <v-card class="flex-grow-1 pa-4" min-width="180">
        <div class="text-caption text-medium-emphasis">
          Total recibidas
        </div>
        <div class="text-h5 font-weight-bold">
          {{ resumen.total }}
        </div>
      </v-card>
      <v-card class="flex-grow-1 pa-4" min-width="180">
        <div class="text-caption text-medium-emphasis">
          Completadas
        </div>
        <div class="text-h5 font-weight-bold text-success">
          {{ resumen.completadas }}
        </div>
      </v-card>
      <v-card class="flex-grow-1 pa-4" min-width="180">
        <div class="text-caption text-medium-emphasis">
          Fallidas / En progreso
        </div>
        <div class="text-h5 font-weight-bold text-warning">
          {{ resumen.fallidas }} / {{ resumen.enProgreso }}
        </div>
      </v-card>
      <v-card class="flex-grow-1 pa-4" min-width="200">
        <div class="text-caption text-medium-emphasis">
          Monto total (completadas)
        </div>
        <div class="text-h5 font-weight-bold text-primary">
          {{ resumen.montoTotal }}
        </div>
      </v-card>
    </div>

    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 ga-4">
      <div class="d-flex align-center ga-3 flex-shrink-0">
        <v-icon icon="mdi-swap-horizontal" size="40" color="primary" />
        <h1 class="text-h4">
          Transferencias
        </h1>
      </div>
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        placeholder="Buscar por nombre, CUIT, descripcion..."
        clearable
        hide-details
        density="compact"
        class="flex-grow-1"
        style="max-width: 500px;"
        aria-label="Buscar transferencias"
        data-testid="transferencias-search"
      />
      <div class="d-flex ga-2 flex-shrink-0">
        <v-btn
          color="info"
          variant="tonal"
          prepend-icon="mdi-chart-box-outline"
          data-testid="transferencias-report-btn"
          @click="showReporte = true"
        >
          Reporte
        </v-btn>
      </div>
    </div>

    <!-- Reporte dialog -->
    <v-dialog v-model="showReporte" max-width="900">
      <TransferenciasTransferenciaReporte
        :items="transferenciasFiltered"
        @close="showReporte = false"
      />
    </v-dialog>

    <!-- Loading skeleton -->
    <v-skeleton-loader
      v-if="loading"
      type="table-heading, table-row-divider@5, table-row"
      class="mb-4 elevation-1 rounded-lg"
    />

    <!-- Table -->
    <TransferenciasTransferenciaList
      v-else
      :items="transferenciasFiltered"
      :loading="loading"
      @ver="verDetalle"
    />

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
