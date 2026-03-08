# InsForge Base

Template project for building apps with **Nuxt 4 + Vuetify 3 + InsForge BaaS**.

Includes authentication, role-based access, CRUD example, PDF/Excel reports, PWA, and testing infrastructure.

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/cosechasistema/insforge-base.git my-project
cd my-project
npm install

# 2. Create InsForge project
# Go to InsForge Dashboard → Create new project
# Get your URL and Anon Key

# 3. Configure environment
cp .env.example .env
# Edit .env with your InsForge URL and Anon Key

# 4. Create tables from InsForge Dashboard (NOT raw SQL)
# - user_roles: user_id (text), role (text, default 'user')
# - items: nombre (varchar 255), descripcion (text, nullable)

# 5. Add RLS policies
# See docs/ARCHITECTURE.md section 6.3

# 6. Run
npm run dev
```

## Project Structure

```
app/
├── pages/          # File-based routing
├── composables/    # Business logic (useAuth, useItems)
├── components/     # Vue components organized by module
├── utils/          # Shared utilities (config, reportes)
├── plugins/        # InsForge SDK init, auth restore
├── middleware/      # Route guards (auth, admin)
├── layouts/        # default (sidebar+toolbar), auth (minimal)
└── types/          # TypeScript interfaces
```

## What's Included

- **Auth**: Login, register, email verification (OTP), session restore
- **Roles**: admin/user via `user_roles` table, middleware protection
- **Items CRUD**: List with search, create/edit dialog, delete with confirmation
- **Reports**: Export filtered data to PDF (jsPDF) or Excel (xlsx)
- **PWA**: Offline-first with workbox caching strategies
- **Testing**: Vitest (unit) + Playwright (E2E) with auth helpers

## Adding a New Module

1. Create table from InsForge Dashboard + add RLS policies
2. Add types to `app/types/index.ts`
3. Create composable in `app/composables/use{Module}.ts`
4. Create components in `app/components/{module}/`
5. Create pages in `app/pages/{module}/`
6. Add to sidebar in `app/components/layout/AppSidebar.vue`

See `skills/crud-search/SKILL.md` and `skills/crud-report/SKILL.md` for patterns.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — Stack, data model, flows, InsForge setup guide
- [API Contracts](docs/API-CONTRACTS.md) — SDK call signatures and responses
- [Changelog](CHANGELOG.md) — Version history

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4 (SPA) |
| UI | Vuetify 3 |
| Backend | InsForge BaaS |
| PDF | jsPDF + autoTable |
| Excel | xlsx (SheetJS) |
| Testing | Vitest + Playwright |
