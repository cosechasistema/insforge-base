---
name: changelog
description: >
  Mantiene el CHANGELOG.md actualizado con cada cambio significativo.
  Trigger: Despues de cada commit, feature completada, o cuando el usuario pide registrar cambios.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

Actualizar el CHANGELOG.md:
- Despues de completar una feature o fix
- Antes de crear un commit
- Cuando el usuario pida registrar cambios
- Al finalizar una fase del proyecto

## Formato

Seguimos [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) + [Semantic Versioning](https://semver.org/).

### Categorias Validas

| Categoria | Cuando usar |
|-----------|-------------|
| `Added` | Nuevas funcionalidades |
| `Changed` | Cambios en funcionalidades existentes |
| `Deprecated` | Features que seran removidas |
| `Removed` | Features eliminadas |
| `Fixed` | Correccion de bugs |
| `Security` | Parches de seguridad |
| `Infrastructure` | Cambios en DB, backend, CI/CD, config |

### Estructura

```markdown
# Changelog

Todos los cambios notables del proyecto se documentan en este archivo.

Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Descripcion clara del cambio (REQ-ID si aplica)

### Fixed
- Que se arreglo y por que
```

## Reglas

1. **Siempre en espanol** - Este proyecto es en espanol
2. **Un item por linea** - Cada cambio es un bullet point
3. **Referencia al requerimiento** - Si existe un ID de PRD (AUTH-01, EVT-03), incluirlo
4. **Fecha en releases** - `## [1.0.0] - 2026-02-16`
5. **Unreleased primero** - Cambios sin release van en `[Unreleased]`
6. **No redundar** - No repetir lo que dice el commit message
7. **Perspectiva de usuario** - Describir QUE cambia para el usuario, no detalles de implementacion

## Ejemplo

```markdown
## [Unreleased]

### Added
- Sistema de autenticacion con email/password (AUTH-01, AUTH-03)
- Verificacion de email por codigo de 6 digitos (AUTH-02)
- CRUD completo de items para administradores

### Infrastructure
- Tablas `items`, `user_roles` en PostgreSQL
```

## Ubicacion

El archivo CHANGELOG.md esta en la raiz del proyecto: `/CHANGELOG.md`

## Procedimiento

1. Leer el CHANGELOG.md actual
2. Identificar la seccion correcta (`[Unreleased]` o version especifica)
3. Agregar el cambio en la categoria correcta
4. Si es un release, mover items de `[Unreleased]` a la nueva version con fecha
