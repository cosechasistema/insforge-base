import { test } from '@playwright/test'
import { cleanupTestData } from './helpers/cleanup'

test('cleanup residual E2E data', async () => {
  await cleanupTestData()
})
