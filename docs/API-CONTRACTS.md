# Contratos de API: InsForge Base Template

Este documento define los contratos entre el frontend (composables) y el backend (InsForge SDK).

---

## 1. Autenticacion

### 1.1 Registro

```typescript
// Composable: useAuth().signUp()
const { data, error } = await insforge.auth.signUp({
  email: string,
  password: string,
  name: string,
})

// Response exitosa
{
  data: {
    user: { id, email, emailVerified: false, profile: { name } },
    requireEmailVerification: true,
    accessToken: null
  },
  error: null
}
```

### 1.2 Verificar Email

```typescript
// Composable: useAuth().verifyEmail()
const { data, error } = await insforge.auth.verifyEmail({
  email: string,
  otp: string, // 6 digitos
})

// Response exitosa
{
  data: {
    accessToken: "eyJ...",
    user: { id, email, emailVerified: true }
  },
  error: null
}
```

### 1.3 Login

```typescript
// Composable: useAuth().signIn()
const { data, error } = await insforge.auth.signInWithPassword({
  email: string,
  password: string,
})

// Response exitosa
{
  data: {
    user: { id, email, emailVerified: true, profile: { name } },
    accessToken: "eyJ..."
  },
  error: null
}
```

### 1.4 Restaurar Sesion

```typescript
// Composable: useAuth().restoreSession()
const { data, error } = await insforge.auth.getCurrentSession()

// Response exitosa
{
  data: {
    session: {
      accessToken: "eyJ...",
      user: { id, email, profile: { name } },
      expiresAt: "2026-01-22T10:00:00.000Z"
    }
  },
  error: null
}

// Sin sesion
{ data: { session: null }, error: null }
```

### 1.5 Logout

```typescript
// Composable: useAuth().signOut()
const { error } = await insforge.auth.signOut()
```

---

## 2. Roles de Usuario

### 2.1 Obtener Rol

```typescript
// Composable: useAuth() (interno)
const { data, error } = await insforge.database
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .maybeSingle()

// Response (existe)
{ data: { role: "admin" }, error: null }

// Response (no existe -> default "user")
{ data: null, error: null }
```

### 2.2 Listar Usuarios con Roles (Admin)

```typescript
const { data, error } = await insforge.database
  .from('user_roles')
  .select('*')
  .order('user_id')
```

### 2.3 Cambiar Rol (Admin)

```typescript
// Upsert: si no existe lo crea, si existe lo actualiza
const { data, error } = await insforge.database
  .from('user_roles')
  .insert([{ user_id: userId, role: newRole }])
  .select()

// Nota: si ya existe, usar update
const { data, error } = await insforge.database
  .from('user_roles')
  .update({ role: newRole })
  .eq('user_id', userId)
  .select()
```

---

## 3. Items (Ejemplo CRUD)

### 3.1 Listar Items

```typescript
// Composable: useItems().listar()
const { data, error } = await insforge.database
  .from('items')
  .select('*')
  .order('nombre', { ascending: true })

// Response
{
  data: [
    {
      id: "uuid",
      nombre: "Item ejemplo",
      descripcion: "Descripcion del item",
      created_at: "2026-03-08T10:00:00Z",
      updated_at: "2026-03-08T10:00:00Z"
    }
  ],
  error: null
}
```

### 3.2 Obtener Item por ID

```typescript
// Composable: useItems().obtener()
const { data, error } = await insforge.database
  .from('items')
  .select('*')
  .eq('id', itemId)
  .single()
```

### 3.3 Crear Item

```typescript
// Composable: useItems().crear()
const { data, error } = await insforge.database
  .from('items')
  .insert([{
    nombre: string,
    descripcion: string | null,
  }])
  .select()
```

### 3.4 Actualizar Item

```typescript
// Composable: useItems().actualizar()
const { data, error } = await insforge.database
  .from('items')
  .update({
    nombre?: string,
    descripcion?: string,
    updated_at: new Date().toISOString()
  })
  .eq('id', itemId)
  .select()
```

### 3.5 Eliminar Item

```typescript
// Composable: useItems().eliminar()
const { error } = await insforge.database
  .from('items')
  .delete()
  .eq('id', itemId)
```

---

## 4. Storage

### Buckets

| Bucket | Acceso | Proposito |
|--------|--------|-----------|
| `documentos` | Publico | Documentos adjuntos generales |

> Agregar nuevos buckets a esta tabla al crear modulos que requieran storage.

---

## 5. Codigos de Error Comunes

| Codigo | Contexto | Significado |
|--------|----------|-------------|
| 401 | Auth | Credenciales invalidas o sesion expirada |
| 404 | Items | Item no encontrado |
| 23505 | DB | Violacion de constraint UNIQUE (PostgreSQL) |
| 23503 | DB | Violacion de FK (referencia no existe) |
| 23514 | DB | Violacion de CHECK constraint |

---

## 6. Patron para Nuevos Modulos

Al agregar un nuevo modulo CRUD, documentar aqui siguiendo este patron:

```typescript
// ## N. NombreModulo

// ### N.1 Listar
const { data, error } = await insforge.database
  .from('tabla')
  .select('*, relacion(*)')  // si tiene FK
  .order('campo', { ascending: true })

// ### N.2 Crear
const { data, error } = await insforge.database
  .from('tabla')
  .insert([{ /* campos */ }])
  .select()

// ### N.3 Actualizar
const { data, error } = await insforge.database
  .from('tabla')
  .update({ /* campos */ })
  .eq('id', id)
  .select()

// ### N.4 Eliminar
const { error } = await insforge.database
  .from('tabla')
  .delete()
  .eq('id', id)
```
