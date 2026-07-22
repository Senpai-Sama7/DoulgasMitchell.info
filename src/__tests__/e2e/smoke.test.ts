import { test, expect } from '@playwright/test';

test.describe('Public Site Smoke Tests', () => {
  test('should load the homepage', async ({ page }) => {
    // Skip the cinematic gate so the hero heading is in the accessibility tree
    // immediately (WebKit is especially sensitive to overlay timing).
    await page.addInitScript(() => {
      window.sessionStorage.setItem('dm-video-entrance-v1', '1');
    });
    await page.goto('/');
    await expect(page).toHaveTitle(/Douglas Mitchell/);
    await expect(
      page.getByRole('heading', { name: /Douglas Mitchell/i })
    ).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to work section', async ({ page }) => {
    // Skip the cinematic gate so overlays do not intercept navigation.
    await page.addInitScript(() => {
      window.sessionStorage.setItem('dm-video-entrance-v1', '1');
    });
    await page.goto('/');

    // Prefer the hash nav target — a loose /Work/i name match also hits
    // project titles like "AI Workflow Automation" and leaves the homepage.
    // Do not require the xl desktop strip to be visible: WebKit's layout width
    // often keeps `hidden xl:flex` collapsed even at 1440 CSS pixels. The
    // footer Index always exposes `/#work` in the document flow.
    const workLink = page.locator('footer a[href="/#work"]');
    await expect(workLink).toBeVisible({ timeout: 15000 });
    await workLink.scrollIntoViewIfNeeded();
    await workLink.click();
    await expect(page).toHaveURL(/.*#work/);
    await expect(page.locator('#work')).toBeAttached();
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
