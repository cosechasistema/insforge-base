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
| id | UUID | PK, gen_random_uuid() | ID auto (creado por InsForge) |
| user_id | UUID | NOT NULL | ID del usuario (InsForge Auth) |
| role | TEXT | NOT NULL, DEFAULT 'user' | Rol: 'admin' o 'user' |
| created_at | TIMESTAMPTZ | DEFAULT now() | Fecha de creacion |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Fecha de actualizacion |

> **Nota**: Cuando creas tablas desde el dashboard de InsForge, automaticamente agrega
> `id`, `created_at` y `updated_at`. El composable `useAuth` busca por `user_id`,
> no por `id`.

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
│   │   ├── admin/
│   │   │   └── users.vue
│   │   └── items/
│   │       ├── index.vue
│   │       └── [id].vue
│   ├── plugins/
│   │   ├── 01.insforge.ts
│   │   └── 02.auth.ts
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
├── public/
│   ├── icon-192.png
│   └── icon-512.png
├── nuxt.config.ts
├── CHANGELOG.md
├── README.md
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
/admin/users                auth, admin     -> / (si no es admin)
```

> Agregar nuevas rutas a esta tabla al crear modulos.

## 6. InsForge Setup

Para un proyecto nuevo basado en este template:

### 6.1 Crear proyecto

1. Crear proyecto en InsForge Dashboard
2. Obtener URL base y Anon Key
3. Linkear con CLI: `npx @insforge/cli link --project-id YOUR_PROJECT_ID`

### 6.2 Crear tablas

**IMPORTANTE**: Crear las tablas desde el **dashboard de InsForge**, NO con raw SQL.
Las tablas creadas via `run-raw-sql` no se exponen automaticamente en la REST API
(PostgREST no las detecta hasta un schema cache reload).

Tablas requeridas:
- `user_roles` (ver schema en seccion 3.2)
- `items` (ver schema en seccion 3.2)

### 6.3 Configurar RLS (Row Level Security)

Despues de crear las tablas, configurar policies RLS. Sin policies, las tablas
no retornan datos a usuarios autenticados aunque tengan GRANTs.

```sql
-- Para cada tabla nueva:
CREATE POLICY tabla_all ON tabla FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY tabla_read_anon ON tabla FOR SELECT TO anon USING (true);
```

Si necesitas restriccion por usuario:
```sql
-- Solo el dueño puede ver/editar sus registros
CREATE POLICY tabla_own ON tabla FOR ALL TO authenticated
  USING (user_id = current_setting('request.jwt.claims')::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims')::json->>'sub');
```

### 6.4 Configurar variables de entorno

```
NUXT_PUBLIC_INSFORGE_URL=https://YOUR-PROJECT.us-east.insforge.app
NUXT_PUBLIC_INSFORGE_KEY=your-anon-key-here
```

### 6.5 Configurar MCP

Actualizar `.mcp.json` con la API key del proyecto:
```json
{
  "mcpServers": {
    "insforge": {
      "command": "npx",
      "args": ["-y", "@insforge/mcp@latest"],
      "env": {
        "API_KEY": "ik_YOUR_API_KEY",
        "API_BASE_URL": "https://YOUR-PROJECT.us-east.insforge.app"
      }
    }
  }
}
```

### 6.6 Crear usuarios de test

```bash
# Desactivar verificacion de email (para testing)
curl -X PUT 'https://YOUR-PROJECT.us-east.insforge.app/api/auth/config' \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"requireEmailVerification": false}'

# Crear admin
curl -X POST 'https://YOUR-PROJECT.us-east.insforge.app/api/auth/users' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin-test@yourapp.com","password":"TestAdmin1234","name":"Admin Test"}'

# Asignar rol admin (via REST API)
curl -X POST 'https://YOUR-PROJECT.us-east.insforge.app/api/database/records/user_roles' \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '[{"user_id": "USER_ID_FROM_RESPONSE", "role": "admin"}]'
```

Actualizar `.env.test` con las credenciales.

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
| NUXT_PUBLIC_INSFORGE_KEY | Anon key de InsForge | eyJhbG... |

## 11. Gotchas y Lecciones Aprendidas

### InsForge: tablas via SQL vs dashboard
Las tablas creadas con `run-raw-sql` **NO se exponen** en la REST API automaticamente.
PostgREST cachea el schema agresivamente y `NOTIFY pgrst, 'reload schema'` no siempre
funciona en InsForge. **Solucion**: crear tablas desde el dashboard de InsForge.

### InsForge: RLS obligatorio
Las tablas creadas desde el dashboard tienen RLS habilitado **sin policies**.
Esto significa que `SELECT` retorna `[]` (vacio) para usuarios autenticados.
**Solucion**: agregar policies despues de crear cada tabla (ver seccion 6.3).

### InsForge: columnas auto-generadas
InsForge agrega `id` (UUID), `created_at` y `updated_at` automaticamente a tablas
creadas desde el dashboard. No intentes crear tablas con `user_id` como PK —
siempre va a tener un `id` UUID auto.

### InsForge: MCP apunta al proyecto del directorio actual
El MCP server de InsForge usa la API key del `.mcp.json` del directorio donde
se ejecuta Claude Code. Si trabajas en un proyecto diferente, asegurate de que
`.mcp.json` apunte al proyecto correcto.

### Deploy: limpiar antes de deployear
SIEMPRE borrar `.output/` y `.nuxt/` antes de deployear. El deploy tool sube
TODO el directorio — si hay un build viejo local, sube assets con hashes viejos.

### E2E: search post-create
Siempre usar busqueda despues de crear un registro en tests E2E para encontrarlo
en la tabla. Evita flaky tests por paginacion del v-data-table.

### Auth: password sin caracteres especiales en curl
Los caracteres `!` en passwords causan problemas con curl y JSON parsing.
Usar passwords alfanumericos para usuarios de test (ej: `TestAdmin1234`).
