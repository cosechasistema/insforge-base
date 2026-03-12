# API BIND — Referencia Tecnica

> Documentacion tecnica de la API de Banco Industrial (BIND) para integracion con Mutual Cosecha Salud.
> Version API: **1.7.14** | Sandbox: `https://sandbox.bind.com.ar/apidoc/`
> Produccion: `https://api.bind.com.ar/v1`

## Restriccion critica

**SOLO LECTURA**. No se generaran movimientos bancarios. Solo consulta de datos.

## Autenticacion

La API BIND usa **doble autenticacion**:

### 1. mTLS (Mutual TLS)

Cada request HTTP requiere un certificado de cliente y su clave privada.

| Recurso               | Ubicacion                                      |
| ---------------------- | ---------------------------------------------- |
| Certificado            | `/root/30707818421_prd-202512.crt`             |
| Clave privada          | `/root/30707818421.key`                        |
| Password del cert      | `univaca`                                      |
| Servidor SSH           | `143.244.181.216:22`                           |
| Credencial n8n SSH     | `SSH BIND produccion` (id: `rFq7kuSK4ixTuoKW`) |

**IMPORTANTE**: Los certificados estan instalados en un servidor remoto. No se pueden usar desde el frontend ni desde InsForge Functions. La unica forma de acceder es via SSH desde n8n.

### 2. JWT Token

```
POST https://api.bind.com.ar/v1/login/jwt
Content-Type: application/json

{
  "username": "api-mutual-prd",
  "password": "z5c$xB4MDAU36y32fza2qXdS4"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  "expires_in": 3600
}
```

**Uso del token:**

```
Authorization: JWT eyJhbGciOiJSUzI1NiIsInR5cCI...
```

### Ejemplo completo via SSH + curl

```bash
curl -X POST \
  --url https://api.bind.com.ar/v1/login/jwt \
  -H 'Content-Type: application/json' \
  -d '{"username": "api-mutual-prd","password": "z5c$xB4MDAU36y32fza2qXdS4"}' \
  --cert ./30707818421_prd-202512.crt:univaca \
  --key ./30707818421.key \
  --silent --show-error
```

### Error de autenticacion

| HTTP | Codigo | Descripcion                        |
| ---- | ------ | ---------------------------------- |
| 409  | GE401  | Token invalido o usuario no existe |
| 403  | GE403  | Error de permisos                  |

---

## Endpoints de consulta (los que usamos)

### Listar transferencias

```
GET /banks/{bank_id}/accounts/{account_id}/{view_id}/transaction-request-types/TRANSFER-CVU
```

**Parametros de ruta:**

| Parametro    | Tipo   | Valor             | Descripcion              |
| ------------ | ------ | ----------------- | ------------------------ |
| `bank_id`    | Number | `322`             | Banco Industrial (fijo)  |
| `account_id` | String | `XX-X-XXXX-X-X`  | Codigo cuenta recaudadora |
| `view_id`    | String | `owner`           | Vista (siempre "owner")  |

**Filtros via headers:**

| Header           | Tipo   | Default                    | Descripcion                                              |
| ---------------- | ------ | -------------------------- | -------------------------------------------------------- |
| `obp_status`     | String | (todos)                    | COMPLETED, FAILED, IN_PROGRESS, UNKNOWN, UNKNOWN_FOREVER |
| `obp_limit`      | Number | 50                         | Registros por pagina (max 50)                            |
| `obp_offset`     | Number | 0                          | Numero de pagina                                         |
| `obp_from_date`  | String | ultima semana              | Fecha desde (ISO 8601)                                   |
| `obp_to_date`    | String | ahora                      | Fecha hasta (ISO 8601)                                   |
| `obp_origin`     | String | TRANSFERENCIAS_ENVIADAS    | Filtro de origen                                         |
| `Authorization`  | String | (requerido)                | `JWT <token>`                                            |

**Response:** Array de objetos transferencia.

### Detalle de transferencia

```
GET /banks/{bank_id}/accounts/{account_id}/{view_id}/transaction-request-types/TRANSFER-CVU/{transaction_id}
```

**Parametros adicionales:**

| Parametro        | Tipo   | Descripcion                 |
| ---------------- | ------ | --------------------------- |
| `transaction_id` | String | ID unico de la transferencia |

**Response:**

```json
{
  "id": "string",
  "type": "TRANSFER-CVU",
  "from": {
    "bank_id": "322",
    "account_id": "XX-X-XXXX-X-X"
  },
  "counterparty": {
    "name": "string",
    "routing": {
      "cbu": "string",
      "cvu": "string",
      "cuit": "string"
    }
  },
  "status": "COMPLETED | FAILED | IN_PROGRESS | UNKNOWN | UNKNOWN_FOREVER",
  "charge": {
    "currency": "ARS",
    "amount": 15000.50
  },
  "description": "string",
  "concept": "VAR",
  "start_date": "2026-03-01T10:00:00Z",
  "end_date": "2026-03-01T10:00:05Z",
  "business_date": "2026-03-01"
}
```

**Errores:**

| HTTP | Codigo | Descripcion                    |
| ---- | ------ | ------------------------------ |
| 409  | TX019  | Transferencia no encontrada    |
| 409  | TX044  | CUIT de cuenta origen invalido |

---

## Endpoints que NO usamos (referencia)

Estos endpoints existen pero **no los vamos a usar** por la restriccion de solo lectura:

### CVU (Billetera Virtual)

| Metodo | Endpoint              | Descripcion            |
| ------ | --------------------- | ---------------------- |
| POST   | `.../wallet/cvu`      | Crear CVU              |
| PUT    | `.../wallet/cvu/:cvu` | Modificar CVU          |
| DELETE | `.../wallet/cvu/:cvu` | Eliminar CVU           |
| POST   | `.../wallet/alias`    | Asignar/modificar alias |

### Transferencias salientes

| Metodo | Endpoint                                | Descripcion               |
| ------ | --------------------------------------- | ------------------------- |
| POST   | `.../TRANSFER-CVU/transaction-requests` | Crear transferencia (PROHIBIDO) |

### Otros (mencionados en metadata, sin doc completa)

- Cuentas (consulta de cuentas y saldos)
- DEBIN (debito inmediato)
- Debito directo
- Cheques
- Inversiones
- MEP (dolar MEP)
- Webhooks/eventos

---

## Codigos de error comunes

| HTTP | Codigo | Descripcion                      |
| ---- | ------ | -------------------------------- |
| 409  | GE401  | Token invalido / usuario no existe |
| 403  | GE403  | Sin permisos                     |
| 500  | GE500  | Error general del servidor       |
| 503  | GE503  | Red no disponible (Coelsa)       |
| 409  | TX009  | Alias CBU/CVU invalido           |
| 409  | TX019  | Transferencia no encontrada      |
| 409  | VW002  | Sin codigo PSP asignado          |
| 409  | VW005  | CVU no pertenece a billetera     |
| 409  | VW007  | Alias ya en uso                  |

---

## Notas tecnicas

1. **Paginacion**: La API usa `obp_limit` (page size) + `obp_offset` (page number). Default limit: 50.
2. **Estados de transferencia**:
   - `COMPLETED` / `FAILED` → estados finales
   - `IN_PROGRESS` / `UNKNOWN` → re-consultar despues de 5 minutos
   - `UNKNOWN_FOREVER` → estado final sin resolucion
3. **Red Coelsa**: Las transferencias CVU pasan por la red Coelsa. Si esta caida → HTTP 503.
4. **Certificado vence**: El certificado actual tiene fecha `202512` en el nombre. Verificar vigencia y renovar con anticipacion.
5. **Sandbox vs Produccion**: El sandbox (`sandbox.bind.com.ar`) tiene documentacion pero funcionalidad limitada. Trabajamos directo contra produccion en modo lectura.
