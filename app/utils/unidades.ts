export const UNIDADES_MEDIDA = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'l', label: 'Litros (l)' },
  { value: 'unidad', label: 'Unidades' },
  { value: 'cucharada', label: 'Cucharadas' },
  { value: 'cucharadita', label: 'Cucharaditas' },
  { value: 'taza', label: 'Tazas' },
] as const

export type UnidadMedida = typeof UNIDADES_MEDIDA[number]['value']

export function getLabelUnidad(value: string): string {
  return UNIDADES_MEDIDA.find(u => u.value === value)?.label ?? value
}
