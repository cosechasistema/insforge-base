import { test, expect } from '@playwright/test'
import { loginAsAdmin, loginAsUser } from './helpers/auth'

test.describe('Auth', () => {
  test('login page is accessible without authentication', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Sign In')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.locator('input[type="email"]').fill('fake@email.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.locator('.v-alert')).toBeVisible({ timeout: 10_000 })
  })

  test('successful login as admin redirects to home', async ({ page }) => {
    await loginAsAdmin(page)
    await expect(page).toHaveURL(/\/$/)
  })

  test('successful login as user redirects to home', async ({ page }) => {
    await loginAsUser(page)
    await expect(page).toHaveURL(/\/$/)
  })

  test('logout clears session and redirects to /login', async ({ page }) => {
    await loginAsAdmin(page)

    const logoutBtn = page.locator('[data-testid="logout-btn"]')
      .or(page.getByRole('button', { name: /sign out|logout/i }))
      .or(page.locator('.mdi-logout').locator('..'))

    await logoutBtn.first().click()
    await page.waitForURL('**/login', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('protected routes redirect to /login without session', async ({ page }) => {
    await page.goto('/items')
    await page.waitForURL('**/login', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('register page is accessible and shows form', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('Create Account')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible()
  })
})
