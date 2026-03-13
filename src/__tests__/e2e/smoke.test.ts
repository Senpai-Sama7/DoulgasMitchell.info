import { test, expect } from '@playwright/test';

test.describe('Public Site Smoke Tests', () => {
  test.setTimeout(60000); // Increase timeout for splash intro

  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Douglas Mitchell/);
    // Wait for the main content to be ready (bypassing splash)
    await expect(page.locator('h1')).toBeVisible({ timeout: 20000 });
  });

  test('should navigate to work section', async ({ page }) => {
    await page.goto('/');
    const workLink = page.getByRole('link', { name: /Work/i }).first();
    await workLink.click({ timeout: 20000 });
    await expect(page).toHaveURL(/.*#work/);
  });

  test('should interact with Public Knowledge Console', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder(/Ask about Douglas Mitchell/i);
    await input.waitFor({ state: 'visible', timeout: 20000 });
    await input.fill('Who is Douglas Mitchell?');
    await page.keyboard.press('Enter');
    
    // Wait for thinking state or answer
    await expect(page.locator('text=Douglas Mitchell')).toBeVisible();
  });

  test('should redirect to admin login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/admin\/login/);
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });
});
