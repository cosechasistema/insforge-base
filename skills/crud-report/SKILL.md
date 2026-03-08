---
name: crud-report
description: >
  Patron estandar para reportes con filtros, preview y exportacion PDF/Excel.
  Trigger: Al crear reportes, exportar datos, agregar boton de reportes a un modulo CRUD.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Al agregar reportes a un modulo CRUD existente
- Al crear exportacion PDF o Excel de una entidad
- Al agregar filtros de consulta con preview de datos

---

## Arquitectura

```
app/
├── utils/reportes.ts                    # Funciones compartidas (NO tocar)
├── components/{entidad}/
│   └── {Entidad}Reporte.vue             # Componente de reporte
├── composables/use{Entidad}.ts          # Agregar funcion de consulta
├── pages/{entidad}/index.vue            # Integrar boton + dialog
test/e2e/
└── {entidad}-reporte.spec.ts            # Tests E2E
```

---

## Critical Patterns

### 1. Utilidades compartidas (ya existen)

`utils/reportes.ts` exporta `generarExcel()` y `generarPDF()`. NUNCA duplicar esta logica. Usar directamente:

```ts
import { generarExcel, generarPDF } from '~/utils/reportes'
```

Firmas:

```ts
generarExcel(titulo, headers, rows, nombreArchivo, resumen?)
generarPDF(titulo, headers, rows, nombreArchivo, subtitulo?, resumen?)
```

- `headers`: `string[]` — nombres de columnas
- `rows`: `string[][]` — cada fila es array de strings
- `resumen`: `string[]` — fila final con totales/promedios (opcional)
- `subtitulo`: texto bajo el titulo del PDF (ej: "Periodo: 2026-01 al 2026-03")

### 2. Componente de reporte

Estructura obligatoria del `{Entidad}Reporte.vue`:

```vue
<script setup lang="ts">
import type { MiEntidad } from '~/types'
import { generarExcel, generarPDF } from '~/utils/reportes'

// Props si el filtro necesita datos externos
const props = defineProps<{ /* datos para filtros */ }>()
const emit = defineEmits<{ close: [] }>()

// Estado del reporte
const loading = ref(false)
const resultados = ref<MiEntidad[]>([])
const consultado = ref(false)

// Funcion de consulta usando el composable
const { miFuncionConsulta } = useMiEntidad()

async function consultar() {
  loading.value = true
  consultado.value = false
  try {
    const { data, error } = await miFuncionConsulta(/* filtros */)
    if (!error) {
      resultados.value = data
    }
    consultado.value = true
  }
  finally {
    loading.value = false
  }
}

// Mapeo a filas de string para exportacion
const headers = ['Col1', 'Col2', 'Col3']

function toRows(items: MiEntidad[]): string[][] {
  return items.map(item => [
    item.campo1,
    item.campo2,
    String(item.campo3),
  ])
}

function exportarExcel() {
  generarExcel('Titulo', headers, toRows(resultados.value), 'nombre-archivo')
}

function exportarPDF() {
  generarPDF('Titulo', headers, toRows(resultados.value), 'nombre-archivo', 'Subtitulo')
}
</script>
```

### 3. Template del componente reporte

```vue
<template>
  <v-card>
    <v-card-title class="d-flex align-center ga-2">
      <v-icon icon="mdi-chart-box-outline" />
      Reporte de {Entidad}
    </v-card-title>

    <v-card-text>
      <!-- ZONA DE FILTROS -->
      <div class="d-flex ga-4 mb-4 align-center">
        <!-- Filtros especificos de la entidad -->
        <v-btn
          color="primary"
          :loading="loading"
          :disabled="!formValido"
          @click="consultar"
        >
          Consultar
        </v-btn>
      </div>

      <!-- ALERTA DE VALIDACION (si aplica) -->

      <template v-if="consultado">
        <!-- SIN RESULTADOS -->
        <v-alert
          v-if="resultados.length === 0"
          type="info"
          density="compact"
          class="mb-4"
        >
          No se encontraron {entidad} para el filtro seleccionado
        </v-alert>

        <!-- CON RESULTADOS -->
        <template v-else>
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-body-2 text-medium-emphasis">
              {{ resultados.length }} {entidad}(s) encontrado(s)
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
            <!-- thead + tbody con los datos -->
            <!-- tfoot opcional para resumen/totales -->
          </v-table>
        </template>
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
```

### 4. Integracion en la pagina index

Agregar al `pages/{entidad}/index.vue`:

```ts
const showReporte = ref(false)
```

Reemplazar el boton suelto por un div con dos botones:

```vue
<div class="d-flex ga-2 flex-shrink-0">
  <v-btn
    color="primary"
    variant="tonal"
    prepend-icon="mdi-chart-box-outline"
    class="text-uppercase font-weight-bold"
    @click="showReporte = true"
  >
    Reportes
  </v-btn>
  <v-btn
    color="secondary"
    prepend-icon="mdi-plus"
    class="text-uppercase font-weight-bold"
    @click="abrirCrear"
  >
    Nuevo {Entidad}
  </v-btn>
</div>
```

Dialog del reporte (despues del dialog del form):

```vue
<v-dialog v-model="showReporte" max-width="700">
  <{Entidad}Reporte :props-necesarios="valor" @close="showReporte = false" />
</v-dialog>
```

### 5. Funcion de consulta en composable

Agregar en `composables/use{Entidad}.ts` una funcion de consulta para el reporte:

```ts
async function listarPorFiltro(/* params */) {
  const { data, error } = await insforge.database
    .from('tabla')
    .select('*, relacion(*)')
    .order('campo', { ascending: false })

  return { data: (data as MiEntidad[] | null) ?? [], error }
}
```

Retornar la funcion en el objeto del composable.

---

## Decision Tree: Tipo de Filtro

```
Entidad tiene fechas?           → Rango de fechas (v-text-field type="date")
Entidad tiene FK/relacion?      → Autocomplete del padre (v-autocomplete)
Entidad tiene categoria/tipo?   → Select de opciones (v-select)
Sin filtro natural?              → Consultar todos (boton directo)
Multiples filtros?               → Combinar en el mismo div con ga-4
```

---

## Decision Tree: Resumen/Totales

```
Entidad tiene campo numerico (precio, stock)?  → Agregar tfoot con suma/promedio
Entidad tiene conteo relevante?                → Agregar total en tfoot
Entidad es solo texto/fechas?                  → Sin tfoot, solo conteo en header
```

---

## Tests E2E Obligatorios

Cada reporte DEBE tener estos tests minimos:

```ts
test.describe('{Entidad} Reporte', () => {
  test.setTimeout(60_000)

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await navigateClientSide(page, '/{entidad}')
  })

  // 1. Boton abre dialog
  test('boton Reportes abre dialog', async ({ page }) => {
    await page.getByRole('button', { name: 'Reportes' }).click()
    await expect(page.getByText('Reporte de {Entidad}')).toBeVisible()
  })

  // 2. Consulta muestra resultados
  test('consulta muestra resultados en preview', async ({ page }) => {
    // Abrir, llenar filtros, consultar
    await expect(page.getByText('{entidad}(s) encontrado(s)')).toBeVisible({ timeout: 10_000 })
  })

  // 3. Sin resultados muestra mensaje
  test('sin resultados muestra mensaje informativo', async ({ page }) => {
    // Filtro que no devuelva datos
    await expect(page.getByText('No se encontraron')).toBeVisible({ timeout: 10_000 })
  })

  // 4. Exportar Excel
  test('exportar Excel descarga archivo', async ({ page }) => {
    // Consultar primero, luego:
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Excel' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.xlsx')
  })

  // 5. Exportar PDF
  test('exportar PDF descarga archivo', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'PDF' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.pdf')
  })

  // 6. Cerrar dialog
  test('cerrar dialog cierra el reporte', async ({ page }) => {
    await page.getByRole('button', { name: 'Reportes' }).click()
    await page.getByRole('button', { name: 'Cerrar' }).click()
    await expect(page.getByText('Reporte de {Entidad}')).not.toBeVisible()
  })
})
```

### Reglas de selectores en tests

- Autocomplete: usar `getByRole('combobox')` + `fill('valor')` + `getByRole('listbox').getByRole('option')`
- NUNCA usar `.v-list-item` generico (colisiona con el navigation drawer)
- Scopear al dialog con `page.getByRole('dialog')` cuando haya ambiguedad

---

## Archivos de Referencia

| Tipo | Archivo |
|------|---------|
| Utilidades | `app/utils/reportes.ts` |
| Reporte ejemplo | `app/components/items/ItemReporte.vue` |
| Composable ejemplo | `app/composables/useItems.ts` |
| Pagina con reporte | `app/pages/items/index.vue` |
