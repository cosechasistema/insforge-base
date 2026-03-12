<script setup lang="ts">
import type { Transferencia } from '~/types'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const { obtener } = useTransferencias()

const transferenciaId = route.params.id as string
const transferencia = ref<Transferencia | null>(null)
const loadingPage = ref(true)

const estadoColor: Record<string, string> = {
  COMPLETED: 'success',
  FAILED: 'error',
  IN_PROGRESS: 'warning',
  UNKNOWN: 'grey',
  UNKNOWN_FOREVER: 'grey-darken-1',
}

const estadoLabel: Record<string, string> = {
  COMPLETED: 'Completada',
  FAILED: 'Fallida',
  IN_PROGRESS: 'En progreso',
  UNKNOWN: 'Desconocido',
  UNKNOWN_FOREVER: 'Sin resolucion',
}

function formatFecha(fecha: string | null) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatMonto(monto: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto)
}

async function cargarDatos() {
  loadingPage.value = true
  const { data } = await obtener(transferenciaId)
  transferencia.value = data
  loadingPage.value = false
}

onMounted(cargarDatos)
</script>

<template>
  <div>
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      to="/transferencias"
      class="mb-4"
    >
      Volver a transferencias
    </v-btn>

    <v-progress-linear v-if="loadingPage" indeterminate color="secondary" />

    <template v-else-if="transferencia">
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4" data-testid="transferencia-detail-title">
          Transferencia {{ transferencia.bind_id }}
        </h1>
        <v-chip
          :color="estadoColor[transferencia.estado] || 'grey'"
          size="large"
          variant="tonal"
        >
          {{ estadoLabel[transferencia.estado] || transferencia.estado }}
        </v-chip>
      </div>

      <!-- Monto destacado -->
      <v-card class="mb-6 pa-6 text-center">
        <div class="text-caption text-medium-emphasis">
          Monto
        </div>
        <div class="text-h3 font-weight-bold text-primary">
          {{ formatMonto(transferencia.monto) }}
        </div>
        <div class="text-caption text-medium-emphasis mt-1">
          {{ transferencia.moneda }}
        </div>
      </v-card>

      <v-row>
        <!-- Datos del origen -->
        <v-col cols="12" md="6">
          <v-card class="pa-4">
            <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center ga-2 pa-0 mb-3">
              <v-icon icon="mdi-bank-transfer-in" size="20" />
              Origen
            </v-card-title>
            <v-table density="compact">
              <tbody>
                <tr>
                  <td class="text-medium-emphasis" style="width: 140px;">
                    Nombre
                  </td>
                  <td class="font-weight-medium">
                    {{ transferencia.origen_nombre || '-' }}
                  </td>
                </tr>
                <tr>
                  <td class="text-medium-emphasis">
                    CUIT
                  </td>
                  <td class="font-weight-medium">
                    {{ transferencia.origen_cuit || '-' }}
                  </td>
                </tr>
                <tr>
                  <td class="text-medium-emphasis">
                    CBU/CVU
                  </td>
                  <td class="font-weight-medium">
                    {{ transferencia.origen_cbu || '-' }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>

        <!-- Datos de la transferencia -->
        <v-col cols="12" md="6">
          <v-card class="pa-4">
            <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center ga-2 pa-0 mb-3">
              <v-icon icon="mdi-file-document-outline" size="20" />
              Detalle
            </v-card-title>
            <v-table density="compact">
              <tbody>
                <tr>
                  <td class="text-medium-emphasis" style="width: 140px;">
                    ID BIND
                  </td>
                  <td class="font-weight-medium">
                    {{ transferencia.bind_id }}
                  </td>
                </tr>
                <tr>
                  <td class="text-medium-emphasis">
                    Descripcion
                  </td>
                  <td class="font-weight-medium">
                    {{ transferencia.descripcion || '-' }}
                  </td>
                </tr>
                <tr>
                  <td class="text-medium-emphasis">
                    Concepto
                  </td>
                  <td class="font-weight-medium">
                    {{ transferencia.concepto || '-' }}
                  </td>
                </tr>
                <tr>
                  <td class="text-medium-emphasis">
                    Cuenta destino
                  </td>
                  <td class="font-weight-medium">
                    {{ transferencia.destino_cuenta || '-' }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Fechas -->
      <v-card class="mt-4 pa-4">
        <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center ga-2 pa-0 mb-3">
          <v-icon icon="mdi-clock-outline" size="20" />
          Fechas
        </v-card-title>
        <v-row>
          <v-col cols="12" sm="4">
            <div class="text-caption text-medium-emphasis">
              Fecha inicio
            </div>
            <div class="font-weight-medium">
              {{ formatFecha(transferencia.fecha_inicio) }}
            </div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="text-caption text-medium-emphasis">
              Fecha fin
            </div>
            <div class="font-weight-medium">
              {{ formatFecha(transferencia.fecha_fin) }}
            </div>
          </v-col>
          <v-col cols="12" sm="4">
            <div class="text-caption text-medium-emphasis">
              Fecha negocio
            </div>
            <div class="font-weight-medium">
              {{ transferencia.fecha_negocio || '-' }}
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- JSON raw -->
      <v-expansion-panels class="mt-4">
        <v-expansion-panel title="Datos raw (JSON original de BIND)">
          <v-expansion-panel-text>
            <pre class="text-caption pa-2 bg-grey-lighten-4 rounded overflow-auto">{{ JSON.stringify(transferencia.datos_raw, null, 2) }}</pre>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>

    <v-alert v-else type="error" variant="tonal">
      Transferencia no encontrada.
    </v-alert>
  </div>
</template>
