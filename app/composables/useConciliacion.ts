import type { ConciliacionMatch, ConciliacionStats } from '~/types'
import { calcularMatches } from '~/utils/matching'

export function useConciliacion() {
  const { controles, loading: loadingControles, listar: listarControles, verificar } = useControlTransferencias()
  const { transferencias, loading: loadingTransferencias, listar: listarTransferencias } = useTransferencias()

  const matches = ref<ConciliacionMatch[]>([])
  const loading = computed(() => loadingControles.value || loadingTransferencias.value)
  const filtroCategoria = ref<'todos' | 'sugerido' | 'posible' | 'sin_match'>('todos')

  const stats = computed<ConciliacionStats>(() => {
    const pendientes = matches.value.filter(m => m.control.verificado !== 'si')
    return {
      totalPendientes: pendientes.length,
      sugeridos: pendientes.filter(m => m.category === 'sugerido').length,
      posibles: pendientes.filter(m => m.category === 'posible').length,
      sinMatch: pendientes.filter(m => m.category === 'sin_match').length,
      verificadosHoy: controles.value.filter((c) => {
        if (c.verificado !== 'si' || !c.verificado_date_sql) return false
        const today = new Date().toISOString().split('T')[0]
        return c.verificado_date_sql.startsWith(today)
      }).length,
    }
  })

  const matchesFiltrados = computed(() => {
    if (filtroCategoria.value === 'todos') return matches.value
    return matches.value.filter(m => m.category === filtroCategoria.value)
  })

  async function cargar() {
    await Promise.all([
      listarControles('no'),
      listarTransferencias(),
    ])

    const matchedIds = new Set(
      controles.value
        .filter(c => c.bind_match_id)
        .map(c => c.bind_match_id!),
    )

    matches.value = calcularMatches(controles.value, transferencias.value, matchedIds)
  }

  async function confirmarMatch(controlId: number, bindMatchId: string, score: number, reasons: string[]) {
    await verificar(controlId, bindMatchId, score, reasons.join(' + '))
    await cargar()
  }

  return {
    matches: readonly(matches),
    matchesFiltrados,
    stats,
    loading,
    filtroCategoria,
    cargar,
    confirmarMatch,
  }
}
