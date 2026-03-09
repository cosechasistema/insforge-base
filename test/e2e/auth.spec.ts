import { test, expect } from '@playwright/test'
import { loginAsAdmin } from './helpers/auth'

test.describe('Authentication', () => {
  test('login page renders email field, password field, and Sign In button', async ({ page }) => {
    await page.goto('/login')

    const card = page.locator('[data-testid="login-card"]')
    await expect(card).toBeVisible()

    const emailField = page.locator('[data-testid="login-email"] input')
    await expect(emailField).toBeVisible()

    const passwordField = page.locator('[data-testid="login-password"] input')
    await expect(passwordField).toBeVisible()

    const submitButton = page.locator('[data-testid="login-submit"]')
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toContainText(/iniciar sesión/i)
  })

  test('invalid credentials show error alert', async ({ page }) => {
    await page.goto('/login')

    await page.locator('[data-testid="login-email"] input').fill('wrong@example.com')
    await page.locator('[data-testid="login-password"] input').fill('WrongPassword123')
    await page.locator('[data-testid="login-submit"]').click()

    const errorAlert = page.locator('[data-testid="login-error"]')
    await expect(errorAlert).toBeVisible({ timeout: 10_000 })
    await expect(errorAlert).toContainText('Credenciales inválidas')
  })

  test('valid admin login redirects to dashboard', async ({ page }) => {
    await loginAsAdmin(page)

    await expect(page).toHaveURL('/')
    const dashboard = page.locator('[data-testid="dashboard-page"]')
    await expect(dashboard).toBeVisible()
  })

  test('dashboard shows welcome message, stat cards, and sidebar navigation', async ({ page }) => {
    await loginAsAdmin(page)

    const welcome = page.locator('[data-testid="dashboard-welcome"]')
    await expect(welcome).toBeVisible()

    const statUsers = page.locator('[data-testid="stat-users"]')
    await expect(statUsers).toBeVisible()

    const statRecords = page.locator('[data-testid="stat-records"]')
    await expect(statRecords).toBeVisible()

    const sidebar = page.locator('[data-testid="sidebar"]')
    await expect(sidebar).toBeVisible()
    await expect(sidebar).toContainText('Dashboard')
    await expect(sidebar).toContainText('Items')
    await expect(sidebar).toContainText('Users')
  })

  test('logout redirects to /login', async ({ page }) => {
    await loginAsAdmin(page)

    const logoutButton = page.locator('[data-testid="toolbar-logout"]')
    await expect(logoutButton).toBeVisible()
    await logoutButton.click()

    await page.waitForURL('**/login', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })

  test('accessing /items without auth redirects to /login', async ({ page }) => {
    await page.goto('/items')

    await page.waitForURL('**/login', { timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
