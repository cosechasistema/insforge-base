---
name: crud-search
description: >
  Patron estandar para paginas CRUD con busqueda client-side.
  Trigger: Al crear/modificar paginas de listado CRUD, nuevo modulo, o agregar busqueda.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Al crear una nueva pagina de listado CRUD
- Al agregar busqueda a un listado existente
- Al crear un nuevo modulo con pagina index

## Patron de Busqueda Obligatorio

Toda pagina de listado CRUD DEBE incluir busqueda client-side con las siguientes piezas:

### 1. Estado reactivo

```ts
const searchQuery = ref('')

const itemsFiltered = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return items.value

  return items.value.filter((item) => {
    return item.nombre.toLowerCase().includes(query)
      // agregar campos adicionales segun la entidad
  })
})
```

- `searchQuery`: ref de string vacio
- `itemsFiltered`: computed que filtra por `nombre` como MINIMO
- Campos adicionales segun la entidad (ej: descripcion, categoria, precio)
- Siempre usar `.toLowerCase()` para busqueda case-insensitive
- Retornar lista completa si query esta vacio

### 2. Layout del header

```vue
<div class="d-flex align-center justify-space-between mb-6 ga-4">
  <div class="d-flex align-center ga-3 flex-shrink-0">
    <v-icon icon="mdi-ICONO" size="40" color="primary" />
    <h1 class="text-h4">
      Titulo
    </h1>
  </div>
  <v-text-field
    v-model="searchQuery"
    prepend-inner-icon="mdi-magnify"
    placeholder="Buscar por nombre..."
    clearable
    hide-details
    density="compact"
    class="flex-grow-1"
    style="max-width: 500px;"
  />
  <v-btn
    color="secondary"
    prepend-icon="mdi-plus"
    class="text-uppercase font-weight-bold flex-shrink-0"
    @click="abrirCrear"
  >
    Nuevo X
  </v-btn>
</div>
```

Reglas del header:
- Container: `d-flex align-center justify-space-between mb-6 ga-4`
- Icono + titulo: envueltos en div con `flex-shrink-0`
- Search field: `flex-grow-1` con `max-width: 500px`
- Boton: con `flex-shrink-0`
- Placeholder descriptivo: "Buscar por nombre, campo2, campo3..."

### 3. Pasar datos filtrados al componente de lista

```vue
<EntidadList
  :items="itemsFiltered"
  @editar="abrirEditar"
  @eliminar="confirmarEliminar"
/>
```

SIEMPRE pasar `itemsFiltered` en vez de la lista original.

## Campos de Filtrado por Entidad

| Entidad | Campos |
|---------|--------|
| Items | nombre, descripcion |

Para nuevas entidades: MINIMO filtrar por `nombre`.

## Archivo de Referencia

Ver implementacion completa en `app/pages/items/index.vue`.
