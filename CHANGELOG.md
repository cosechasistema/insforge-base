# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
y el proyecto sigue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-08

### Added
- Proyecto template base con Nuxt 4 + Vuetify 3 + InsForge SDK
- Sistema de autenticacion completo: login, registro, verificacion de email por OTP
- Control de acceso por roles (admin/user) via tabla `user_roles`
- Middleware `auth` (redirige a `/login` si no hay sesion) y `admin` (redirige si no es admin)
- Layout principal con sidebar navegable, toolbar con nombre de usuario y logout
- Layout auth minimalista centrado para paginas de login/registro
- Componente `OfflineBanner` para deteccion de conectividad
- Modulo Items como ejemplo CRUD completo: listado con busqueda, detalle/edicion, creacion, eliminacion
- Boton "Nuevo Item" visible solo para administradores
- Dialogo de confirmacion antes de eliminar
- Snackbar de feedback en todas las operaciones CRUD
- Skeleton loader mientras carga el listado
- Componente de reporte con exportacion a PDF (jsPDF + autoTable) y Excel (xlsx)
- Utilidades compartidas: `generarPDF()`, `generarExcel()`, constantes de unidades de medida
- Branding configurable via `APP_CONFIG` en `app/utils/config.ts`
- Dashboard con tarjetas de estadisticas placeholder
- Configuracion PWA con cache offline (NetworkFirst para navegacion, StaleWhileRevalidate para assets)
- Tema Vuetify personalizable con colores neutrales (azul/teal)
- Infraestructura de testing: Vitest (unit) + Playwright (E2E) con helpers de auth
- 1 archivo de tests unitarios (8 tests de filtrado de items)
- 3 archivos de tests E2E (cleanup, auth flow, items CRUD)
- Skills de Claude Code: `crud-search`, `crud-report`, `changelog`
- `CLAUDE.md` con personalidad de mentor, skills table y orquestador SDD
- Documentacion tecnica: `ARCHITECTURE.md` y `API-CONTRACTS.md`
- Configuracion de deploy: `vercel.json` con rewrites para SPA

### Infrastructure
- Base InsForge nueva (`97t4ddca`) con tablas `user_roles` e `items`
- Bucket de storage `documentos` (publico) para uploads
- Usuarios de test: admin (`admin-test@insforgebase.com`) y user (`user-test@insforgebase.com`)
- Email verification desactivada en la base de test
- RLS policies configuradas: `authenticated` tiene acceso total, `anon` solo lectura
- Repositorio GitHub: `cosechasistema/insforge-base`
