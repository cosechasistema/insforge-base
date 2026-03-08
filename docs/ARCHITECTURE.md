# Arquitectura: InsForge Base Template

## 1. Vista General

```
+------------------+     HTTPS      +---------------------------+
|                  | <------------> |                           |
|   Nuxt 4 SPA    |                |   InsForge BaaS           |
|   (Vuetify 3)   |                |   +-----------+           |
|                  |  SDK calls     |   | PostgreSQL|           |
|  app/            | ------------> |   +-----------+           |
|  ├── pages/      |                |   | Auth      |           |
|  ├── composables/|                |   +-----------+           |
|  ├── components/ |                |   | Functions |           |
|  ├── utils/      |                |   +-----------+           |
|  └── plugins/    |                |   | Storage   |           |
|                  |                +---------------------------+
+------------------+
```

## 2. Stack Tecnologico

| Capa | Tecnologia | Version | Proposito |
|------|-----------|---------|-----------|
| Framework | Nuxt | 4.x | SSR/SPA, routing, auto-imports |
| UI Library | Vuetify | 3.x | Componentes Material Design |
| PWA | @vite-pwa/nuxt | latest | Installable PWA con cache offline |
| Backend | InsForge | latest | PostgreSQL, Auth, Functions, Storage |
| SDK | @insforge/sdk | latest | Client para InsForge |
| PDF | jsPDF + autoTable | 4.x / 5.x | Generacion de reportes PDF |
| Excel | xlsx (SheetJS) | 0.18.x | Generacion de reportes Excel |
| E2E Testing | Playwright | 1.58.x | Tests end-to-end con Chromium |
| Unit Testing | Vitest | latest | Unit + component tests |
| Test Utils | @nuxt/test-utils | latest | Testing Nuxt-specific |
| Language | TypeScript | 5.x | Type safety |

## 3. Modelo de Datos

### 3.1 Diagrama ER

```
+------------------+       +------------------+
| InsForge Auth    |       |   user_roles     |
| (users)          |       +------------------+
+------------------+       | user_id (PK)    |
| id               |<------| role (admin/user)|
| email            |       +------------------+
| profile.name     |
+------------------+
                           +------------------+
                           |     items        |
                           +------------------+
                           | id (PK, UUID)   |
                           | nombre           |
                           | descripcion      |
                           | created_at       |
                           | updated_at       |
                           +------------------+
```

> Agregar nuevas entidades a este diagrama a medida que se crean modulos.

### 3.2 Tablas

#### `user_roles`
| Columna | Tipo | Constraints | Descripcion |
|---------|------|-------------|-------------|
| user_id | VARCHAR(255) | PK | ID del usuario (InsForge Auth) |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'user', CHECK IN ('admin','user') | Rol del usuario |

#### `items` (ejemplo)
| Columna | Tipo | Constraints | Descripcion |
|---------|------|-------------|-------------|
| id | UUID | PK, gen_random_uuid() | Identificador unico |
| nombre | VARCHAR(255) | NOT NULL | Nombre del item |
| descripcion | TEXT | nullable | Descripcion del item |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creacion |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de actualizacion |

> Al agregar un nuevo modulo, documentar la tabla aqui con el mismo formato.

## 4. Estructura del Proyecto

```
insforge-base/
├── app/
│   ├── app.vue
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppSidebar.vue
│   │   │   ├── AppToolbar.vue
│   │   │   └── OfflineBanner.vue
│   │   └── items/
│   │       ├── ItemList.vue
│   │       ├── ItemForm.vue
│   │       └── ItemReporte.vue
│   ├── composables/
│   │   ├── useInsforge.ts
│   │   ├── useAuth.ts
│   │   └── useItems.ts
│   ├── utils/
│   │   ├── config.ts
│   │   ├── reportes.ts
│   │   └── unidades.ts
│   ├── layouts/
│   │   ├── default.vue
│   │   └── auth.vue
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── admin.ts
│   ├── pages/
│   │   ├── index.vue
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── verify-email.vue
│   │   └── items/
│   │       ├── index.vue
│   │       └── [id].vue
│   ├── plugins/
│   │   └── insforge.ts
│   └── types/
│       └── index.ts
├── test/
│   ├── e2e/
│   └── unit/
├── skills/
│   ├── changelog/SKILL.md
│   ├── crud-search/SKILL.md
│   └── crud-report/SKILL.md
├── docs/
│   ├── ARCHITECTURE.md
│   └── API-CONTRACTS.md
├── nuxt.config.ts
├── CHANGELOG.md
└── CLAUDE.md
```

## 5. Flujos Principales

### 5.1 Registro y Login

```
Usuario                     App                         InsForge
  |                          |                              |
  |-- Completa form -------->|                              |
  |                          |-- auth.signUp() ------------>|
  |                          |<-- { requireEmailVerification }|
  |                          |-- redirect /verify-email      |
  |-- Ingresa codigo ------->|                              |
  |                          |-- auth.verifyEmail() ------->|
  |                          |<-- { accessToken, user }     |
  |                          |-- redirect /items            |
  |<-- Dashboard items ------|                              |
```

### 5.2 CRUD de Items (ejemplo)

```
Usuario                     App                         InsForge
  |                          |                              |
  |-- Click Nuevo Item ----->|                              |
  |-- Completa form -------->|                              |
  |                          |-- insert items ------------->|
  |                          |<-- { data, error }           |
  |<-- Lista actualizada ----|                              |
```

### 5.3 Generar Reporte

```
Usuario                     App                         InsForge
  |                          |                              |
  |-- Click Reportes ------->|                              |
  |-- Configura filtros ---->|                              |
  |-- Click Consultar ------>|                              |
  |                          |-- select con filtros ------->|
  |                          |<-- { data[] }                |
  |<-- Preview en tabla -----|                              |
  |-- Click Excel/PDF ------>|                              |
  |                          |-- generarExcel/PDF (local)   |
  |<-- Descarga archivo -----|                              |
```

### 5.4 Control de Acceso

```
Ruta                        Middleware       Accion si falla
/login                      ninguno         -
/register                   ninguno         -
/verify-email               ninguno         -
/                           auth            -> /login
/items                      auth            -> /login
/items/[id]                 auth            -> /login
```

> Agregar nuevas rutas a esta tabla al crear modulos.

## 6. InsForge Setup

Para un proyecto nuevo basado en este template:

1. Crear proyecto en InsForge Dashboard
2. Obtener URL base y Anon Key
3. Crear tablas en la seccion Database:
   - `user_roles` (ver schema en seccion 3.2)
   - `items` (ver schema en seccion 3.2)
4. Configurar `.env`:
   ```
   NUXT_PUBLIC_INSFORGE_URL=https://YOUR-PROJECT.us-east.insforge.app
   NUXT_PUBLIC_INSFORGE_KEY=ik_YOUR_ANON_KEY
   ```
5. Configurar `.mcp.json` con el project ID correspondiente

## 7. Decisiones Tecnicas

| Decision | Razon |
|----------|-------|
| Nuxt 4 SPA mode | No necesitamos SSR para una herramienta interna |
| Vuetify 3 | Componentes Material Design completos, v-data-table, forms |
| InsForge SDK vanilla | No hay wrapper oficial para Vue, creamos composables |
| user_roles tabla separada | InsForge Auth no tiene custom claims, extendemos con tabla |
| PWA con cache offline | Mejora experiencia en conexiones inestables |
| jsPDF + xlsx client-side | Generacion de reportes sin servidor adicional |

## 8. Testing Strategy

| Tipo | Herramienta | Ubicacion | Proposito |
|------|-------------|-----------|-----------|
| Unit | Vitest | `test/unit/` | Logica de composables y utils |
| E2E | Playwright | `test/e2e/` | Flujos completos de usuario |

### Convenciones de tests

- E2E: siempre usar search post-create para evitar flaky por paginacion del v-data-table
- Selectores: preferir `getByRole()` y `getByText()` sobre CSS selectors
- Timeouts: 60s por test E2E, 10s para esperas de elementos

## 9. Deployment

| Metodo | Comando | Output |
|--------|---------|--------|
| InsForge Deploy | via InsForge MCP tool | SPA en `.output/public` |
| Vercel | `vercel deploy` | Requiere `vercel.json` config |

**CRITICAL**: Siempre borrar `.output/` y `.nuxt/` antes de deployear.

## 10. Variables de Entorno

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| NUXT_PUBLIC_INSFORGE_URL | URL base de InsForge | https://xxx.us-east.insforge.app |
| NUXT_PUBLIC_INSFORGE_KEY | Anon key de InsForge | ik_xxx... |
