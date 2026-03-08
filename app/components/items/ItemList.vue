<script setup lang="ts">
import type { Item } from '~/types'

defineProps<{
  items: readonly Item[]
  loading: boolean
}>()

const emit = defineEmits<{
  ver: [id: string]
  eliminar: [id: string]
}>()

const headers = [
  { title: 'Nombre', key: 'nombre' },
  { title: 'Descripcion', key: 'descripcion' },
  { title: 'Fecha creacion', key: 'created_at' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const },
]

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
    data-testid="items-table"
  >
    <template #item.descripcion="{ item }">
      {{ item.descripcion || '-' }}
    </template>

    <template #item.created_at="{ item }">
      {{ formatFecha(item.created_at) }}
    </template>

    <template #item.actions="{ item }">
      <v-btn
        icon
        size="small"
        variant="text"
        color="info"
        aria-label="Ver detalle"
        data-testid="item-view"
        @click="emit('ver', item.id)"
      >
        <v-icon icon="mdi-eye" />
        <v-tooltip activator="parent" location="top">
          Ver detalle
        </v-tooltip>
      </v-btn>

      <v-btn
        icon
        size="small"
        variant="text"
        color="error"
        aria-label="Eliminar"
        data-testid="item-delete"
        @click="emit('eliminar', item.id)"
      >
        <v-icon icon="mdi-delete" />
        <v-tooltip activator="parent" location="top">
          Eliminar
        </v-tooltip>
      </v-btn>
    </template>

    <template #no-data>
      <div class="text-center pa-4 text-grey">
        No hay items registrados
      </div>
    </template>
  </v-data-table>
</template>
