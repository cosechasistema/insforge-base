import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

const UNIQUE_SUFFIX = Date.now()
let createdItemName = `E2E-Test-${UNIQUE_SUFFIX}`

test.describe('Items CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/items')
    await page.waitForLoadState('networkidle')
  })

  test('items page shows table and heading', async ({ page }) => {
    const table = page.locator('[data-testid="items-table"]')
    await expect(table).toBeVisible()

    await expect(page.getByRole('heading').first()).toBeVisible()
  })

  test('create item via form and verify in table', async ({ page }) => {
    const newButton = page.locator('[data-testid="items-new-btn"]')
    await expect(newButton).toBeVisible()
    await newButton.click()

    const form = page.locator('[data-testid="item-form"]')
    await expect(form).toBeVisible()

    await page.locator('[data-testid="item-form-nombre"] input').fill(createdItemName)
    await page.locator('[data-testid="item-form-descripcion"] input').fill('Created by E2E test')

    await page.locator('[data-testid="item-form-submit"]').click()

    await page.waitForURL('**/items', { timeout: 10_000 })

    // Search for the created item to avoid pagination issues
    const searchInput = page.locator('[data-testid="items-search"] input')
    await searchInput.fill(createdItemName)

    const table = page.locator('[data-testid="items-table"]')
    await expect(table).toContainText(createdItemName)
  })

  test('search filters items by name', async ({ page }) => {
    const searchInput = page.locator('[data-testid="items-search"] input')
    await expect(searchInput).toBeVisible()

    await searchInput.fill(createdItemName)

    const table = page.locator('[data-testid="items-table"]')
    await expect(table).toContainText(createdItemName)
  })

  test('click view icon navigates to detail page', async ({ page }) => {
    const searchInput = page.locator('[data-testid="items-search"] input')
    await searchInput.fill(createdItemName)
    await expect(page.locator('[data-testid="items-table"]')).toContainText(createdItemName)

    const viewButton = page.locator('[data-testid="item-view"]').first()
    await expect(viewButton).toBeVisible()
    await viewButton.click()

    await page.waitForURL(/\/items\/\d+/, { timeout: 10_000 })

    const detailTitle = page.locator('[data-testid="item-detail-title"]')
    await expect(detailTitle).toBeVisible()
    await expect(detailTitle).toContainText(createdItemName)
  })

  test('edit item name and verify updated', async ({ page }) => {
    const updatedName = `${createdItemName}-edited`

    // Search and navigate to detail
    const searchInput = page.locator('[data-testid="items-search"] input')
    await searchInput.fill(createdItemName)
    await expect(page.locator('[data-testid="items-table"]')).toContainText(createdItemName)

    const viewButton = page.locator('[data-testid="item-view"]').first()
    await viewButton.click()
    await page.waitForURL(/\/items\/\d+/, { timeout: 10_000 })

    // Update the name field
    const nombreField = page.locator('[data-testid="item-form-nombre"] input')
    await nombreField.clear()
    await nombreField.fill(updatedName)

    await page.locator('[data-testid="item-form-submit"]').click()

    await page.waitForURL('**/items', { timeout: 10_000 })

    // Verify the updated name in the table
    const listSearch = page.locator('[data-testid="items-search"] input')
    await listSearch.fill(updatedName)

    const table = page.locator('[data-testid="items-table"]')
    await expect(table).toContainText(updatedName)

    // Update the tracked name for subsequent tests
    createdItemName = updatedName
  })

  test('delete item with confirmation and verify removed', async ({ page }) => {
    const searchInput = page.locator('[data-testid="items-search"] input')
    await searchInput.fill(createdItemName)
    await expect(page.locator('[data-testid="items-table"]')).toContainText(createdItemName)

    const deleteButton = page.locator('[data-testid="item-delete"]').first()
    await expect(deleteButton).toBeVisible()
    await deleteButton.click()

    // Handle confirmation dialog (Vuetify dialog or native)
    const confirmButton = page.locator('.v-dialog').getByRole('button', { name: /eliminar|confirmar|aceptar|delete|ok/i })
    if (await confirmButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await confirmButton.click()
    }

    // Verify item is removed from the table
    await expect(page.locator('[data-testid="items-table"]')).not.toContainText(createdItemName, { timeout: 10_000 })
  })
})
