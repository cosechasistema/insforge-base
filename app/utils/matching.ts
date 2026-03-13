import type { ControlTransferencia, ConciliacionMatch, Transferencia } from '~/types'
import { resolverBanco } from './cbu-bancos'

/**
 * Parse nombre from concepto field
 * Format: "4812/1 spahn estela irene pago cuota $ 229200.00"
 */
export function parseNombreFromConcepto(concepto: string): string | null {
  if (!concepto) return null
  const match = concepto.match(/^\d+\/\d+\s+(.+?)\s+pago\s/i)
  return match ? match[1].trim().toUpperCase() : null
}

/**
 * Normalize a name for comparison: uppercase, remove accents, trim
 */
export function normalizarNombre(nombre: string): string {
  return nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate word overlap similarity between two names (0-1)
 */
export function similaridadNombres(a: string, b: string): number {
  if (!a || !b) return 0
  const wordsA = new Set(normalizarNombre(a).split(' '))
  const wordsB = new Set(normalizarNombre(b).split(' '))

  let matches = 0
  for (const word of wordsA) {
    if (wordsB.has(word)) matches++
  }

  const total = Math.max(wordsA.size, wordsB.size)
  return total === 0 ? 0 : matches / total
}

/**
 * Compare banco_origen text with resolved banco from CBU
 */
export function matchBanco(origenCbu: string, bancoOrigenMySQL: string): boolean {
  if (!origenCbu || !bancoOrigenMySQL) return false
  const bancoResuelto = resolverBanco(origenCbu)
  if (!bancoResuelto) return false

  const normalA = normalizarNombre(bancoResuelto)
  const normalB = normalizarNombre(bancoOrigenMySQL)

  // Check if one contains the other (e.g., "Banco Nacion" vs "BANCO DE LA NACION ARGENTINA")
  return normalA.includes(normalB) || normalB.includes(normalA)
    || normalA.split(' ').some(w => w.length > 3 && normalB.includes(w))
}

/**
 * Score date proximity between BIND fecha_negocio and MySQL fecha
 */
export function scoreDate(fechaBind: string, fechaMySQL: string): number {
  const dBind = new Date(fechaBind)
  const dMySQL = new Date(fechaMySQL)
  const diffDays = Math.abs(Math.round((dBind.getTime() - dMySQL.getTime()) / (1000 * 60 * 60 * 24)))

  if (diffDays === 0) return 35
  if (diffDays === 1) return 25
  if (diffDays === 2) return 15
  return 0
}

/**
 * Main matching function — find best BIND match for each control record
 */
export function calcularMatches(
  controles: ControlTransferencia[],
  transferencias: Transferencia[],
  matchedBindIds: Set<string> = new Set()
): ConciliacionMatch[] {
  const results: ConciliacionMatch[] = []

  for (const control of controles) {
    // Only unverified records
    if (control.verificado === 'si') continue

    // Hard gate: exact monto match (filter candidates)
    const candidates = transferencias.filter(t =>
      Number(t.monto) === Number(control.monto)
      && !matchedBindIds.has(t.id)
    )

    if (candidates.length === 0) {
      results.push({
        control,
        bindMatch: null,
        score: 0,
        reasons: [],
        category: 'sin_match',
      })
      continue
    }

    let bestMatch: Transferencia | null = null
    let bestScore = 0
    let bestReasons: string[] = []

    for (const candidate of candidates) {
      let score = 50 // monto matched
      const reasons: string[] = ['Monto exacto']

      // Date scoring
      const fechaScore = scoreDate(candidate.fecha_negocio || candidate.fecha_inicio, control.fecha)
      if (fechaScore > 0) {
        score += fechaScore
        reasons.push(fechaScore === 35 ? 'Misma fecha' : fechaScore === 25 ? 'Fecha ±1 dia' : 'Fecha ±2 dias')
      }

      // Banco scoring
      if (matchBanco(candidate.origen_cbu, control.banco_origen)) {
        score += 15
        reasons.push('Banco coincide')
      }

      // Nombre scoring (prefer socio_nombre > nombre_parseado > concepto parse)
      const nombreControl = control.socio_nombre || control.nombre_parseado || parseNombreFromConcepto(control.concepto)
      if (nombreControl && candidate.origen_nombre) {
        const sim = similaridadNombres(candidate.origen_nombre, nombreControl)
        if (sim >= 0.7) {
          score += 10
          reasons.push(`Nombre similar (${Math.round(sim * 100)}%)`)
        }
      }

      if (score > bestScore) {
        bestScore = score
        bestMatch = candidate
        bestReasons = reasons
      }
    }

    const category = bestScore >= 75 ? 'sugerido' : bestScore >= 50 ? 'posible' : 'sin_match'

    results.push({
      control,
      bindMatch: bestMatch,
      score: bestScore,
      reasons: bestReasons,
      category,
    })
  }

  return results.sort((a, b) => b.score - a.score)
}
