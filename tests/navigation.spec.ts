import { test, expect, type Page } from '@playwright/test'

const TEST_PASSWORD = 'TestPassword123!'

async function authenticateUser(page: Page) {
  const email = `nav-${Date.now()}@panoplia.dev`
  await page.goto('/register')
  await page.getByPlaceholder('you@example.com').fill(email)
  await page.getByPlaceholder('Min 8 characters').fill(TEST_PASSWORD)
  await page.getByPlaceholder('Confirm your password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10_000 })
}

test.describe('Navigation & Pages', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('sidebar navigation works for authenticated user', async ({ page }) => {
    await authenticateUser(page)

    // Navigate to Wallets
    await page.getByRole('link', { name: 'Wallets' }).click()
    await expect(page.getByRole('heading', { name: 'Your Wallets' })).toBeVisible({ timeout: 5_000 })

    // Navigate to Send (use sidebar link specifically)
    await page.locator('nav').getByRole('link', { name: 'Send' }).click()
    await expect(page.locator('main')).toContainText(/Send|Transaction/, { timeout: 5_000 })

    // Navigate to Recovery
    await page.locator('nav').getByRole('link', { name: 'Recovery' }).click()
    await expect(page.locator('main')).toContainText(/Recovery/, { timeout: 5_000 })
  })

  test('sidebar shows user info', async ({ page }) => {
    await authenticateUser(page)
    // The sidebar should be visible with user section
    await expect(page.locator('aside')).toBeVisible()
    // Sidebar should have the Panoplia branding
    await expect(page.locator('aside').getByRole('heading', { name: 'Panoplia' })).toBeVisible()
  })
})
