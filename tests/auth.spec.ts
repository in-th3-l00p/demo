import { test, expect } from '@playwright/test'

const TEST_PASSWORD = 'TestPassword123!'

test.describe('Authentication', () => {
  test('shows login page by default', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByText('Sign in to your Panoplia wallet')).toBeVisible()
  })

  test('can navigate to register page', async ({ page }) => {
    await page.goto('/login')
    await page.getByText('Create one').click()
    await expect(page.getByText('Create your wallet')).toBeVisible()
  })

  test('shows validation error for short password', async ({ page }) => {
    await page.goto('/register')
    await page.getByPlaceholder('you@example.com').fill(`test-${Date.now()}@panoplia.dev`)
    await page.getByPlaceholder('Min 8 characters').fill('short')
    await page.getByPlaceholder('Confirm your password').fill('short')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('shows validation error for mismatched passwords', async ({ page }) => {
    await page.goto('/register')
    await page.getByPlaceholder('you@example.com').fill(`test-${Date.now()}@panoplia.dev`)
    await page.getByPlaceholder('Min 8 characters').fill(TEST_PASSWORD)
    await page.getByPlaceholder('Confirm your password').fill('DifferentPass123!')
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('can register a new account and land on dashboard', async ({ page }) => {
    await page.goto('/register')
    await page.getByPlaceholder('you@example.com').fill(`test-${Date.now()}@panoplia.dev`)
    await page.getByPlaceholder('Min 8 characters').fill(TEST_PASSWORD)
    await page.getByPlaceholder('Confirm your password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'Create Account' }).click()

    // Should redirect to dashboard after successful registration
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10_000 })
  })

  test('can login with existing credentials', async ({ page }) => {
    // First register
    const email = `login-${Date.now()}@panoplia.dev`
    await page.goto('/register')
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('Min 8 characters').fill(TEST_PASSWORD)
    await page.getByPlaceholder('Confirm your password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'Create Account' }).click()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10_000 })

    // Logout
    await page.evaluate(() => localStorage.clear())
    await page.goto('/login')

    // Login
    await page.getByPlaceholder('you@example.com').fill(email)
    await page.getByPlaceholder('Enter your password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 10_000 })
  })
})
