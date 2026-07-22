import { test, expect } from '@playwright/test';

test.describe('Public Site Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Douglas Mitchell/);
    await expect(
      page.getByRole('heading', { name: /Douglas Mitchell/i, includeHidden: true })
    ).toBeVisible();
  });

  test('should navigate to work section', async ({ page }) => {
    await page.goto('/');

    // First-visit video gate can cover the chrome — dismiss if present.
    const skipIntro = page.getByRole('button', { name: /skip intro/i });
    if (await skipIntro.isVisible().catch(() => false)) {
      await skipIntro.click();
      await expect(skipIntro).toBeHidden({ timeout: 10000 });
    }

    // Prefer the hash nav target — a loose /Work/i name match also hits
    // project titles like "AI Workflow Automation" and leaves the homepage.
    // Desktop chapter links are `xl:`-only; WebKit's 1280px Desktop Safari
    // viewport often falls below that once scrollbars eat width, so fall
    // back to the mobile menu scene when the primary row is hidden.
    const desktopWork = page.locator('nav[aria-label="Primary"] ul a[href="/#work"]');
    if (await desktopWork.isVisible()) {
      await desktopWork.click();
    } else {
      await page.getByRole('button', { name: /open navigation menu/i }).click();
      const mobileWork = page.locator('#site-mobile-menu a[href="/#work"]');
      await expect(mobileWork).toBeVisible();
      await mobileWork.click();
    }

    await expect(page).toHaveURL(/.*#work/);
  });

  test('should submit contact form', async ({ page }) => {
    await page.goto('/#contact');

    const form = page.locator('#contact-form');
    await expect(form).toBeVisible({ timeout: 15000 });

    await form.locator('input[name="name"]').fill('Test User');
    await form.locator('input[name="email"]').fill('test@example.com');
    await form.locator('textarea[name="message"]').fill(
      'This is a test message from E2E testing.'
    );

    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/contact') && response.request().method() === 'POST'
      ),
      form.getByRole('button', { name: /send message/i }).click(),
    ]);

    await expect(page.locator('#contact-form-status')).toContainText(
      /thank you|received|success/i,
      { timeout: 10000 }
    );
  });

  test('should interact with Public Knowledge Console', async ({ page }) => {
    await page.goto('/chat');
    await expect(
      page.getByRole('heading', { name: /Knowledge console|AI Assistant/i })
    ).toBeVisible({ timeout: 10000 });

    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('Who is Douglas Mitchell?');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(
      page.getByText(/background|engineer|architect|principal|consultant|operations/i).first()
    ).toBeVisible({ timeout: 20000 });
  });
});

test.describe('Admin Portal Accessibility', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });
});
