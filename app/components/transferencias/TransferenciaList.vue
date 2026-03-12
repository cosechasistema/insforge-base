<script setup lang="ts">
import type { Transferencia } from '~/types'

defineProps<{
  items: readonly Transferencia[]
  loading: boolean
}>()

const emit = defineEmits<{
  ver: [id: string]
}>()

const headers = [
  { title: 'Fecha', key: 'fecha_inicio', width: '120px' },
  { title: 'Origen', key: 'origen_nombre' },
  { title: 'CUIT', key: 'origen_cuit', width: '140px' },
  { title: 'Descripcion', key: 'descripcion' },
  { title: 'Monto', key: 'monto', align: 'end' as const, width: '150px' },
  { title: 'Estado', key: 'estado', align: 'center' as const, width: '140px' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const, width: '80px' },
]

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
  })
}

function formatMonto(monto: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(monto)
}
</script>

<template>
  <v-data-table
    :headers
    :items
    :loading
    item-value="id"
    hover
    class="elevation-1 rounded-lg"
    data-testid="transferencias-table"
  >
    <template #item.fecha_inicio="{ item }">
      {{ formatFecha(item.fecha_inicio) }}
    </template>

    <template #item.origen_nombre="{ item }">
      {{ item.origen_nombre || '-' }}
    </template>

    <template #item.origen_cuit="{ item }">
      <span class="text-caption font-weight-medium">{{ item.origen_cuit || '-' }}</span>
    </template>

    <template #item.descripcion="{ item }">
      {{ item.descripcion || '-' }}
    </template>

    <template #item.monto="{ item }">
      <span class="font-weight-bold">{{ formatMonto(item.monto) }}</span>
    </template>

    <template #item.estado="{ item }">
      <v-chip
        :color="estadoColor[item.estado] || 'grey'"
        size="small"
        variant="tonal"
      >
        {{ estadoLabel[item.estado] || item.estado }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-btn
        icon
        size="small"
        variant="text"
        color="info"
        aria-label="Ver detalle"
        data-testid="transferencia-view"
        @click="emit('ver', item.id)"
      >
        <v-icon icon="mdi-eye" />
        <v-tooltip activator="parent" location="top">
          Ver detalle
        </v-tooltip>
      </v-btn>
    </template>

    <template #no-data>
      <div class="text-center pa-4 text-grey">
        No hay transferencias registradas
      </div>
    </template>
  </v-data-table>
</template>
