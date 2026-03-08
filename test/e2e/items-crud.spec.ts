import { test, expect } from '@playwright/test'
import { loginAsAdmin, navigateClientSide } from './helpers/auth'
import { cleanupTestData } from './helpers/cleanup'

const UNIQUE_SUFFIX = Date.now()

test.describe('Items CRUD', () => {
  test.beforeAll(async () => {
    await cleanupTestData()
  })

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await navigateClientSide(page, '/items')
    await page.waitForLoadState('networkidle')
  })

  test('items page shows heading and table', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Items' })).toBeVisible()
    await expect(page.locator('.v-data-table')).toBeVisible()
  })

  test('create a new item', async ({ page }) => {
    const itemName = `E2E Test Item ${UNIQUE_SUFFIX}`

    // Click "Nuevo Item" button
    await page.getByRole('button', { name: 'Nuevo Item' }).click()
    await expect(page.getByText('Nuevo Item')).toBeVisible()

    // Fill the form
    await page.locator('.v-dialog input').first().fill(itemName)
    await page.locator('.v-dialog textarea').first().fill('E2E test description')

    // Submit
    await page.getByRole('button', { name: 'Crear item' }).click()

    // Verify success snackbar
    await expect(page.locator('.v-snackbar')).toContainText('creado correctamente', { timeout: 10_000 })

    // Use search post-create to find the item (avoids pagination flakiness)
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill(itemName)
    await expect(page.locator('.v-data-table')).toContainText(itemName)
  })

  test('search for item by name', async ({ page }) => {
    const itemName = `E2E Test Item ${UNIQUE_SUFFIX}`

    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill(itemName)
    await expect(page.locator('.v-data-table')).toContainText(itemName)

    // Clear search and verify table resets
    await searchInput.clear()
    await expect(page.locator('.v-data-table')).toBeVisible()
  })

  test('view item detail', async ({ page }) => {
    const itemName = `E2E Test Item ${UNIQUE_SUFFIX}`

    // Search for the item first
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill(itemName)
    await expect(page.locator('.v-data-table')).toContainText(itemName)

    // Click view (eye icon) on the first matching row
    await page.locator('.v-data-table .mdi-eye').first().click()

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/items\//)
    await expect(page.getByText(itemName)).toBeVisible()
  })

  test('edit an item from detail page', async ({ page }) => {
    const itemName = `E2E Test Item ${UNIQUE_SUFFIX}`
    const updatedName = `Updated E2E Item ${UNIQUE_SUFFIX}`

    // Search and navigate to detail
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill(itemName)
    await expect(page.locator('.v-data-table')).toContainText(itemName)
    await page.locator('.v-data-table .mdi-eye').first().click()
    await expect(page).toHaveURL(/\/items\//)

    // The detail page shows an inline form — update the name
    const nameInput = page.locator('input').first()
    await nameInput.clear()
    await nameInput.fill(updatedName)

    await page.getByRole('button', { name: 'Guardar cambios' }).click()
    await expect(page.locator('.v-snackbar')).toContainText('actualizado correctamente', { timeout: 10_000 })

    // Go back and verify the updated name via search
    await navigateClientSide(page, '/items')
    await page.waitForLoadState('networkidle')
    const listSearch = page.locator('input[placeholder*="Buscar"]')
    await listSearch.fill(updatedName)
    await expect(page.locator('.v-data-table')).toContainText(updatedName)
  })

  test('delete an item with confirmation', async ({ page }) => {
    const updatedName = `Updated E2E Item ${UNIQUE_SUFFIX}`

    // Search for the item
    const searchInput = page.locator('input[placeholder*="Buscar"]')
    await searchInput.fill(updatedName)
    await expect(page.locator('.v-data-table')).toContainText(updatedName)

    // Click delete icon on the first matching row
    await page.locator('.v-data-table .mdi-delete').first().click()

    // Confirmation dialog should appear
    await expect(page.getByText('Confirmar eliminacion')).toBeVisible()

    // Click "Eliminar" to confirm
    await page.locator('.v-dialog').getByRole('button', { name: 'Eliminar' }).click()

    // Verify success snackbar
    await expect(page.locator('.v-snackbar')).toContainText('eliminado correctamente', { timeout: 10_000 })

    // Verify item is gone from the list
    await searchInput.fill(updatedName)
    await expect(page.locator('.v-data-table')).not.toContainText(updatedName)
  })
})
