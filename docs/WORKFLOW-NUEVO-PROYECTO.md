# Flujo de Trabajo — Nuevo Proyecto con Cliente

> Template reutilizable para cualquier empresa.
> Herramientas: Claude Code + InsForge + Notion + n8n

---

## Resumen del Flujo

```
FASE 1: Descubrimiento     → Entrevista + Transcripción
FASE 2: Procesamiento      → Claude analiza transcripción → PRD borrador
FASE 3: Validación          → Cliente revisa PRD en Notion → Ajustes
FASE 4: Especificación      → Claude genera specs técnicas en el repo
FASE 5: Desarrollo          → SDD (propose → spec → design → tasks → apply)
FASE 6: Entrega             → Demo + feedback → iteración
```

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  ENTREVISTA  │───>│  TRANSCRIPCIÓN│───>│ CLAUDE ANALIZA│
│  (grabada)   │    │  (automática) │    │ + REPREGUNTA  │
└─────────────┘    └──────────────┘    └──────┬───────┘
                                              │
                                              v
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│   CLIENTE    │<───│  PRD EN       │<───│ CLAUDE GENERA │
│   VALIDA     │    │  NOTION       │    │ PRD BORRADOR  │
└──────┬──────┘    └──────────────┘    └──────────────┘
       │ ✅ Aprobado
       v
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  SPECS EN    │───>│  SDD FLOW     │───>│  DESARROLLO   │
│  REPO        │    │  (Claude Code)│    │  ITERATIVO    │
└─────────────┘    └──────────────┘    └──────┬───────┘
                                              │
                                              v
                                       ┌──────────────┐
                                       │  DEMO +       │
                                       │  FEEDBACK     │
                                       └──────────────┘
```

---

## FASE 1: Descubrimiento (Entrevista)

### 1.1 Preparación Pre-Entrevista

Antes de sentarte con el cliente, investigá:

- [ ] Rubro de la empresa (inmobiliaria, mutual, contable, etc.)
- [ ] Tamaño aproximado (empleados, volumen de operaciones)
- [ ] ¿Tienen sistema actual? ¿Cuál? ¿Qué les molesta?
- [ ] ¿Tienen planillas Excel, Google Sheets, documentos que usen hoy?

> **PEDILE AL CLIENTE ANTES DE LA REUNIÓN**: capturas de pantalla de su sistema actual, planillas que usen, ejemplos de contratos/facturas/reportes que generen. Esto vale ORO.

### 1.2 Guía de Entrevista

La entrevista se graba y transcribe. Organizada en BLOQUES temáticos.
Tiempo estimado: 60-90 minutos.

---

#### BLOQUE 1: Contexto General (10 min)

> Objetivo: Entender el negocio a alto nivel

| # | Pregunta | Lo que buscás extraer |
|---|----------|----------------------|
| 1.1 | ¿A qué se dedica tu empresa exactamente? | Core business |
| 1.2 | ¿Cuántas personas trabajan y qué roles tienen? | Roles del sistema |
| 1.3 | ¿Cómo manejan todo hoy? ¿Excel, sistema, papel? | Estado actual, pain points |
| 1.4 | ¿Qué es lo que MÁS te duele del proceso actual? | Prioridades reales |
| 1.5 | ¿Qué esperás que cambie cuando tengas el sistema? | Expectativas (anclar alcance) |

---

#### BLOQUE 2: Actores y Roles (10 min)

> Objetivo: Mapear QUIÉN usa el sistema y QUÉ puede hacer

| # | Pregunta | Lo que buscás extraer |
|---|----------|----------------------|
| 2.1 | ¿Quiénes van a usar el sistema? Listame todos los tipos de usuario | Roles: admin, operador, inquilino, mantenimiento, etc. |
| 2.2 | ¿Qué puede hacer cada uno? ¿Qué NO debería poder hacer? | Permisos por rol |
| 2.3 | ¿Algún usuario externo necesita acceso? (ej: inquilino consulta su estado) | Portal externo vs interno |
| 2.4 | ¿Quién aprueba cosas? ¿Hay flujos de aprobación? | Workflows de negocio |

---

#### BLOQUE 3: Entidades del Negocio (20 min)

> Objetivo: Mapear los SUSTANTIVOS del sistema (las tablas)
> CLAVE: Dejá que el cliente hable con sus palabras, después traducís a entidades

| # | Pregunta | Lo que buscás extraer |
|---|----------|----------------------|
| 3.1 | ¿Qué cosas necesitás registrar? (propiedades, personas, contratos...) | Entidades principales |
| 3.2 | Para cada cosa: ¿qué datos guardás de eso? | Campos/atributos |
| 3.3 | ¿Cómo se relacionan entre sí? (un inquilino puede tener varios contratos?) | Relaciones y cardinalidad |
| 3.4 | ¿Hay categorías o tipos? (tipo de propiedad, tipo de contrato) | Enums y catálogos |
| 3.5 | ¿Qué identificador usan hoy? (código, número, nombre) | Claves naturales |
| 3.6 | ¿Hay datos que cambian con el tiempo y necesitás el historial? | Auditoría, versionado |

**FOLLOW-UP por cada entidad detectada:**

```
Para [ENTIDAD]:
- ¿Qué datos son obligatorios vs opcionales?
- ¿Quién lo crea? ¿Quién lo modifica? ¿Se puede eliminar?
- ¿Tiene estados? (ej: contrato activo/vencido/rescindido)
- ¿Tiene documentos adjuntos? (PDF, fotos, etc.)
- ¿Necesitás buscar por algún campo específico?
```

---

#### BLOQUE 4: Procesos y Reglas de Negocio (20 min)

> Objetivo: Mapear los VERBOS del sistema (las acciones)
> ESTA ES LA PARTE MÁS IMPORTANTE

| # | Pregunta | Lo que buscás extraer |
|---|----------|----------------------|
| 4.1 | Describime paso a paso cómo hacés [PROCESO] hoy | Flujo actual (as-is) |
| 4.2 | ¿Qué reglas tiene tu negocio que NO se pueden romper? | Reglas de negocio duras |
| 4.3 | ¿Qué pasa cuando [caso excepcional]? | Edge cases |
| 4.4 | ¿Hay cálculos? (alquiler + expensas + ajuste, intereses por mora) | Lógica de cálculo |
| 4.5 | ¿Hay fechas límite o vencimientos importantes? | Triggers temporales |
| 4.6 | ¿Necesitás que el sistema avise algo automáticamente? | Notificaciones |
| 4.7 | ¿Qué pasa si algo sale mal? ¿Se puede revertir? | Flujos de cancelación |

**PROCESOS COMUNES QUE SIEMPRE HAY QUE PREGUNTAR:**

- Alta de cliente/inquilino/entidad principal
- Generación de contrato/acuerdo
- Facturación/cobro (si aplica)
- Renovación/vencimiento
- Baja/rescisión
- Reclamos/tickets de soporte (si aplica)

---

#### BLOQUE 5: Reportes y Consultas (10 min)

> Objetivo: Qué información necesita VER el cliente

| # | Pregunta | Lo que buscás extraer |
|---|----------|----------------------|
| 5.1 | ¿Qué reportes generás hoy? (mensual, anual, por cliente) | Reportes existentes |
| 5.2 | ¿Qué información necesitás ver de un vistazo al abrir el sistema? | Dashboard |
| 5.3 | ¿Necesitás exportar a Excel o PDF? ¿Para quién? | Formato de salida |
| 5.4 | ¿Hay reportes para cumplimiento legal o impositivo? | Reportes regulatorios |
| 5.5 | ¿Necesitás gráficos o con tablas alcanza? | Nivel de visualización |

---

#### BLOQUE 6: Integraciones y Automatizaciones (10 min)

> Objetivo: Qué conecta con el mundo exterior (candidato a n8n)

| # | Pregunta | Lo que buscás extraer |
|---|----------|----------------------|
| 6.1 | ¿Usás algún otro sistema? (contable, bancario, email marketing) | Integraciones |
| 6.2 | ¿Mandás emails o WhatsApp a clientes? ¿Qué tipo? | Comunicaciones (n8n) |
| 6.3 | ¿Tenés página web donde mostrar propiedades disponibles? | Portal público |
| 6.4 | ¿Necesitás conectar con medios de pago? | Pasarelas (MercadoPago, etc.) |
| 6.5 | ¿Hay algo que hagas repetitivo que te gustaría automatizar? | Candidatos a n8n |

---

#### BLOQUE 7: Cierre (5 min)

| # | Pregunta | Lo que buscás extraer |
|---|----------|----------------------|
| 7.1 | Si pudieras tener UNA sola cosa del sistema mañana, ¿cuál sería? | MVP scope |
| 7.2 | ¿Hay algo que te preocupe del proyecto? | Riesgos percibidos |
| 7.3 | ¿Cuántas personas lo van a usar al principio? | Escala inicial |
| 7.4 | ¿Tenés deadline o fecha importante? | Timeline |
| 7.5 | ¿Hay algo que no te pregunté y es importante? | Catch-all |

---

### 1.3 Materiales a Pedir al Cliente

Después de la entrevista, pedir:

- [ ] Ejemplo de contrato de alquiler (PDF/Word)
- [ ] Ejemplo de factura/recibo de pago
- [ ] Planilla de propiedades actual (Excel/Google Sheets)
- [ ] Planilla de inquilinos actual
- [ ] Ejemplo de reporte que generen hoy
- [ ] Organigrama o lista de empleados con roles
- [ ] Cualquier documento de procedimiento que tengan

> Estos documentos los subís a Notion para referencia y también me los pasás para analizar la estructura de datos.

---

## FASE 2: Procesamiento con Claude

### 2.1 Procesar Transcripción

Después de la entrevista, tenés la transcripción. Me la pasás con este prompt:

```
Acá está la transcripción de la entrevista con [NOMBRE CLIENTE] de [EMPRESA].
Rubro: [RUBRO]

[TRANSCRIPCIÓN]

Necesito que:
1. Extraigas TODAS las entidades mencionadas con sus atributos
2. Identifiques TODAS las reglas de negocio (explícitas e implícitas)
3. Mapees los roles y permisos mencionados
4. Listes los procesos/flujos de trabajo descritos
5. Identifiques qué se puede resolver con CRUD, qué con n8n, y qué necesita lógica custom
6. Listá TODAS las preguntas que quedaron sin responder o ambiguas para repreguntar
```

### 2.2 Repreguntas

Con el análisis, genero una lista de repreguntas organizadas por prioridad:

- **P0 (Bloqueantes)**: Sin esta info NO se puede diseñar (ej: ¿un contrato puede tener múltiples propiedades?)
- **P1 (Importantes)**: Afectan el diseño pero se puede asumir un default (ej: ¿los montos incluyen IVA?)
- **P2 (Nice to have)**: Detalles que se pueden resolver después (ej: color del logo)

Las repreguntas pueden ser por mensaje/email al cliente, no necesitan otra reunión.

### 2.3 Análisis de Documentos del Cliente

Los documentos que te dio el cliente (contratos, planillas, facturas) los analizamos para:

- Validar que las entidades de la entrevista coincidan con los documentos
- Extraer campos que el cliente no mencionó pero están en sus documentos
- Identificar cálculos reales (fórmulas de Excel, montos en contratos)

---

## FASE 3: PRD en Notion

### 3.1 Estructura del PRD en Notion

Se crea un WORKSPACE en Notion con esta estructura:

```
📁 [NOMBRE EMPRESA] - Sistema [NOMBRE]
│
├── 📄 Resumen Ejecutivo
│   ├── Objetivo del sistema
│   ├── Alcance (qué SI, qué NO)
│   ├── Roles de usuario
│   └── Timeline estimado
│
├── 📁 Módulos
│   ├── 📄 Módulo: Propiedades
│   │   ├── Descripción
│   │   ├── Datos que se guardan (tabla visual)
│   │   ├── Reglas de negocio
│   │   ├── Pantallas (wireframe simple o descripción)
│   │   └── Estado: ✅ Aprobado / 🔄 En revisión / ❌ Pendiente
│   │
│   ├── 📄 Módulo: Inquilinos
│   ├── 📄 Módulo: Contratos
│   ├── 📄 Módulo: Pagos
│   ├── 📄 Módulo: Mantenimiento
│   └── ...
│
├── 📁 Reglas de Negocio
│   └── 📄 Catálogo de Reglas (tabla con ID, descripción, módulo, prioridad)
│
├── 📁 Reportes
│   └── 📄 Lista de reportes requeridos (tabla)
│
├── 📁 Automatizaciones (n8n)
│   └── 📄 Lista de automatizaciones identificadas
│
├── 📁 Documentos del Cliente
│   └── (archivos subidos: contratos ejemplo, planillas, etc.)
│
└── 📁 Seguimiento
    ├── 📄 Preguntas Pendientes
    ├── 📄 Decisiones Tomadas (log)
    └── 📄 Changelog de Requerimientos
```

### 3.2 Formato de cada Módulo en Notion

Cada módulo sigue esta plantilla:

```markdown
# Módulo: [NOMBRE]

## Descripción
[1-2 párrafos explicando qué hace este módulo en lenguaje del cliente]

## Entidad Principal
| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| nombre | Texto | Sí | Nombre de la propiedad |
| dirección | Texto | Sí | Dirección completa |
| tipo | Opción | Sí | Departamento / Oficina / Local |
| metros_cuadrados | Número | No | Superficie en m² |
| estado | Opción | Sí | Disponible / Alquilado / Mantenimiento |

## Relaciones
- Una propiedad tiene MUCHOS contratos
- Una propiedad pertenece a UN propietario

## Reglas de Negocio
- RN-001: No se puede alquilar una propiedad en estado "Mantenimiento"
- RN-002: Al vencer un contrato, la propiedad vuelve a "Disponible" automáticamente

## Operaciones
| Operación | Quién puede | Descripción |
|-----------|-------------|-------------|
| Crear | Admin, Operador | Alta de nueva propiedad |
| Editar | Admin, Operador | Modificar datos |
| Eliminar | Solo Admin | Solo si no tiene contratos activos |
| Listar | Todos | Con filtros por tipo y estado |
| Ver detalle | Todos | Incluye historial de contratos |

## Reportes relacionados
- Listado de propiedades por estado
- Ocupación mensual (% alquilado vs disponible)

## Estado de aprobación: 🔄 En revisión
```

### 3.3 Validación con el Cliente

1. Compartís el workspace de Notion con el cliente
2. El cliente revisa módulo por módulo
3. Puede comentar directamente en Notion
4. Cuando aprueba un módulo, se marca ✅
5. **NO SE EMPIEZA A DESARROLLAR UN MÓDULO SIN ✅**

---

## FASE 4: Especificación Técnica (Repo)

### 4.1 De Notion al Repo

Una vez que los módulos están aprobados en Notion, se genera la spec técnica en el repo.
Esto lo hago yo (Claude) a partir del PRD de Notion.

Me pasás el link de Notion o copiás el contenido del módulo aprobado y me decís:

```
Este módulo está aprobado. Generá la spec técnica.
```

### 4.2 Lo que genero en el repo

Para cada módulo aprobado:

1. **Schema de base de datos** — Tablas, campos, tipos, constraints, RLS
2. **Tipos TypeScript** — Interfaces en `app/types/`
3. **API Contracts** — Operaciones CRUD + queries custom
4. **Reglas que van en frontend** vs **reglas que van en backend** (RLS/triggers)
5. **Reglas que van en n8n** (notificaciones, automatizaciones)

### 4.3 Pipeline SDD

Con la spec técnica lista, se usa el flujo SDD que ya tenés configurado:

```
/sdd-ff [módulo]     → Genera proposal + spec + design + tasks
/sdd-apply [módulo]  → Implementa las tasks
/sdd-verify [módulo] → Verifica contra specs
```

---

## FASE 5: Desarrollo Iterativo

### 5.1 Orden de Desarrollo Recomendado

Para CUALQUIER proyecto, este es el orden natural:

```
Sprint 0: Setup
├── Crear instancia InsForge
├── Clonar insforge-base
├── Configurar .env
├── Configurar Notion workspace
└── Configurar MCP servers

Sprint 1: Fundamentos (siempre primero)
├── Roles y permisos (user_roles + middleware)
├── Entidades maestras (catálogos, tipos)
└── Entidad principal del negocio (ej: Propiedades)

Sprint 2: Core del negocio
├── Entidades secundarias (ej: Inquilinos, Propietarios)
├── Entidad transaccional principal (ej: Contratos)
└── Reglas de negocio críticas

Sprint 3: Operaciones
├── Pagos/Cobros/Movimientos
├── Cálculos automáticos
└── Reportes básicos

Sprint 4: Automatizaciones
├── Notificaciones (n8n + email/WhatsApp)
├── Vencimientos automáticos
└── Integraciones externas

Sprint 5: Polish
├── Dashboard con métricas
├── Reportes avanzados (PDF/Excel)
├── Ajustes de UX
└── Testing E2E completo
```

### 5.2 Ciclo por Módulo

```
1. Copiás módulo aprobado de Notion
2. Me lo pasás → genero specs técnicas
3. /sdd-ff [módulo] → plan de implementación
4. /sdd-apply → implemento
5. Verificás con Chrome DevTools MCP (visual)
6. /sdd-verify → verifico contra specs
7. Demo al cliente → feedback → ajustes
8. Módulo ✅ en Notion → siguiente módulo
```

---

## FASE 6: Clasificación de Features

### 6.1 Qué va en cada herramienta

| Tipo | Herramienta | Ejemplos |
|------|-------------|----------|
| CRUD básico | Nuxt + InsForge | ABM propiedades, inquilinos, contratos |
| Reglas de negocio en datos | InsForge RLS + Triggers | "No borrar propiedad con contrato activo" |
| Reglas de negocio en UI | Nuxt (composables) | "Deshabilitar botón si estado = X" |
| Cálculos | InsForge Functions o Nuxt | Monto alquiler + expensas + ajuste |
| Reportes | Nuxt (jsPDF + xlsx) | Listados, resúmenes, exportación |
| Notificaciones | n8n | Email vencimiento, WhatsApp recordatorio |
| Tareas programadas | n8n (cron) | Verificar vencimientos diariamente |
| Integraciones externas | n8n | MercadoPago, API bancaria, AFIP |
| Portal público | Nuxt (ruta pública) o sitio separado | Propiedades disponibles |

### 6.2 Señales para derivar a n8n

Si en la entrevista el cliente menciona alguna de estas palabras, es candidato a n8n:

- "Que me avise cuando..."
- "Todos los días/semanas/meses..."
- "Que le mande un email/WhatsApp..."
- "Que se conecte con [otro sistema]..."
- "Que genere automáticamente..."
- "Que actualice el estado cuando pase X tiempo..."

---

## Checklist Resumen por Proyecto

```
PRE-ENTREVISTA
□ Investigar rubro del cliente
□ Pedir documentos/planillas previos
□ Preparar guía de entrevista (este documento)

ENTREVISTA
□ Grabar la reunión
□ Cubrir los 7 bloques
□ Pedir materiales faltantes al cierre

POST-ENTREVISTA
□ Transcribir grabación
□ Pasar transcripción a Claude para análisis
□ Generar lista de repreguntas (P0/P1/P2)
□ Enviar repreguntas P0 al cliente
□ Analizar documentos del cliente

DOCUMENTACIÓN (Notion)
□ Crear workspace del proyecto
□ Generar PRD con módulos
□ Catalogar reglas de negocio
□ Identificar automatizaciones (n8n)
□ Compartir con cliente para revisión
□ Obtener ✅ por módulo

SETUP TÉCNICO
□ Crear instancia InsForge
□ Clonar insforge-base
□ Configurar .env + .mcp.json
□ Crear tablas base (user_roles)

DESARROLLO (por módulo aprobado)
□ Generar spec técnica desde Notion
□ /sdd-ff → plan
□ /sdd-apply → implementar
□ Verificar visual (Chrome DevTools)
□ /sdd-verify → validar
□ Demo al cliente
□ Marcar ✅ en Notion

ENTREGA
□ Deploy a producción
□ Capacitación al cliente
□ Documentar accesos y configuración
□ Plan de soporte/mantenimiento
```

---

## Ejemplo: Sistema de Alquileres

### Entidades probables (a validar en entrevista)

| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| Propiedades | Dptos, oficinas, locales | Tiene muchos contratos |
| Propietarios | Dueños de propiedades | Tiene muchas propiedades |
| Inquilinos | Quien alquila | Tiene muchos contratos |
| Contratos | Vínculo propiedad-inquilino | Tiene muchos pagos |
| Pagos | Cobros mensuales | Pertenece a un contrato |
| Personal Mantenimiento | Técnicos, limpieza | Recibe muchas órdenes |
| Órdenes de Trabajo | Reparaciones, mantenimiento | Asignada a personal + propiedad |
| Garantes | Quien garantiza al inquilino | Asociado a contrato |
| Documentos | PDFs adjuntos | Asociado a contrato/propiedad |

### Reglas de negocio probables (a validar)

- Un contrato tiene fecha inicio, fecha fin, monto, moneda, ajuste
- Un inquilino puede tener múltiples contratos (no simultáneos en misma propiedad)
- Los pagos se generan mensualmente según el contrato
- Hay intereses por mora (% a definir)
- Las órdenes de trabajo tienen estados: pendiente → en curso → completada
- Al vencer un contrato, notificar 30/60/90 días antes

### Clasificación probable

| Feature | Herramienta |
|---------|-------------|
| CRUD propiedades/inquilinos/contratos | Nuxt + InsForge |
| Generación de recibos de pago | Nuxt (jsPDF) |
| Cálculo de ajuste por inflación | InsForge Function o composable |
| Notificación de vencimiento | n8n (cron diario + email) |
| Recordatorio de pago | n8n (WhatsApp/email) |
| Reporte de morosidad | Nuxt (xlsx + jsPDF) |
| Portal de inquilino (ver su estado) | Nuxt (ruta con auth) |
