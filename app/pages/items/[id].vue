<script setup lang="ts">
import type { Item, ItemCreate } from '~/types'

definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()
const { isAdmin } = useAuth()
const { obtener, actualizar, eliminar } = useItems()

const itemId = route.params.id as string
const isNew = itemId === 'new'

const item = ref<Item | null>(null)
const loadingPage = ref(!isNew)
const showDeleteDialog = ref(false)
const snackbar = ref({ show: false, text: '', color: 'success' })

async function cargarDatos() {
  if (isNew) return

  loadingPage.value = true
  const { data } = await obtener(itemId)
  item.value = data
  loadingPage.value = false
}

async function handleSubmit(data: ItemCreate) {
  if (isNew) {
    const { crear } = useItems()
    const { error } = await crear(data)
    if (error) {
      snackbar.value = { show: true, text: 'Error al crear el item', color: 'error' }
      return
    }
    snackbar.value = { show: true, text: 'Item creado correctamente', color: 'success' }
    navigateTo('/items')
  }
  else {
    const { error } = await actualizar(itemId, data)
    if (error) {
      snackbar.value = { show: true, text: 'Error al actualizar el item', color: 'error' }
      return
    }
    snackbar.value = { show: true, text: 'Item actualizado correctamente', color: 'success' }
    await cargarDatos()
  }
}

async function handleEliminar() {
  const { error } = await eliminar(itemId)
  showDeleteDialog.value = false

  if (error) {
    snackbar.value = { show: true, text: 'Error al eliminar el item', color: 'error' }
    return
  }
  snackbar.value = { show: true, text: 'Item eliminado correctamente', color: 'success' }
  navigateTo('/items')
}

onMounted(cargarDatos)
</script>

<template>
  <div>
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      to="/items"
      class="mb-4"
    >
      Volver a items
    </v-btn>

    <v-progress-linear v-if="loadingPage" indeterminate color="secondary" />

    <template v-else-if="isNew || item">
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4" data-testid="item-detail-title">
          {{ isNew ? 'Nuevo Item' : item!.nombre }}
        </h1>
        <v-btn
          v-if="!isNew && isAdmin"
          color="error"
          variant="tonal"
          prepend-icon="mdi-delete"
          data-testid="item-detail-delete"
          @click="showDeleteDialog = true"
        >
          Eliminar
        </v-btn>
      </div>

      <ItemsItemForm
        :item="isNew ? undefined : item!"
        @submit="handleSubmit"
        @cancel="navigateTo('/items')"
      />
    </template>

    <v-alert v-else type="error" variant="tonal">
      Item no encontrado.
    </v-alert>

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
