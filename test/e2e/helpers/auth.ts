import type { Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.locator('[data-testid="login-email"] input').fill('admin-test@insforgebase.com')
  await page.locator('[data-testid="login-password"] input').fill('TestAdmin1234')
  await page.locator('[data-testid="login-submit"]').click()
  await page.waitForURL('/')
}
