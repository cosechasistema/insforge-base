// Auth types
export interface UserRole {
  user_id: string
  role: 'admin' | 'user'
}

export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  profile: {
    name: string | null
    avatar_url: string | null
  }
}

// Items (example CRUD)
export interface Item {
  id: string
  nombre: string
  descripcion: string | null
  created_at: string
  updated_at: string
}

export type ItemCreate = Pick<Item, 'nombre'> & Partial<Pick<Item, 'descripcion'>>
export type ItemUpdate = Partial<Pick<Item, 'nombre' | 'descripcion'>>

// BIND Transferencias (READ-ONLY)
export interface Transferencia {
  id: string
  bind_id: string
  tipo: string
  estado: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'UNKNOWN' | 'UNKNOWN_FOREVER'
  monto: number
  moneda: string
  descripcion: string | null
  concepto: string | null
  origen_nombre: string | null
  origen_cbu: string | null
  origen_cuit: string | null
  destino_cuenta: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  fecha_negocio: string | null
  datos_raw: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

// BIND Sync Log (READ-ONLY)
export interface SyncLog {
  id: string
  tipo_sync: string
  estado: string
  registros: number
  nuevos: number
  actualizados: number
  errores: number
  detalle_error: string | null
  fecha_desde: string | null
  fecha_hasta: string | null
  duracion_ms: number | null
  created_at: string
}
