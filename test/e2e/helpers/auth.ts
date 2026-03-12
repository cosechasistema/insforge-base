import type { Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  const email = process.env.TEST_ADMIN_EMAIL || 'admin-test@bindmutual.com'
  const password = process.env.TEST_ADMIN_PASSWORD || 'TestAdmin1234'
  await page.goto('/login')
  await page.locator('[data-testid="login-email"] input').waitFor({ timeout: 30_000 })
  await page.locator('[data-testid="login-email"] input').fill(email)
  await page.locator('[data-testid="login-password"] input').fill(password)
  await page.locator('[data-testid="login-submit"]').click()
  await page.waitForURL('/')
}
