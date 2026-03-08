import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Admin Users', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('navigate to /admin/users and verify table columns', async ({ page }) => {
    await page.goto('/admin/users')

    const table = page.locator('[data-testid="users-table"]')
    await expect(table).toBeVisible()

    await expect(table).toContainText('User ID')
    await expect(table).toContainText('Rol')
    await expect(table).toContainText('Creado')
    await expect(table).toContainText('Acciones')
  })

  test('table shows at least 1 user', async ({ page }) => {
    await page.goto('/admin/users')

    const table = page.locator('[data-testid="users-table"]')
    await expect(table).toBeVisible()

    const rows = table.locator('tbody tr')
    await expect(rows).not.toHaveCount(0)
    expect(await rows.count()).toBeGreaterThanOrEqual(1)
  })

  test('toggle role buttons are present', async ({ page }) => {
    await page.goto('/admin/users')

    const toggleButtons = page.locator('[data-testid="toggle-role"]')
    await expect(toggleButtons.first()).toBeVisible()

    const buttonText = await toggleButtons.first().textContent()
    expect(buttonText).toMatch(/Hacer admin|Quitar admin/)
  })
})
