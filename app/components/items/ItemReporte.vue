<script setup lang="ts">
import type { Item } from '~/types'
import { generarExcel, generarPDF } from '~/utils/reportes'

const props = defineProps<{ items: readonly Item[] }>()
const emit = defineEmits<{ close: [] }>()

const totalItems = computed(() => props.items.length)

const reporteHeaders = ['Nombre', 'Descripcion', 'Fecha Creacion']

function toRows(items: readonly Item[]): string[][] {
  return items.map(item => [
    item.nombre,
    item.descripcion ?? '-',
    new Date(item.created_at).toLocaleDateString('es-AR'),
  ])
}

function filaResumen(): string[] {
  return [
    `Total: ${totalItems.value} item(s)`,
    '',
    '',
  ]
}

function exportarExcel() {
  generarExcel(
    'Items',
    reporteHeaders,
    toRows(props.items),
    'items-reporte',
    filaResumen(),
  )
}

function exportarPDF() {
  generarPDF(
    'Reporte de Items',
    reporteHeaders,
    toRows(props.items),
    'items-reporte',
    undefined,
    filaResumen(),
  )
}
</script>

<template>
  <v-card>
    <v-card-title class="d-flex align-center ga-2">
      <v-icon icon="mdi-chart-box-outline" />
      Reporte de Items
    </v-card-title>

    <v-card-text>
      <v-alert
        v-if="items.length === 0"
        type="info"
        density="compact"
        class="mb-4"
      >
        No hay items para exportar
      </v-alert>

      <template v-else>
        <div class="d-flex align-center justify-space-between mb-3">
          <span class="text-body-2 text-medium-emphasis">
            {{ totalItems }} item(s) disponible(s)
          </span>
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
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Fecha Creacion</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.nombre }}</td>
              <td>{{ item.descripcion || '-' }}</td>
              <td>{{ new Date(item.created_at).toLocaleDateString('es-AR') }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-grey-lighten-3 font-weight-bold">
              <td>Total: {{ totalItems }} item(s)</td>
              <td />
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
