# Skill: init-project — Inicializar nuevo proyecto desde InsForge Base

## Trigger

Invoke with `/init-project` cuando el usuario quiere crear un nuevo proyecto a partir del template insforge-base.

## Purpose

Configura el template base para un proyecto nuevo: valida credenciales, actualiza archivos de configuración, crea documentación en Notion, y hace el commit inicial. Todo interactivo con confirmación del usuario.

## Prerequisites

- Estar en el directorio raíz de `insforge-base` (rama `master`)
- Notion MCP server conectado
- InsForge MCP server conectado (para validar credenciales)

## Process

### Step 1: Recolectar datos del proyecto

Preguntar al usuario uno por uno (STOP y esperar respuesta en cada pregunta):

| # | Dato | Obligatorio | Default | Ejemplo |
|---|------|-------------|---------|---------|
| 1 | **Nombre del proyecto** | Sí | — | `cym-alquileres` |
| 2 | **Descripción / objetivo** | Sí | — | `Sistema de gestión de alquileres para CyM` |
| 3 | **Organización / cliente** | Sí | — | `CyM Inmobiliaria` |
| 4 | **InsForge URL** | Sí | — | `https://insforge-03.easypanel-cosecha.lat` |
| 5 | **InsForge Anon Key** | Sí | — | `eyJhbGciOi...` |
| 6 | **Rama git** | Sí | slugify del nombre | `cym-alquileres` |

NO preguntar color primario (se configura después). NO preguntar tablas ni rutas.

### Step 2: Validar credenciales InsForge

Antes de hacer CUALQUIER cambio, validar la conexión a InsForge:

1. Usar el InsForge MCP tool `get-anon-key` o `get-backend-metadata` con la URL y key proporcionadas
2. Si la validación FALLA: informar al usuario, pedir que corrija, y NO continuar
3. Si la validación PASA: mostrar confirmación y continuar

### Step 3: Resumen y confirmación

Mostrar un resumen con TODOS los datos recolectados y pedir confirmación explícita antes de hacer cambios:

```
📋 Resumen del nuevo proyecto:
- Nombre: {nombre}
- Descripción: {descripcion}
- Organización: {organizacion}
- InsForge URL: {url}
- InsForge Key: {key (primeros 20 chars)}...
- Rama git: {rama}
- Conexión InsForge: ✅ Validada

¿Confirmar y proceder? (s/n)
```

STOP y esperar confirmación. Si el usuario dice no, preguntar qué quiere cambiar.

### Step 4: Actualizar archivos de configuración

Una vez confirmado, modificar estos archivos:

#### 4.1 `.env`
Sobreescribir completamente con las credenciales validadas:
```
NUXT_PUBLIC_INSFORGE_URL={url}
NUXT_PUBLIC_INSFORGE_KEY={key}
```

#### 4.2 `.env.example`
Actualizar con la URL real (sin key):
```
NUXT_PUBLIC_INSFORGE_URL={url}
NUXT_PUBLIC_INSFORGE_KEY=your-anon-key-here
```

#### 4.3 `package.json`
- `name`: slugify del nombre del proyecto
- `description`: `{descripcion}` (en español)

#### 4.4 `app/utils/config.ts`
Actualizar APP_CONFIG:
- `name`: nombre del proyecto
- `shortName`: nombre corto (slugify o abreviatura)
- `description`: descripción del proyecto

#### 4.5 `nuxt.config.ts`
Actualizar sección PWA manifest:
- `name`: nombre del proyecto
- `short_name`: nombre corto
- `description`: descripción
- `lang`: 'es'

#### 4.6 `CHANGELOG.md`
Resetear con:
```markdown
# Changelog

Todos los cambios notables del proyecto {nombre}.

Formato: [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
Versionado: [Semantic Versioning](https://semver.org/lang/es/)

## [0.1.0] - {fecha de hoy}

### Added
- Proyecto inicializado desde InsForge Base template
- Auth completo (login, registro, verificación email, roles)
- Módulo CRUD de ejemplo (Items)
- Reportes PDF/Excel client-side
- PWA con cache offline
- Testing E2E (Playwright) + Unit (Vitest)
```

#### 4.7 Credenciales en documentación
Buscar y reemplazar TODAS las referencias a credenciales de ejemplo en:
- `docs/ARCHITECTURE.md`
- `docs/API-CONTRACTS.md`
- Cualquier archivo `.md` que contenga URLs de InsForge de ejemplo (como `https://YOUR-PROJECT.us-east.insforge.app` o `97t4ddca` o cualquier otra URL/key de ejemplo)

Reemplazar con la URL validada del nuevo proyecto. La key NO se escribe en docs (solo en .env).

### Step 5: Crear rama git

```bash
git checkout -b {rama}
```

### Step 6: Crear documentación Notion

Usar el skill `/notion-docs` para crear la documentación del nuevo proyecto en Notion. Pasar como argumentos:

- Nombre del proyecto
- Descripción
- Organización
- Stack: Nuxt 4.3.1 + Vuetify 4.0.1 + InsForge BaaS
- InsForge URL validada (incluir en Credenciales y Accesos, Onboarding, y cualquier sección relevante)
- InsForge Anon Key (solo en página de Credenciales, con nota de que está en .env)

La documentación Notion debe:
- Usar la URL validada como la ÚNICA credencial válida en toda la documentación
- NO incluir URLs de ejemplo ni credenciales del template base
- Incluir la organización en el header del proyecto

### Step 7: Commit inicial

Hacer un commit con todos los cambios:
```
feat: initialize {nombre} from insforge-base template
```

Usar conventional commits. NO agregar Co-Authored-By ni atribución AI.

### Step 8: Resumen final

Mostrar al usuario:
```
✅ Proyecto {nombre} inicializado correctamente

📁 Archivos modificados:
- .env (credenciales validadas)
- .env.example (URL actualizada)
- package.json (nombre y descripción)
- app/utils/config.ts (branding)
- nuxt.config.ts (PWA manifest)
- CHANGELOG.md (reseteado)
- .notion-docs.json (nueva documentación)

🌿 Rama: {rama}
📝 Notion: {url de la página principal}
🔗 InsForge: {url} ✅ Validada

Próximos pasos:
1. Definir las entidades/tablas del nuevo proyecto
2. Crear las tablas en el Dashboard de InsForge
3. Crear los módulos CRUD (podés usar el módulo Items como referencia)
4. npm run dev para verificar que todo funciona
```

## Important Rules

1. **SIEMPRE validar credenciales ANTES de hacer cambios** — si falla, no tocar nada
2. **SIEMPRE pedir confirmación** antes de modificar archivos
3. **STOP y esperar respuesta** en cada pregunta — NUNCA asumir respuestas
4. **Las credenciales validadas son la ÚNICA fuente de verdad** — reemplazar cualquier credencial de ejemplo en toda la documentación
5. **NO preguntar color, tablas, rutas, deploy URL** — se configuran después
6. **NO borrar el módulo Items** — queda como referencia
7. **Conventional commits** sin atribución AI
8. **Español rioplatense** en toda la comunicación con el usuario
