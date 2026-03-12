import type { Transferencia } from '~/types'

export function useTransferencias() {
  const insforge = useInsforge()
  const transferencias = ref<Transferencia[]>([])
  const loading = ref(false)

  async function listar() {
    loading.value = true
    try {
      const { data, error } = await insforge.database
        .from('bind_transferencias')
        .select('*')
        .order('fecha_inicio', { ascending: false })

      if (!error && data) {
        transferencias.value = data as Transferencia[]
      }
      return { data, error }
    }
    finally {
      loading.value = false
    }
  }

  async function obtener(id: string) {
    const { data, error } = await insforge.database
      .from('bind_transferencias')
      .select('*')
      .eq('id', id)
      .single()

    return { data: data as Transferencia | null, error }
  }

  return {
    transferencias: readonly(transferencias),
    loading: readonly(loading),
    listar,
    obtener,
  }
}
