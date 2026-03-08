import { describe, it, expect } from 'vitest'

/**
 * Tests the multi-field filtering logic for items.
 * Original logic in: app/pages/items/index.vue (computed itemsFiltered)
 */

interface ItemForFilter {
  nombre: string
  descripcion: string | null
}

function filtrarItems(items: ItemForFilter[], query: string): ItemForFilter[] {
  const q = query.toLowerCase().trim()
  if (!q) return items

  return items.filter((item) => {
    return item.nombre.toLowerCase().includes(q)
      || (item.descripcion && item.descripcion.toLowerCase().includes(q))
  })
}

const mockItems: ItemForFilter[] = [
  { nombre: 'Laptop Dell XPS', descripcion: 'Laptop ultrabook 13 pulgadas' },
  { nombre: 'Mouse Logitech', descripcion: 'Mouse inalambrico ergonomico' },
  { nombre: 'Teclado Mecanico', descripcion: 'Switches Cherry MX Blue' },
  { nombre: 'Monitor Samsung', descripcion: null },
]

describe('ItemFilters', () => {
  it('returns all items with empty query', () => {
    expect(filtrarItems(mockItems, '')).toHaveLength(4)
    expect(filtrarItems(mockItems, '   ')).toHaveLength(4)
  })

  it('filters by nombre', () => {
    const result = filtrarItems(mockItems, 'laptop')
    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Laptop Dell XPS')
  })

  it('filters by descripcion', () => {
    const result = filtrarItems(mockItems, 'ergonomico')
    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Mouse Logitech')
  })

  it('is case-insensitive', () => {
    expect(filtrarItems(mockItems, 'TECLADO')).toHaveLength(1)
    expect(filtrarItems(mockItems, 'teclado')).toHaveLength(1)
    expect(filtrarItems(mockItems, 'Teclado')).toHaveLength(1)
  })

  it('returns empty array when no match', () => {
    expect(filtrarItems(mockItems, 'impresora')).toHaveLength(0)
  })

  it('handles item with null descripcion', () => {
    const result = filtrarItems(mockItems, 'samsung')
    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Monitor Samsung')

    // Should not crash when searching description terms on null descripcion items
    expect(filtrarItems(mockItems, 'cherry')).toHaveLength(1)
  })

  it('matches partial strings', () => {
    const result = filtrarItems(mockItems, 'logi')
    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Mouse Logitech')
  })

  it('matches across nombre and descripcion fields', () => {
    // "ultra" matches descripcion of Laptop
    const result = filtrarItems(mockItems, 'ultra')
    expect(result).toHaveLength(1)
    expect(result[0].nombre).toBe('Laptop Dell XPS')
  })
})
