<script setup lang="ts">
import type { ConciliacionMatch } from '~/types'

definePageMeta({
  middleware: ['auth'],
})

const { matchesFiltrados, stats, loading, filtroCategoria, cargar, confirmarMatch } = useConciliacion()

// Manual sync (same pattern as sync-logs.vue)
const syncTriggered = ref(false)
const syncLoading = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })
const WEBHOOK_URL = 'https://n8nmutual.easypanel-cosecha.lat/webhook/mysql-sync-control-transferencia'

// Detail dialog
const detalleDialog = ref(false)
const matchSeleccionado = ref<ConciliacionMatch | null>(null)

const categoryColor: Record<string, string> = {
  sugerido: 'success',
  posible: 'warning',
  sin_match: 'grey',
}

const categoryLabel: Record<string, string> = {
  sugerido: 'Sugerido',
  posible: 'Posible',
  sin_match: 'Sin match',
}

const headers = [
  { title: 'Fecha', key: 'fecha', width: '120px' },
  { title: 'Nombre', key: 'nombre' },
  { title: 'Monto', key: 'monto', align: 'end' as const, width: '150px' },
  { title: 'Banco', key: 'banco', width: '150px' },
  { title: 'Match', key: 'category', align: 'center' as const, width: '120px' },
  { title: 'Score', key: 'score', align: 'center' as const, width: '100px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const, width: '160px' },
]

async function triggerSync() {
  syncLoading.value = true
  try {
    await $fetch(WEBHOOK_URL, { method: 'POST', body: { source: 'frontend' } })
    syncTriggered.value = true
    snackbar.value = { show: true, text: 'Sincronizacion iniciada. Actualizando en 15 segundos...', color: 'info' }
    setTimeout(async () => {
      await cargar()
      syncLoading.value = false
    }, 15000)
  }
  catch {
    syncLoading.value = false
    snackbar.value = { show: true, text: 'Error al iniciar sincronizacion', color: 'error' }
  }
}

function verDetalle(match: ConciliacionMatch) {
  matchSeleccionado.value = match
  detalleDialog.value = true
}

async function verificarMatch(match: ConciliacionMatch) {
  if (!match.bindMatch) return
  await confirmarMatch(match.control.idcontrol_transferencia, match.bindMatch.id, match.score, match.reasons)
  snackbar.value = { show: true, text: 'Transferencia verificada correctamente', color: 'success' }
  detalleDialog.value = false
}

function formatFecha(fecha: string | null) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatMonto(monto: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto)
}

onMounted(cargar)
</script>

<template>
  <div data-testid="conciliacion-page">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 ga-4">
      <div class="d-flex align-center ga-3 flex-shrink-0">
        <v-icon icon="mdi-scale-balance" size="40" color="primary" />
        <h1 class="text-h4">
          Conciliacion
        </h1>
      </div>
      <div class="d-flex ga-2 flex-shrink-0">
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-database-sync"
          :loading="syncLoading"
          :disabled="syncTriggered"
          data-testid="conciliacion-sync-btn"
          @click="triggerSync"
        >
          {{ syncTriggered ? 'Sincronizacion enviada' : 'Sincronizar MySQL' }}
        </v-btn>
        <v-btn
          color="secondary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="cargar"
        >
          Actualizar
        </v-btn>
      </div>
    </div>

    <!-- Stats cards -->
    <v-row class="mb-6" data-testid="conciliacion-stats">
      <v-col cols="12" sm="6" md="4" lg>
        <v-card class="pa-4" variant="outlined">
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon icon="mdi-clock-outline" size="20" color="primary" />
            <span class="text-caption text-medium-emphasis">Total pendientes</span>
          </div>
          <div class="text-h5 font-weight-bold text-primary">
            {{ stats.totalPendientes }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg>
        <v-card class="pa-4" variant="outlined">
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon icon="mdi-check-circle" size="20" color="success" />
            <span class="text-caption text-medium-emphasis">Sugeridos</span>
          </div>
          <div class="text-h5 font-weight-bold text-success">
            {{ stats.sugeridos }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg>
        <v-card class="pa-4" variant="outlined">
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon icon="mdi-help-circle" size="20" color="warning" />
            <span class="text-caption text-medium-emphasis">Posibles</span>
          </div>
          <div class="text-h5 font-weight-bold text-warning">
            {{ stats.posibles }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg>
        <v-card class="pa-4" variant="outlined">
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon icon="mdi-close-circle" size="20" color="grey" />
            <span class="text-caption text-medium-emphasis">Sin match</span>
          </div>
          <div class="text-h5 font-weight-bold">
            {{ stats.sinMatch }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="4" lg>
        <v-card class="pa-4" variant="outlined">
          <div class="d-flex align-center ga-2 mb-1">
            <v-icon icon="mdi-check-all" size="20" color="info" />
            <span class="text-caption text-medium-emphasis">Verificados hoy</span>
          </div>
          <div class="text-h5 font-weight-bold text-info">
            {{ stats.verificadosHoy }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter chips -->
    <v-chip-group
      v-model="filtroCategoria"
      mandatory
      selected-class="text-primary"
      class="mb-4"
      data-testid="conciliacion-filter"
    >
      <v-chip value="todos" variant="outlined">
        Todos
      </v-chip>
      <v-chip value="sugerido" variant="outlined" prepend-icon="mdi-check-circle">
        Sugeridos
      </v-chip>
      <v-chip value="posible" variant="outlined" prepend-icon="mdi-help-circle">
        Posibles
      </v-chip>
      <v-chip value="sin_match" variant="outlined" prepend-icon="mdi-close-circle">
        Sin match
      </v-chip>
    </v-chip-group>

    <!-- Loading skeleton -->
    <v-skeleton-loader
      v-if="loading"
      type="table-heading, table-row-divider@5, table-row"
      class="mb-4 elevation-1 rounded-lg"
    />

    <!-- Empty state -->
    <v-alert
      v-else-if="matchesFiltrados.length === 0"
      type="info"
      variant="tonal"
      class="mb-6"
    >
      No hay registros pendientes de conciliacion. Todas las transferencias estan verificadas o no hay datos cargados.
    </v-alert>

    <!-- Main table -->
    <v-card v-else>
      <v-data-table
        :headers="headers"
        :items="matchesFiltrados"
        :items-per-page="15"
        item-value="control.idcontrol_transferencia"
        hover
        class="elevation-0"
        data-testid="conciliacion-table"
      >
        <template #item.fecha="{ item }">
          {{ formatFecha(item.control.fecha) }}
        </template>

        <template #item.nombre="{ item }">
          {{ item.control.nombre_parseado || 'Sin nombre' }}
        </template>

        <template #item.monto="{ item }">
          <span class="font-weight-bold">{{ formatMonto(item.control.monto) }}</span>
        </template>

        <template #item.banco="{ item }">
          {{ item.control.banco_origen }}
        </template>

        <template #item.category="{ item }">
          <v-chip
            :color="categoryColor[item.category] || 'grey'"
            size="small"
            variant="tonal"
          >
            {{ categoryLabel[item.category] || item.category }}
          </v-chip>
        </template>

        <template #item.score="{ item }">
          <span v-if="item.score > 0" class="font-weight-medium">{{ item.score }}</span>
          <span v-else class="text-medium-emphasis">-</span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1 justify-center">
            <v-btn
              icon
              size="small"
              variant="text"
              color="info"
              aria-label="Ver detalle"
              data-testid="conciliacion-detail-btn"
              @click="verDetalle(item)"
            >
              <v-icon icon="mdi-eye" />
              <v-tooltip activator="parent" location="top">
                Ver detalle
              </v-tooltip>
            </v-btn>
            <v-btn
              v-if="item.bindMatch"
              icon
              size="small"
              variant="text"
              color="success"
              aria-label="Verificar"
              @click="verificarMatch(item)"
            >
              <v-icon icon="mdi-check-decagram" />
              <v-tooltip activator="parent" location="top">
                Verificar
              </v-tooltip>
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="text-center pa-4 text-medium-emphasis">
            No hay registros de conciliacion
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Detail dialog -->
    <v-dialog v-model="detalleDialog" max-width="900">
      <v-card v-if="matchSeleccionado" class="pa-6">
        <v-card-title class="text-h5 d-flex align-center ga-2 pa-0 mb-4">
          <v-icon icon="mdi-scale-balance" size="28" />
          Detalle de conciliacion
        </v-card-title>

        <v-row>
          <!-- Left: MySQL record -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4">
              <div class="text-subtitle-1 font-weight-bold d-flex align-center ga-2 mb-3">
                <v-icon icon="mdi-database" size="20" color="primary" />
                Registro MySQL
              </div>
              <v-table density="compact">
                <tbody>
                  <tr>
                    <td class="text-medium-emphasis" style="width: 120px;">
                      Nombre
                    </td>
                    <td class="font-weight-medium">
                      {{ matchSeleccionado.control.nombre_parseado || 'Sin nombre' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-medium-emphasis">
                      Monto
                    </td>
                    <td class="font-weight-medium">
                      {{ formatMonto(matchSeleccionado.control.monto) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-medium-emphasis">
                      Fecha
                    </td>
                    <td class="font-weight-medium">
                      {{ formatFecha(matchSeleccionado.control.fecha) }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-medium-emphasis">
                      Banco
                    </td>
                    <td class="font-weight-medium">
                      {{ matchSeleccionado.control.banco_origen }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-medium-emphasis">
                      DNI Socio
                    </td>
                    <td class="font-weight-medium">
                      {{ matchSeleccionado.control.socio_dni }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-medium-emphasis">
                      Concepto
                    </td>
                    <td class="font-weight-medium">
                      {{ matchSeleccionado.control.concepto || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-medium-emphasis">
                      Nro Trans.
                    </td>
                    <td class="font-weight-medium">
                      {{ matchSeleccionado.control.nro_transferencia || '-' }}
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </v-card>
          </v-col>

          <!-- Right: BIND match -->
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="pa-4">
              <div class="text-subtitle-1 font-weight-bold d-flex align-center ga-2 mb-3">
                <v-icon icon="mdi-bank" size="20" color="secondary" />
                Match BIND
              </div>
              <template v-if="matchSeleccionado.bindMatch">
                <v-table density="compact">
                  <tbody>
                    <tr>
                      <td class="text-medium-emphasis" style="width: 120px;">
                        Nombre
                      </td>
                      <td class="font-weight-medium">
                        {{ matchSeleccionado.bindMatch.origen_nombre || '-' }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-medium-emphasis">
                        Monto
                      </td>
                      <td class="font-weight-medium">
                        {{ formatMonto(matchSeleccionado.bindMatch.monto) }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-medium-emphasis">
                        Fecha
                      </td>
                      <td class="font-weight-medium">
                        {{ formatFecha(matchSeleccionado.bindMatch.fecha_inicio) }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-medium-emphasis">
                        CUIT
                      </td>
                      <td class="font-weight-medium">
                        {{ matchSeleccionado.bindMatch.origen_cuit || '-' }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-medium-emphasis">
                        Descripcion
                      </td>
                      <td class="font-weight-medium">
                        {{ matchSeleccionado.bindMatch.descripcion || '-' }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-medium-emphasis">
                        ID BIND
                      </td>
                      <td class="font-weight-medium">
                        {{ matchSeleccionado.bindMatch.bind_id }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-medium-emphasis">
                        Estado
                      </td>
                      <td class="font-weight-medium">
                        {{ matchSeleccionado.bindMatch.estado }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </template>
              <div v-else class="text-center pa-6 text-medium-emphasis">
                <v-icon icon="mdi-close-circle-outline" size="48" color="grey" class="mb-2" />
                <div>No se encontro match en BIND</div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Scoring breakdown -->
        <div class="mt-4">
          <div class="text-subtitle-2 font-weight-bold mb-2">
            Score: {{ matchSeleccionado.score }} puntos
          </div>
          <div class="d-flex ga-2 flex-wrap">
            <v-chip
              v-for="reason in matchSeleccionado.reasons"
              :key="reason"
              size="small"
              variant="tonal"
              color="primary"
            >
              {{ reason }}
            </v-chip>
            <v-chip
              v-if="matchSeleccionado.reasons.length === 0"
              size="small"
              variant="tonal"
              color="grey"
            >
              Sin coincidencias
            </v-chip>
          </div>
        </div>

        <v-card-actions class="pa-0 mt-6">
          <v-spacer />
          <v-btn variant="text" @click="detalleDialog = false">
            Cerrar
          </v-btn>
          <v-btn
            v-if="matchSeleccionado.bindMatch"
            color="success"
            variant="flat"
            prepend-icon="mdi-check-decagram"
            @click="verificarMatch(matchSeleccionado)"
          >
            Verificar match
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
