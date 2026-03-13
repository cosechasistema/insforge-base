import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Conciliacion - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/conciliacion')
    await page.waitForLoadState('networkidle', { timeout: 60_000 })
  })

  test('page loads and shows title', { timeout: 90_000 }, async ({ page }) => {
    const title = page.locator('h1')
    await expect(title).toContainText('Conciliacion', { timeout: 15_000 })
  })

  test('page has correct data-testid', async ({ page }) => {
    const container = page.locator('[data-testid="conciliacion-page"]')
    await expect(container).toBeVisible()
  })

  test('stats cards are visible', async ({ page }) => {
    const stats = page.locator('[data-testid="conciliacion-stats"]')
    await expect(stats).toBeVisible()

    await expect(stats).toContainText('Total pendientes')
    await expect(stats).toContainText('Sugeridos')
    await expect(stats).toContainText('Posibles')
    await expect(stats).toContainText('Sin match')
    await expect(stats).toContainText('Verificados hoy')
  })

  test('stats show numeric values', async ({ page }) => {
    await expect(page.locator('.v-skeleton-loader')).toHaveCount(0, { timeout: 15_000 })

    const stats = page.locator('[data-testid="conciliacion-stats"]')
    const numbers = stats.locator('.text-h5')
    await expect(numbers.first()).toBeVisible()

    const count = await numbers.count()
    expect(count).toBe(5)
  })

  test('sync button is visible and functional', async ({ page }) => {
    const btn = page.locator('[data-testid="conciliacion-sync-btn"]')
    await expect(btn).toBeVisible()
    await expect(btn).toContainText('Sincronizar MySQL')
  })

  test('sync button becomes disabled after click', async ({ page }) => {
    const btn = page.locator('[data-testid="conciliacion-sync-btn"]')
    await expect(btn).toBeVisible()
    await expect(btn).toBeEnabled()

    await btn.click()

    await expect(btn).toContainText('Sincronizacion enviada')
    await expect(btn).toBeDisabled()
  })

  test('filter chips are visible', async ({ page }) => {
    const filters = page.locator('[data-testid="conciliacion-filter"]')
    await expect(filters).toBeVisible()

    await expect(filters).toContainText('Todos')
    await expect(filters).toContainText('Sugeridos')
    await expect(filters).toContainText('Posibles')
    await expect(filters).toContainText('Sin match')
  })

  test('filter chips are clickable', async ({ page }) => {
    const filterGroup = page.locator('[data-testid="conciliacion-filter"]')

    // Click Sugeridos chip — Vuetify uses selected-class="text-primary"
    const sugeridosChip = filterGroup.locator('.v-chip', { hasText: 'Sugeridos' })
    await sugeridosChip.click()
    await expect(sugeridosChip).toHaveClass(/text-primary/)

    // Click back to Todos
    const todosChip = filterGroup.locator('.v-chip', { hasText: 'Todos' })
    await todosChip.click()
    await expect(todosChip).toHaveClass(/text-primary/)
  })

  test('data table renders', async ({ page }) => {
    const table = page.locator('[data-testid="conciliacion-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })
  })

  test('table shows correct columns', async ({ page }) => {
    const table = page.locator('[data-testid="conciliacion-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const headers = table.locator('thead th')
    await expect(headers.nth(0)).toContainText('Fecha')
    await expect(headers.nth(1)).toContainText('Nombre')
    await expect(headers.nth(2)).toContainText('Monto')
    await expect(headers.nth(3)).toContainText('Banco')
    await expect(headers.nth(4)).toContainText('Match')
    await expect(headers.nth(5)).toContainText('Score')
    await expect(headers.nth(6)).toContainText('Acciones')
  })

  test('table shows real data from sync', async ({ page }) => {
    const table = page.locator('[data-testid="conciliacion-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    await expect(page.locator('.v-skeleton-loader')).toHaveCount(0, { timeout: 15_000 })

    const rows = table.locator('tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15_000 })
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('table rows show category chips', async ({ page }) => {
    const table = page.locator('[data-testid="conciliacion-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.v-skeleton-loader')).toHaveCount(0, { timeout: 15_000 })

    const rows = table.locator('tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15_000 })

    const chip = table.locator('.v-chip').first()
    await expect(chip).toBeVisible()
  })

  test('montos are formatted as ARS currency', async ({ page }) => {
    const table = page.locator('[data-testid="conciliacion-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.v-skeleton-loader')).toHaveCount(0, { timeout: 15_000 })

    const rows = table.locator('tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15_000 })

    const montoCell = rows.first().locator('td').nth(2)
    await expect(montoCell).toBeVisible()
    const montoText = await montoCell.textContent()
    expect(montoText).toContain('$')
  })

  test('clicking detail button opens dialog', async ({ page }) => {
    const table = page.locator('[data-testid="conciliacion-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.v-skeleton-loader')).toHaveCount(0, { timeout: 15_000 })

    const rows = table.locator('tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15_000 })

    const detailBtn = page.locator('[data-testid="conciliacion-detail-btn"]').first()
    await detailBtn.click()

    const dialog = page.locator('.v-dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Detalle de conciliacion')
  })

  test('detail dialog shows control and BIND comparison', async ({ page }) => {
    const table = page.locator('[data-testid="conciliacion-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('.v-skeleton-loader')).toHaveCount(0, { timeout: 15_000 })

    const rows = table.locator('tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15_000 })

    const detailBtn = page.locator('[data-testid="conciliacion-detail-btn"]').first()
    await detailBtn.click()

    const dialog = page.locator('.v-dialog')
    await expect(dialog).toBeVisible()

    // Control section
    await expect(dialog).toContainText('Registro MySQL')
    await expect(dialog).toContainText('Monto')
    await expect(dialog).toContainText('Nombre')

    // Close dialog
    await dialog.locator('text=Cerrar').click()
    await expect(dialog).not.toBeVisible()
  })
})

test.describe('Conciliacion - Acceso', () => {
  test('requires authentication - redirects to login', async ({ page }) => {
    await page.goto('/conciliacion')
    await page.waitForURL('**/login', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
