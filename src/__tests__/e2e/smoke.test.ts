import { test, expect } from '@playwright/test';

test.describe('Public Site Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Douglas Mitchell/);
    await expect(page.getByRole('heading', { name: /Douglas Mitchell/i, includeHidden: true })).toBeVisible();
  });

  test('should navigate to work section', async ({ page }) => {
    await page.goto('/');
    const workLink = page.getByRole('link', { name: /Work/i }).first();
    await workLink.click();
    await expect(page).toHaveURL(/.*#work/);
  });

  test('should submit contact form', async ({ page }) => {
    await page.goto('/');

    // Find contact section and fill form
    const nameInput = page.getByLabel(/name/i).or(page.locator('input[name="name"]'));
    const emailInput = page.getByLabel(/email/i).or(page.locator('input[name="email"]'));
    const messageInput = page.getByLabel(/message/i).or(page.locator('textarea[name="message"]'));

    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await messageInput.fill('This is a test message from E2E testing.');

    // Submit - avoid honeypot field (website) if present
    const submitButton = page.getByRole('button', { name: /send|submit/i }).first();
    await submitButton.click();

    // Wait for success message or toast
    await expect(page.getByText(/thank you|received|success/i)).toBeVisible({ timeout: 10000 });
  });

  test('should interact with Public Knowledge Console', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByRole('heading', { name: /AI Assistant/i })).toBeVisible({ timeout: 10000 });

    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('Who is Douglas Mitchell?');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText(/background|engineer|architect|principal|consultant/i).first()).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Admin Portal Accessibility', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });
});
