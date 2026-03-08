import type { Page } from '@playwright/test'

export async function loginAsAdmin(page: Page) {
  await login(page, {
    email: process.env.TEST_ADMIN_EMAIL!,
    password: process.env.TEST_ADMIN_PASSWORD!,
  })
}

export async function loginAsUser(page: Page) {
  await login(page, {
    email: process.env.TEST_USER_EMAIL!,
    password: process.env.TEST_USER_PASSWORD!,
  })
}

/**
 * Navigate client-side using Vue Router (avoids full reload that loses auth in SSR).
 * Only use AFTER login (when the app is already hydrated).
 */
export async function navigateClientSide(page: Page, path: string) {
  await page.evaluate((p) => {
    const nuxtEl = document.querySelector('#__nuxt') as any
    const router = nuxtEl?.__vue_app__?.config?.globalProperties?.$router
    if (router) {
      router.push(p)
    }
  }, path)
  await page.waitForURL(`**${path}`, { timeout: 10_000 })
  await page.waitForLoadState('networkidle')
}

async function login(page: Page, credentials: { email: string; password: string }) {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]')

  await emailInput.fill(credentials.email)
  await passwordInput.fill(credentials.password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL('**/', { timeout: 15_000 })
}
