const INSFORGE_URL = process.env.NUXT_PUBLIC_INSFORGE_URL || ''

/**
 * Cleans up residual data from previous E2E test runs.
 * Runs as the first test (000-cleanup.spec.ts) before the rest.
 */
export async function cleanupTestData() {
  const loginRes = await fetch(`${INSFORGE_URL}/api/auth/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.TEST_ADMIN_EMAIL,
      password: process.env.TEST_ADMIN_PASSWORD,
    }),
  })

  if (!loginRes.ok) {
    console.warn('[cleanup] Could not login as admin, skipping cleanup')
    return
  }

  const { accessToken } = await loginRes.json()

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  }

  const patterns = [
    // Residual items from E2E tests
    '/api/database/records/items?nombre=like.E2E+Test*',
    '/api/database/records/items?nombre=like.Item+to+Delete*',
    '/api/database/records/items?nombre=like.Updated+E2E*',
  ]

  for (const pattern of patterns) {
    await fetch(`${INSFORGE_URL}${pattern}`, { method: 'DELETE', headers })
  }

  console.log('[cleanup] Test data cleaned up successfully')
}
