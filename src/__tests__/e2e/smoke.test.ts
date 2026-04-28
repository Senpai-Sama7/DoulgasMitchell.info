import { test, expect } from '@playwright/test';

test.describe('Public Site Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Douglas Mitchell/);
    // Use first() or a more specific role to avoid strict mode violations
    await expect(page.getByRole('heading', { name: /Douglas Mitchell/i, includeHidden: true })).toBeVisible();
  });

  test('should navigate to work section', async ({ page }) => {
    await page.goto('/');
    // Check if the link exists (in header or hero)
    const workLink = page.getByRole('link', { name: /Work/i }).first();
    await workLink.click();
    await expect(page).toHaveURL(/.*#work/);
  });

  test('should interact with Public Knowledge Console', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByRole('heading', { name: /AI Assistant/i })).toBeVisible({ timeout: 10000 });
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('Who is Douglas Mitchell?');
    // Submit via button (Enter in textarea adds newlines, so click submit button)
    await page.getByRole('button', { name: 'Submit' }).click();

    // Wait for a non-empty assistant response to appear
    await expect(page.getByText(/background|engineer|architect|principle|consultant/i).first()).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Admin Portal Accessibility', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });
});
