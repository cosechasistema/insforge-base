import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/items')
  })

  test('click Reporte button opens dialog with preview table', async ({ page }) => {
    const reportButton = page.locator('[data-testid="items-report-btn"]')
    await expect(reportButton).toBeVisible()
    await reportButton.click()

    const dialog = page.locator('.v-dialog')
    await expect(dialog).toBeVisible()

    const previewTable = dialog.locator('table')
    await expect(previewTable).toBeVisible()
  })

  test('dialog has Excel and PDF export buttons', async ({ page }) => {
    const reportButton = page.locator('[data-testid="items-report-btn"]')
    await reportButton.click()

    const dialog = page.locator('.v-dialog')
    await expect(dialog).toBeVisible()

    const excelButton = dialog.getByRole('button', { name: /excel/i })
    await expect(excelButton).toBeVisible()

    const pdfButton = dialog.getByRole('button', { name: /pdf/i })
    await expect(pdfButton).toBeVisible()
  })

  test('close dialog works', async ({ page }) => {
    const reportButton = page.locator('[data-testid="items-report-btn"]')
    await reportButton.click()

    const dialog = page.locator('.v-dialog')
    await expect(dialog).toBeVisible()

    const closeButton = dialog.getByRole('button', { name: /cerrar|close|cancelar/i })
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click()
    } else {
      await page.keyboard.press('Escape')
    }

    await expect(dialog).not.toBeVisible()
  })
})
