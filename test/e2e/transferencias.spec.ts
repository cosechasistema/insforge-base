import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Transferencias - Listado', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/transferencias')
    await page.waitForLoadState('networkidle')
  })

  test('page loads and shows title', async ({ page }) => {
    const title = page.locator('h1')
    await expect(title).toContainText('Transferencias')
  })

  test('summary cards are visible with real data', async ({ page }) => {
    // Wait for data to load (skeleton disappears)
    await expect(page.locator('.v-skeleton-loader')).toHaveCount(0, { timeout: 15_000 })

    // Total recibidas card
    const cards = page.locator('.v-card')
    await expect(cards.first()).toBeVisible()

    // Should show numbers > 0 (we have 50 real records)
    const totalText = page.locator('.text-h5').first()
    await expect(totalText).toBeVisible()
    const text = await totalText.textContent()
    expect(Number(text?.trim())).toBeGreaterThan(0)
  })

  test('data table renders with real transferencias', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    // Should have rows with real data
    const rows = table.locator('tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15_000 })
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('table shows correct columns', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const headers = table.locator('thead th')
    await expect(headers.nth(0)).toContainText('Fecha')
    await expect(headers.nth(1)).toContainText('Origen')
    await expect(headers.nth(2)).toContainText('CUIT')
    await expect(headers.nth(3)).toContainText('Descripcion')
    await expect(headers.nth(4)).toContainText('Monto')
    await expect(headers.nth(5)).toContainText('Estado')
  })

  test('transferencias show COMPLETED status chips', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const chips = table.locator('.v-chip')
    await expect(chips.first()).toBeVisible()
    await expect(chips.first()).toContainText('Completada')
  })

  test('montos are formatted as ARS currency', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    // Look for the $ symbol in monto cells
    const montoCell = table.locator('tbody tr').first().locator('td').nth(4)
    await expect(montoCell).toBeVisible()
    const montoText = await montoCell.textContent()
    expect(montoText).toContain('$')
  })

  test('search filters transferencias by name', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const search = page.locator('[data-testid="transferencias-search"] input')
    await search.fill('BARALE')
    await page.waitForTimeout(500)

    const rows = table.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)

    const firstRow = rows.first()
    await expect(firstRow).toContainText('BARALE')
  })

  test('search filters by CUIT', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const search = page.locator('[data-testid="transferencias-search"] input')
    await search.fill('20177733785')
    await page.waitForTimeout(500)

    const rows = table.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('search with no results shows empty state', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const search = page.locator('[data-testid="transferencias-search"] input')
    await search.fill('XYZNONEXISTENT12345')
    await page.waitForTimeout(500)

    await expect(table).toContainText('No hay transferencias registradas')
  })

  test('report button opens dialog', async ({ page }) => {
    const reportBtn = page.locator('[data-testid="transferencias-report-btn"]')
    await expect(reportBtn).toBeVisible()
    await reportBtn.click()

    const dialog = page.locator('.v-dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Reporte de Transferencias')
  })

  test('report dialog shows export buttons and summary', async ({ page }) => {
    const reportBtn = page.locator('[data-testid="transferencias-report-btn"]')
    await reportBtn.click()

    const dialog = page.locator('.v-dialog')
    await expect(dialog).toBeVisible()

    // Excel and PDF buttons
    await expect(dialog.locator('text=Excel')).toBeVisible()
    await expect(dialog.locator('text=PDF')).toBeVisible()

    // Shows total count and monto
    await expect(dialog.locator('text=transferencia(s)')).toBeVisible()
    await expect(dialog.locator('text=Total completadas')).toBeVisible()
  })
})

test.describe('Transferencias - Detalle', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/transferencias')
    await page.waitForLoadState('networkidle')
  })

  test('clicking view button navigates to detail page', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const viewBtn = page.locator('[data-testid="transferencia-view"]').first()
    await expect(viewBtn).toBeVisible()
    await viewBtn.click()

    await page.waitForURL(/\/transferencias\//)
    await expect(page).toHaveURL(/\/transferencias\/[a-f0-9-]+/)
  })

  test('detail page shows transferencia info', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const viewBtn = page.locator('[data-testid="transferencia-view"]').first()
    await viewBtn.click()
    await page.waitForURL(/\/transferencias\//)

    // Title with bind_id
    const title = page.locator('[data-testid="transferencia-detail-title"]')
    await expect(title).toBeVisible({ timeout: 10_000 })
    await expect(title).toContainText('Transferencia')

    // Monto card
    const montoCard = page.locator('.text-h3')
    await expect(montoCard).toBeVisible()
    const montoText = await montoCard.textContent()
    expect(montoText).toContain('$')

    // Status chip
    const chip = page.locator('.v-chip')
    await expect(chip).toBeVisible()
  })

  test('detail page shows origin info', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const viewBtn = page.locator('[data-testid="transferencia-view"]').first()
    await viewBtn.click()
    await page.waitForURL(/\/transferencias\//)

    await expect(page.locator('text=Origen')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('text=Nombre')).toBeVisible()
    await expect(page.locator('text=CUIT')).toBeVisible()
    await expect(page.locator('text=CBU/CVU')).toBeVisible()
  })

  test('detail page shows dates section', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const viewBtn = page.locator('[data-testid="transferencia-view"]').first()
    await viewBtn.click()
    await page.waitForURL(/\/transferencias\//)

    await expect(page.locator('text=Fechas')).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('text=Fecha inicio')).toBeVisible()
    await expect(page.locator('text=Fecha fin')).toBeVisible()
    await expect(page.locator('text=Fecha negocio')).toBeVisible()
  })

  test('detail page has raw JSON expandable', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const viewBtn = page.locator('[data-testid="transferencia-view"]').first()
    await viewBtn.click()
    await page.waitForURL(/\/transferencias\//)

    const panel = page.locator('.v-expansion-panel')
    await expect(panel).toBeVisible({ timeout: 10_000 })
    await expect(panel).toContainText('Datos raw')

    // Click to expand
    await panel.click()
    const content = page.locator('.v-expansion-panel-text pre')
    await expect(content).toBeVisible()
    const jsonText = await content.textContent()
    expect(jsonText).toContain('counterparty')
  })

  test('back button returns to list', async ({ page }) => {
    const table = page.locator('[data-testid="transferencias-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const viewBtn = page.locator('[data-testid="transferencia-view"]').first()
    await viewBtn.click()
    await page.waitForURL(/\/transferencias\//)

    const backBtn = page.locator('text=Volver a transferencias')
    await expect(backBtn).toBeVisible({ timeout: 10_000 })
    await backBtn.click()

    await page.waitForURL('/transferencias')
    await expect(page).toHaveURL(/\/transferencias$/)
  })
})

test.describe('Transferencias - Acceso', () => {
  test('requires authentication - redirects to login', async ({ page }) => {
    await page.goto('/transferencias')
    await page.waitForURL('**/login', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
