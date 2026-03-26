<script setup lang="ts">
import type { Item, ItemCreate } from '~/types'

definePageMeta({
  middleware: ['auth'],
})

const { isAdmin } = useAuth()
const { items, loading, listar, crear, actualizar, eliminar } = useItems()

const showForm = ref(false)
const editingItem = ref<Item | undefined>()
const showDeleteDialog = ref(false)
const deletingId = ref('')
const showReporte = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })
const searchQuery = ref('')

const itemsFiltered = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return items.value

  return items.value.filter((item) => {
    return item.nombre.toLowerCase().includes(query)
      || (item.descripcion && item.descripcion.toLowerCase().includes(query))
  })
})

onMounted(listar)

function abrirCrear() {
  editingItem.value = undefined
  showForm.value = true
}

function abrirEditar(item: Item) {
  editingItem.value = item
  showForm.value = true
}

async function handleSubmit(data: ItemCreate) {
  if (editingItem.value) {
    const { error } = await actualizar(editingItem.value.id, data)
    if (error) {
      snackbar.value = { show: true, text: 'Error al actualizar el item', color: 'error' }
      return
    }
    snackbar.value = { show: true, text: 'Item actualizado correctamente', color: 'success' }
  }
  else {
    const { error } = await crear(data)
    if (error) {
      snackbar.value = { show: true, text: 'Error al crear el item', color: 'error' }
      return
    }
    snackbar.value = { show: true, text: 'Item creado correctamente', color: 'success' }
  }
  showForm.value = false
}

function confirmarEliminar(id: string) {
  deletingId.value = id
  showDeleteDialog.value = true
}

async function handleEliminar() {
  const { error } = await eliminar(deletingId.value)
  showDeleteDialog.value = false

  if (error) {
    snackbar.value = { show: true, text: 'Error al eliminar el item', color: 'error' }
    return
  }
  snackbar.value = { show: true, text: 'Item eliminado correctamente', color: 'success' }
}

function verDetalle(id: string) {
  navigateTo(`/items/${id}`)
}
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6 ga-4">
      <div class="d-flex align-center ga-3 flex-shrink-0">
        <v-icon icon="mdi-package-variant-closed" size="40" color="primary" />
        <h1 class="text-headline-large">
          Items
        </h1>
      </div>
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        placeholder="Buscar por nombre o descripcion..."
        clearable
        hide-details
        density="compact"
        class="flex-grow-1"
        style="max-width: 500px;"
        aria-label="Buscar items"
        data-testid="items-search"
      />
      <div class="d-flex ga-2 flex-shrink-0">
        <v-btn
          color="info"
          variant="tonal"
          prepend-icon="mdi-chart-box-outline"
          data-testid="items-report-btn"
          @click="showReporte = true"
        >
          Reporte
        </v-btn>
        <v-btn
          v-if="isAdmin"
          color="secondary"
          prepend-icon="mdi-plus"
          class="text-uppercase font-weight-bold"
          data-testid="items-new-btn"
          @click="abrirCrear"
        >
          Nuevo Item
        </v-btn>
      </div>
    </div>

    <v-dialog v-model="showForm" max-width="600" persistent>
      <ItemsItemForm
        :item="editingItem"
        @submit="handleSubmit"
        @cancel="showForm = false"
      />
    </v-dialog>

    <v-dialog v-model="showReporte" max-width="800">
      <ItemsItemReporte
        :items="itemsFiltered"
        @close="showReporte = false"
      />
    </v-dialog>

    <v-skeleton-loader
      v-if="loading"
      type="table-heading, table-row-divider@5, table-row"
      class="mb-4 elevation-1 rounded-lg"
    />

    <ItemsItemList
      v-else
      :items="itemsFiltered"
      :loading="loading"
      @ver="verDetalle"
      @eliminar="confirmarEliminar"
    />

    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="pa-4">
        <v-card-title>Confirmar eliminacion</v-card-title>
        <v-card-text>
          Estas seguro de que queres eliminar este item? Esta accion no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="error" variant="tonal" @click="handleEliminar">
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="5000"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>
