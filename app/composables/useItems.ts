import type { Item, ItemCreate, ItemUpdate } from '~/types'

export function useItems() {
  const insforge = useInsforge()
  const items = ref<Item[]>([])
  const loading = ref(false)

  async function listar() {
    loading.value = true
    try {
      const { data, error } = await insforge.database
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        items.value = data as Item[]
      }
      return { data, error }
    }
    finally {
      loading.value = false
    }
  }

  async function obtener(id: string) {
    const { data, error } = await insforge.database
      .from('items')
      .select('*')
      .eq('id', id)
      .single()

    return { data: data as Item | null, error }
  }

  async function crear(item: ItemCreate) {
    const { data, error } = await insforge.database
      .from('items')
      .insert([item])
      .select()

    if (!error) await listar()
    return { data, error }
  }

  async function actualizar(id: string, cambios: ItemUpdate) {
    const { data, error } = await insforge.database
      .from('items')
      .update({ ...cambios, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (!error) await listar()
    return { data, error }
  }

  async function eliminar(id: string) {
    const { error } = await insforge.database
      .from('items')
      .delete()
      .eq('id', id)

    if (!error) await listar()
    return { error }
  }

  return {
    items: readonly(items),
    loading: readonly(loading),
    listar,
    obtener,
    crear,
    actualizar,
    eliminar,
  }
}
