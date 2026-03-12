import type { SyncLog } from '~/types'

export function useSyncLog() {
  const insforge = useInsforge()
  const logs = ref<SyncLog[]>([])
  const loading = ref(false)

  async function listar() {
    loading.value = true
    try {
      const { data, error } = await insforge.database
        .from('bind_sync_log')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        logs.value = data as SyncLog[]
      }
      return { data, error }
    }
    finally {
      loading.value = false
    }
  }

  return {
    logs: readonly(logs),
    loading: readonly(loading),
    listar,
  }
}
