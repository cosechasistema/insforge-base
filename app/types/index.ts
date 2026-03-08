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
