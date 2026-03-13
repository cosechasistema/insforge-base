# BIND API — Transferencias

Fuente: https://sandbox.bind.com.ar/apidoc/#api-Transferencia-ObtenerPedidosTransferencias

## Endpoint: Obtener listado de transferencias

```
GET /banks/:bank_id/accounts/:account_id/:view_id/transaction-request-types/TRANSFER-CVU
```

## Headers

| Header | Tipo | Default | Descripción |
|---|---|---|---|
| `Authorization` | String | Requerido | `"JWT :token"` |
| `obp_limit` | Number | **50** | Tamaño de página |
| `obp_offset` | Number | **0** | Número de página |
| `obp_from_date` | String | Última semana | Fecha desde ISO (ej: 2017-01-01) |
| `obp_to_date` | String | Ahora | Fecha hasta ISO (ej: 2017-01-01) |
| `obp_status` | String | Opcional | Estado de la transferencia |
| `obp_origin` | String | TRANSFERENCIAS_ENVIADAS | Origen de transferencia |

## Response

Array de objetos con:
- `id` — Identificador de transacción
- `type` — Tipo de operación (ej: TRANSFER)
- `from` — Cuenta recaudadora (bank_id, account_id)
- `counterparty` — Datos del tercero (id, name, routing info)
- `details` — Detalles (origin_id, origin_debit/credit con CVU, CUIT)
- `transaction_ids` — Identificadores internos
- `status` — Estado actual
- `start_date`, `end_date`, `business_date` — Timestamps ISO
- `charge` — Monto y moneda

## Otros endpoints

### Obtener una transferencia específica
```
GET /banks/:bank_id/accounts/:account_id/:view_id/transaction-request-types/TRANSFER-CVU/:transaction_id
```

### Realizar transferencia desde CVU
```
POST /banks/:bank_id/accounts/:account_id/:view_id/transaction-request-types/TRANSFER-CVU/transaction-requests
```

## IMPORTANTE

- El límite default es 50 registros por página
- Se DEBE implementar paginación (obp_offset) si se esperan más de 50 registros por día
