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
| tipo             | VARCHAR(50)  | TRANSFER-CVU, TRANSFERENCIAS_RECIBIDAS     |
| estado           | VARCHAR(20)  | COMPLETED, FAILED, IN_PROGRESS, etc.       |
| monto            | DECIMAL      | Monto de la transferencia                  |
| moneda           | VARCHAR(5)   | ARS                                        |
| descripcion      | TEXT         | Descripcion/concepto                       |
| concepto         | VARCHAR(100) | Codigo concepto (VAR VARIOS, etc.)         |
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

**Workflow principal**: `BIND Sync Transferencias -> InsForge` (ID: `WEBluR9Vf0BtaK5j`, 12 nodos)

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

1. **Cron Diario 10AM ARG**: Schedule Trigger a las 13:00 UTC (10:00 Argentina)
2. **Webhook Sync Manual**: `POST /webhook/bind-sync-transferencias` (responde 200 inmediato)
3. **Ejecutar Manual**: Para testing en n8n UI
4. **Login JWT BIND**: SSH + curl con mTLS para obtener token
5. **Parse Token**: Extrae JWT del response
6. **Obtener Transacciones**: SSH + curl con JWT, transferencias del ultimo dia
7. **Transform Records**: Mapea `counterparty`, `details` al schema PostgreSQL
8. **Upsert Postgres**: `INSERT ... ON CONFLICT (bind_id) DO UPDATE` directo
9. **Aggregate Results**: Cuenta registros, nuevos, errores
10. **Write Sync Log**: Registra en `bind_sync_log`
11. **Check Errors**: Solo pasa datos si `errores > 0` o `estado = ERROR`
12. **Alerta Email**: Envia a `cosechasistema@gmail.com` via SMTP brevo

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

## UI de monitoreo

### Pagina `/sync-logs`

- Card con ultima sincronizacion (fecha, estado, registros, errores)
- Boton "Sincronizar ahora" (1 click por sesion, llama al webhook)
- Tabla historial de sync logs con estado, conteos, duracion
- Info de configuracion del cron

### Pagina `/transferencias`

- Cards resumen: total, completadas, fallidas/en progreso, monto total
- Tabla con busqueda por nombre, CUIT, descripcion
- Detalle individual con origen, fechas, JSON raw
- Reporte exportable PDF/Excel

## Fase 5: Conciliacion (IMPLEMENTADO)

### Objetivo

Cruzar transferencias BIND (PostgreSQL) con registros MySQL `control_transferencia`
para semi-automatizar la verificacion manual diaria.

### Tabla PostgreSQL: `control_transferencia_sync`

| Campo                     | Tipo         | Origen MySQL                         |
| ------------------------- | ------------ | ------------------------------------ |
| idcontrol_transferencia   | INTEGER PK   | PK original de MySQL                 |
| monto                     | DECIMAL      | monto                                |
| fecha                     | DATE         | fecha_aviso_socio (VARCHAR→DATE)     |
| socio_nombre              | TEXT         | socio_nombre (directo)               |
| socio_nro                 | TEXT         | socio_nro                            |
| socio_dni                 | VARCHAR      | socio_dni                            |
| banco_origen              | VARCHAR      | banco_origen (nombre completo)       |
| concepto                  | TEXT         | concepto                             |
| nombre_parseado           | VARCHAR      | socio_nombre o parseo de concepto    |
| nro_transferencia         | VARCHAR      | nro_transferencia                    |
| verificado                | VARCHAR      | verificado (si/no)                   |
| verificado_date_sql       | DATE         | verificado_date_sql                  |
| asentado                  | VARCHAR      | asentado                             |
| estado                    | VARCHAR      | estado                               |
| bind_match_id             | UUID FK      | Referencia a bind_transferencias.id  |
| match_score               | INTEGER      | Score del matching (0-110)           |
| match_reason              | TEXT         | Razones del match                    |
| synced_at                 | TIMESTAMPTZ  | Fecha de sincronizacion              |

### n8n Workflow: MySQL Sync

- **ID**: `tpcXvF0jU4JSyAYw` (12 nodos, ACTIVO)
- **Cron**: Diario 10AM ARG (13:00 UTC)
- **Webhook**: `POST /webhook/mysql-sync-control-transferencia`
- **Filtro**: Ultimos 2 meses via `fecha_aviso_socio` (VARCHAR, string-comparable)
- **Batch**: 500 registros por ejecucion, incremental por `idcontrol_transferencia`

### Estrategia de matching (scoring)

```
+50  monto exacto (gate obligatorio — sin esto no hay candidatos)
+35  fecha mismo dia / +25 ±1 dia / +15 ±2 dias
+15  banco coincide (CBU 3 digitos → banco vs banco_origen MySQL)
+10  nombre similar >70% (origen_nombre BIND vs socio_nombre MySQL)

>=75 → MATCH SUGERIDO (verde, alta confianza)
50-74 → POSIBLE MATCH (amarillo, revisar)
<50  → SIN MATCH (gris)
```

### CBU/CVU → Banco

Mapeo de 35+ bancos argentinos y 5 fintechs (Mercado Pago, Uala, Personal Pay, Naranja X, Prex).
Archivo: `app/utils/cbu-bancos.ts`

### Flujo implementado

```
MySQL (control_transferencia) --n8n workflow--> PostgreSQL (control_transferencia_sync)
                                                        |
                                                  calcularMatches()
                                                        |
PostgreSQL (bind_transferencias) --------------------->  |
                                                        v
                                              /conciliacion (Nuxt UI)
                                              - 5 stats cards (pendientes, sugeridos, etc.)
                                              - Filtros por categoria
                                              - Tabla con score + razones
                                              - Dialog detalle lado a lado
                                              - Boton "Verificar Match"
```

### Archivos del feature

```
app/utils/cbu-bancos.ts              → Mapeo CBU/CVU → banco
app/utils/matching.ts                → Motor de scoring (6 funciones)
app/composables/useControlTransferencias.ts → CRUD control_transferencia_sync
app/composables/useConciliacion.ts   → Orquestador de matching
app/pages/conciliacion/index.vue     → UI completa (505 lineas)
app/types/index.ts                   → ControlTransferencia, ConciliacionMatch, ConciliacionStats
```

### Estado actual

- 1426 registros sincronizados (Ene 13 - Mar 13, 2026)
- 27 registros sin verificar disponibles para conciliacion
- Sync diario automatico + webhook manual operativo
