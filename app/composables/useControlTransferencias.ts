import type { ControlTransferencia } from '~/types'

export function useControlTransferencias() {
  const insforge = useInsforge()
  const controles = ref<ControlTransferencia[]>([])
  const loading = ref(false)

  async function listar(verificado?: string) {
    loading.value = true
    try {
      let query = insforge.database
        .from('control_transferencia_sync')
        .select('*')
        .order('fecha', { ascending: false })

      if (verificado) {
        query = query.eq('verificado', verificado)
      }

      const { data, error } = await query

      if (!error && data) {
        controles.value = data as ControlTransferencia[]
      }
      return { data, error }
    }
    finally {
      loading.value = false
    }
  }

  async function verificar(id: number, bindMatchId: string, score: number, reason: string) {
    const { error } = await insforge.database
      .from('control_transferencia_sync')
      .update({
        bind_match_id: bindMatchId,
        match_score: score,
        match_reason: reason,
        verificado: 'si',
        verificado_date_sql: new Date().toISOString(),
      })
      .eq('idcontrol_transferencia', id)

    if (!error) {
      await listar()
    }
    return { error }
  }

  return {
    controles: readonly(controles),
    loading: readonly(loading),
    listar,
    verificar,
  }
}
