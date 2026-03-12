<script setup lang="ts">
import type { Transferencia } from '~/types'
import { generarExcel, generarPDF } from '~/utils/reportes'

const props = defineProps<{ items: readonly Transferencia[] }>()
const emit = defineEmits<{ close: [] }>()

const totalItems = computed(() => props.items.length)
const totalMonto = computed(() =>
  props.items
    .filter(t => t.estado === 'COMPLETED')
    .reduce((sum, t) => sum + Number(t.monto), 0),
)

function formatMonto(monto: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto)
}

const reporteHeaders = ['Fecha', 'Origen', 'CUIT', 'Descripcion', 'Monto', 'Estado']

function toRows(items: readonly Transferencia[]): string[][] {
  return items.map(t => [
    t.fecha_inicio ? new Date(t.fecha_inicio).toLocaleDateString('es-AR') : '-',
    t.origen_nombre ?? '-',
    t.origen_cuit ?? '-',
    t.descripcion ?? '-',
    formatMonto(t.monto),
    t.estado,
  ])
}

function filaResumen(): string[] {
  return [
    `Total: ${totalItems.value} transferencia(s)`,
    '',
    '',
    '',
    formatMonto(totalMonto.value),
    '',
  ]
}

function exportarExcel() {
  generarExcel(
    'Transferencias BIND',
    reporteHeaders,
    toRows(props.items),
    'transferencias-bind',
    filaResumen(),
  )
}

function exportarPDF() {
  generarPDF(
    'Reporte de Transferencias BIND',
    reporteHeaders,
    toRows(props.items),
    'transferencias-bind',
    `Mutual Cosecha Salud`,
    filaResumen(),
  )
}
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center ga-2">
      <v-icon icon="mdi-chart-box-outline" />
      Reporte de Transferencias
    </v-card-title>

    <v-card-text>
      <v-alert
        v-if="items.length === 0"
        type="info"
        density="compact"
        class="mb-4"
      >
        No hay transferencias para exportar
      </v-alert>

      <template v-else>
        <div class="d-flex align-center justify-space-between mb-3">
          <div>
            <span class="text-body-2 text-medium-emphasis">
              {{ totalItems }} transferencia(s)
            </span>
            <span class="text-body-2 font-weight-bold ml-4">
              Total completadas: {{ formatMonto(totalMonto) }}
            </span>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              size="small"
              variant="tonal"
              color="success"
              prepend-icon="mdi-microsoft-excel"
              @click="exportarExcel"
            >
              Excel
            </v-btn>
            <v-btn
              size="small"
              variant="tonal"
              color="error"
              prepend-icon="mdi-file-pdf-box"
              @click="exportarPDF"
            >
              PDF
            </v-btn>
          </div>
        </div>

        <v-table density="compact">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Origen</th>
              <th>CUIT</th>
              <th>Descripcion</th>
              <th class="text-end">
                Monto
              </th>
              <th class="text-center">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in items" :key="t.id">
              <td>{{ t.fecha_inicio ? new Date(t.fecha_inicio).toLocaleDateString('es-AR') : '-' }}</td>
              <td>{{ t.origen_nombre || '-' }}</td>
              <td>{{ t.origen_cuit || '-' }}</td>
              <td>{{ t.descripcion || '-' }}</td>
              <td class="text-end font-weight-bold">
                {{ formatMonto(t.monto) }}
              </td>
              <td class="text-center">
                {{ t.estado }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-grey-lighten-3 font-weight-bold">
              <td>Total: {{ totalItems }}</td>
              <td />
              <td />
              <td />
              <td class="text-end">
                {{ formatMonto(totalMonto) }}
              </td>
              <td />
            </tr>
          </tfoot>
        </v-table>
      </template>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="emit('close')">
        Cerrar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
