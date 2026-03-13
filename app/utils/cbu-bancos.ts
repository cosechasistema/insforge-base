export const CBU_BANCO_MAP: Record<string, string> = {
  '011': 'Banco Nacion',
  '014': 'Banco Provincia',
  '017': 'BBVA',
  '027': 'Banco Supervielle',
  '029': 'Banco Ciudad',
  '034': 'Banco Patagonia',
  '044': 'Banco Hipotecario',
  '072': 'Banco Santander',
  '083': 'Banco Chubut',
  '086': 'Banco Santa Cruz',
  '093': 'Banco de la Pampa',
  '094': 'Banco Corrientes',
  '097': 'Banco del Chaco',
  '150': 'HSBC',
  '191': 'Banco Credicoop',
  '247': 'Banco Roela',
  '259': 'Banco Itau',
  '266': 'Banco BMA',
  '285': 'Banco Macro',
  '299': 'Banco Comafi',
  '300': 'Banco de Inversion y Comercio Exterior',
  '303': 'Banco Finansur',
  '305': 'Banco Galicia',
  '309': 'Banco Nacion (Sucursal)',
  '310': 'Banco del Sol',
  '315': 'Banco del Chaco',
  '321': 'Banco Santiago del Estero',
  '322': 'Banco Industrial',
  '330': 'Banco Santa Fe',
  '338': 'Banco de Servicios y Transacciones',
  '341': 'Banco Mas Ventas',
  '386': 'Banco Nacion Fideicomiso',
  '389': 'Banco Columbia',
  '405': 'Banco Galicia',
  '007': 'Banco Galicia',
}

// CVU prefixes (fintechs) — longer prefix needed
export const CVU_PREFIXES: Record<string, string> = {
  '0000003100': 'Mercado Pago',
  '0000007900': 'Uala',
  '0000006200': 'Personal Pay',
  '0000004400': 'Naranja X',
  '0000005500': 'Prex',
}

/**
 * Resolve bank name from CBU/CVU string
 */
export function resolverBanco(cbu: string): string | null {
  if (!cbu || cbu.length < 3) return null

  // Try CVU prefixes first (longer match)
  for (const [prefix, banco] of Object.entries(CVU_PREFIXES)) {
    if (cbu.startsWith(prefix)) return banco
  }

  // Try CBU 3-digit prefix
  const prefix3 = cbu.substring(0, 3)
  return CBU_BANCO_MAP[prefix3] || null
}
