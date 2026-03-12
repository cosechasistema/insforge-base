import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Sync Logs - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/sync-logs')
    await page.waitForLoadState('networkidle', { timeout: 60_000 })
  })

  test('page loads and shows title', async ({ page }) => {
    const title = page.locator('h1')
    await expect(title).toContainText('Sync Logs')
  })

  test('sync trigger button is visible', async ({ page }) => {
    const btn = page.locator('[data-testid="sync-trigger-btn"]')
    await expect(btn).toBeVisible()
    await expect(btn).toContainText('Sincronizar ahora')
  })

  test('ultimo sync card shows data from real sync logs', async ({ page }) => {
    // We have real sync logs from webhook test
    await expect(page.locator('.v-skeleton-loader')).toHaveCount(0, { timeout: 15_000 })

    // Should show last sync info
    const ultimoSync = page.locator('text=Ultima sincronizacion')
    await expect(ultimoSync).toBeVisible()
  })

  test('sync logs table renders with real data', async ({ page }) => {
    const table = page.locator('[data-testid="sync-logs-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const rows = table.locator('tbody tr')
    await expect(rows.first()).toBeVisible({ timeout: 15_000 })
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('sync logs show OK status chips', async ({ page }) => {
    const table = page.locator('[data-testid="sync-logs-table"]')
    await expect(table).toBeVisible({ timeout: 15_000 })

    const chip = table.locator('.v-chip').first()
    await expect(chip).toBeVisible()
    await expect(chip).toContainText('OK')
  })

  test('cron info card is visible', async ({ page }) => {
    await expect(page.locator('text=Configuracion del cron')).toBeVisible()
    await expect(page.locator('text=10:00 AM (Argentina)')).toBeVisible()
  })

  test('sync button becomes disabled after click', async ({ page }) => {
    const btn = page.locator('[data-testid="sync-trigger-btn"]')
    await expect(btn).toBeVisible()
    await expect(btn).toBeEnabled()

    await btn.click()

    // Button should show different text and be disabled
    await expect(btn).toContainText('Sincronizacion enviada')
    await expect(btn).toBeDisabled()
  })
})

test.describe('Sync Logs - Acceso', () => {
  test('requires authentication - redirects to login', async ({ page }) => {
    await page.goto('/sync-logs')
    await page.waitForURL('**/login', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
