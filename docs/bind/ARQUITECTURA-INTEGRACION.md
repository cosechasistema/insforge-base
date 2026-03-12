# Arquitectura de Integracion — BIND Mutual

## Diagrama de flujo

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Nuxt 4 + UI  │────▶│  InsForge DB    │◀────│  n8n Workflow   │
│   (Frontend)    │     │  (PostgreSQL)   │     │  (Orquestador)  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │ SSH
                                                         ▼
                                                ┌─────────────────┐
                                                │  Servidor SSH   │
                                                │  (Certificados) │
                                                │  143.244.181.216│
                                                └────────┬────────┘
                                                         │ mTLS + JWT
                                                         ▼
                                                ┌─────────────────┐
                                                │  API BIND       │
                                                │  api.bind.com.ar│
                                                └─────────────────┘
```

## Componentes

### 1. Nuxt 4 (Frontend)

**Responsabilidad**: Mostrar datos al usuario.

- Consulta datos de InsForge DB (nunca de BIND directo)
- Paginas: listado de transferencias, detalle, reportes
- Filtros locales: fecha, estado, monto
- Indicador de ultima sincronizacion
- Boton para forzar sync (llama a webhook n8n)

**Patron**:

```
composables/useTransferencias.ts  → CRUD lectura contra InsForge
pages/transferencias/index.vue    → Listado con v-data-table
pages/transferencias/[id].vue     → Detalle
components/transferencias/        → TransferenciaList, TransferenciaDetalle, TransferenciaReporte
```

### 2. InsForge DB (Persistencia)

**Responsabilidad**: Almacenar datos sincronizados de BIND.

**Tablas propuestas**:

#### `bind_transferencias`

| Campo            | Tipo         | Descripcion                                |
| ---------------- | ------------ | ------------------------------------------ |
| id               | UUID         | PK (auto, InsForge)                        |
| bind_id          | VARCHAR(50)  | ID de transferencia en BIND (unique)       |
| tipo             | VARCHAR(20)  | TRANSFER-CVU                               |
| estado           | VARCHAR(20)  | COMPLETED, FAILED, IN_PROGRESS, etc.       |
| monto            | DECIMAL      | Monto de la transferencia                  |
| moneda           | VARCHAR(5)   | ARS                                        |
| descripcion      | TEXT         | Descripcion/concepto                       |
| concepto         | VARCHAR(10)  | Codigo concepto (VAR, etc.)                |
| origen_nombre    | VARCHAR(255) | Nombre del originante                      |
| origen_cbu       | VARCHAR(30)  | CBU/CVU del originante                     |
| origen_cuit      | VARCHAR(15)  | CUIT del originante                        |
| destino_cuenta   | VARCHAR(30)  | Cuenta destino (nuestra)                   |
| fecha_inicio     | TIMESTAMPTZ  | start_date de BIND                         |
| fecha_fin        | TIMESTAMPTZ  | end_date de BIND                           |
| fecha_negocio    | DATE         | business_date de BIND                      |
| datos_raw        | JSONB        | Response original completo de BIND         |
| created_at       | TIMESTAMPTZ  | Cuando se guardo en InsForge               |
| updated_at       | TIMESTAMPTZ  | Ultima actualizacion                       |

#### `bind_sync_log`

| Campo          | Tipo         | Descripcion                              |
| -------------- | ------------ | ---------------------------------------- |
| id             | UUID         | PK (auto)                                |
| tipo_sync      | VARCHAR(30)  | TRANSFERENCIAS, CUENTAS, etc.            |
| estado         | VARCHAR(20)  | OK, ERROR, PARCIAL                       |
| registros      | INTEGER      | Cantidad de registros procesados         |
| nuevos         | INTEGER      | Registros nuevos insertados              |
| actualizados   | INTEGER      | Registros actualizados                   |
| errores        | INTEGER      | Cantidad de errores                      |
| detalle_error  | TEXT         | Mensaje de error si aplica               |
| fecha_desde    | TIMESTAMPTZ  | Rango consultado: desde                  |
| fecha_hasta    | TIMESTAMPTZ  | Rango consultado: hasta                  |
| duracion_ms    | INTEGER      | Duracion de la sincronizacion en ms      |
| created_at     | TIMESTAMPTZ  | Timestamp del sync                       |

### 3. n8n (Orquestador)

**Responsabilidad**: Obtener datos de BIND y guardarlos en InsForge.

**Workflow principal**: `BIND Sync Transferencias`

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Trigger  │──▶│ SSH Login│──▶│ SSH List │──▶│ Parse +  │──▶│ Upsert   │
│ (Cron/   │   │ JWT      │   │ Transfer.│   │ Transform│   │ InsForge │
│  Webhook)│   │          │   │          │   │          │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                                  │
                                                                  ▼
                                                            ┌──────────┐
                                                            │ Log Sync │
                                                            │ Result   │
                                                            └──────────┘
```

**Nodos del workflow**:

1. **Trigger**: Cron (cada X horas) o Webhook (boton manual desde UI)
2. **SSH Login JWT**: Ejecuta curl con mTLS para obtener token
3. **SSH List Transfers**: Ejecuta curl con JWT para listar transferencias
4. **Parse + Transform**: Mapea campos de BIND al schema de InsForge
5. **Upsert InsForge**: Inserta o actualiza en `bind_transferencias` (key: `bind_id`)
6. **Log Sync Result**: Registra en `bind_sync_log`

### 4. Servidor SSH (Puente mTLS)

**Responsabilidad**: Almacenar certificados y ejecutar requests a BIND.

- IP: `143.244.181.216`
- Puerto: `22`
- Certificados en `/root/`
- n8n se conecta via SSH Password credential

## Flujo de sincronizacion detallado

```
1. n8n dispara (cron o webhook)
2. n8n → SSH → curl POST /login/jwt (con cert+key) → obtiene token
3. n8n → SSH → curl GET .../TRANSFER-CVU (con token + filtros) → obtiene pagina 1
4. Si hay mas paginas → repite con obp_offset incrementado
5. Por cada transferencia:
   a. Busca en bind_transferencias por bind_id
   b. Si no existe → INSERT
   c. Si existe y cambio estado → UPDATE
   d. Si existe y no cambio → SKIP
6. Registra resultado en bind_sync_log
7. Si hay error → registra error, no detiene el flujo
```

## Consideraciones de seguridad

1. **Credenciales BIND nunca salen del servidor SSH**. El frontend no conoce la API.
2. **InsForge RLS** protege las tablas. Solo usuarios autenticados pueden leer.
3. **n8n como unico escritor**: Las tablas `bind_*` son read-only desde Nuxt.
4. **Datos sensibles en `datos_raw`**: Evaluar si guardar o sanitizar el JSON completo.
5. **Logs de auditoria**: Cada sync queda registrado en `bind_sync_log`.
