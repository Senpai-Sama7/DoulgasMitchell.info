import { test, expect } from '@playwright/test';

test.describe('Public Site Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Douglas Mitchell/);
    // Use first() or a more specific role to avoid strict mode violations
    await expect(page.getByRole('heading', { name: 'Douglas Mitchell' })).toBeVisible();
  });

  test('should navigate to work section', async ({ page }) => {
    await page.goto('/');
    // Check if the link exists (in header or hero)
    const workLink = page.getByRole('link', { name: /Work/i }).first();
    await workLink.click();
    await expect(page).toHaveURL(/.*#work/);
  });

  test('should interact with Public Knowledge Console', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder(/Ask about Douglas Mitchell/i);
    await expect(input).toBeVisible();
    
    await input.fill('Who is Douglas Mitchell?');
    await page.keyboard.press('Enter');
    
    // Wait for the response (it might skip thinking state in some environments or be too fast)
    // The answer should contain the headline or name
    await expect(page.getByText(/Douglas Mitchell|Operations Analyst/i).nth(1)).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Admin Portal Accessibility', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });
});
