<script setup lang="ts">
import type { Item, ItemCreate } from '~/types'

const { item } = defineProps<{
  item?: Item
}>()

const emit = defineEmits<{
  submit: [data: ItemCreate]
  cancel: []
}>()

const form = reactive<ItemCreate>({
  nombre: item?.nombre ?? '',
  descripcion: item?.descripcion ?? '',
})

const isEditing = computed(() => !!item)
const formRef = useTemplateRef<{ validate: () => Promise<{ valid: boolean }> }>('form')

async function handleSubmit() {
  const { valid } = await formRef.value!.validate()
  if (!valid) return

  emit('submit', {
    nombre: form.nombre,
    descripcion: form.descripcion || undefined,
  })
}
</script>

<template>
  <v-card class="pa-6" data-testid="item-form">
    <v-card-title class="text-h5 mb-4">
      {{ isEditing ? 'Editar Item' : 'Nuevo Item' }}
    </v-card-title>

    <v-form ref="form" @submit.prevent="handleSubmit">
      <v-text-field
        v-model="form.nombre"
        label="Nombre del item"
        prepend-inner-icon="mdi-text"
        :rules="[v => !!v || 'El nombre es obligatorio']"
        class="mb-2"
        data-testid="item-form-nombre"
      />

      <v-textarea
        v-model="form.descripcion"
        label="Descripcion (opcional)"
        prepend-inner-icon="mdi-text-long"
        rows="3"
        variant="outlined"
        class="mb-4"
        data-testid="item-form-descripcion"
      />

      <div class="d-flex ga-2">
        <v-btn
          type="submit"
          color="secondary"
          size="large"
          class="text-uppercase font-weight-bold"
          data-testid="item-form-submit"
        >
          {{ isEditing ? 'Guardar cambios' : 'Crear item' }}
        </v-btn>
        <v-btn
          variant="text"
          size="large"
          data-testid="item-form-cancel"
          @click="emit('cancel')"
        >
          Cancelar
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>
