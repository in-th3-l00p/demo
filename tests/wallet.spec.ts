import { test, expect, type Page } from '@playwright/test'

const TEST_PASSWORD = 'TestPassword123!'

async function registerAndLogin(page: Page): Promise<string> {
  const email = `wallet-${Date.now()}@panoplia.dev`
  await page.goto('/register')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Min 8 characters').fill(TEST_PASSWORD)
  await page.getByPlaceholder('Confirm your password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10_000 })
  return email
}

test.describe('Wallet Management', () => {
  test('shows empty state when no wallets exist', async ({ page }) => {
    await registerAndLogin(page)
    await page.getByRole('link', { name: 'Wallets' }).click()
    await expect(page.getByText('No wallets yet')).toBeVisible({ timeout: 5_000 })
  })

  test('can create a new wallet', async ({ page }) => {
    await registerAndLogin(page)
    await page.goto('/create-wallet')
    await expect(page.getByRole('heading', { name: 'Create New Wallet' })).toBeVisible()

    await page.getByPlaceholder(/Main Wallet|Savings|Trading/).fill('Test Wallet')
    await page.getByRole('button', { name: 'Create Wallet' }).click()

    // Should show keygen progress
    await expect(page.getByText(/Initializing|Key Generation/)).toBeVisible({ timeout: 10_000 })

    // Should complete and show success
    await expect(page.getByText('Wallet Created!')).toBeVisible({ timeout: 30_000 })
  })

  test('wallet appears on dashboard after creation', async ({ page }) => {
    await registerAndLogin(page)

    // Create wallet
    await page.goto('/create-wallet')
    await page.getByPlaceholder(/Main Wallet|Savings|Trading/).fill('Dashboard Wallet')
    await page.getByRole('button', { name: 'Create Wallet' }).click()
    await expect(page.getByText('Wallet Created!')).toBeVisible({ timeout: 30_000 })

    // Go to dashboard
    await page.getByRole('button', { name: 'Dashboard' }).click()
    await expect(page.getByText('Dashboard Wallet')).toBeVisible({ timeout: 5_000 })
  })
})
