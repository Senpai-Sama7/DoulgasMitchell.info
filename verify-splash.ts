import { chromium } from '@playwright/test';

async function verifySplashOverlay() {
  const browser = await chromium.launch({ headless: true });
  
  // Mobile viewport
  const contextMobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const pageMobile = await contextMobile.newPage();
  
  // Clear ALL storage
  await pageMobile.addInitScript(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    document.cookie = '';
  });
  
  console.log('=== MOBILE SCREENSHOT ===');
  await pageMobile.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Wait for splash overlay to appear (it should show immediately)
  await pageMobile.waitForTimeout(500);
  
  // Check what's on screen
  const mobileText = await pageMobile.textContent('body');
  console.log('Mobile page text (first 200 chars):', mobileText?.substring(0, 200));
  
  await pageMobile.screenshot({ path: 'verify-mobile.png', fullPage: false });
  console.log('Mobile screenshot saved');
  
  // Desktop viewport - fresh browser
  const contextDesktop = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const pageDesktop = await contextDesktop.newPage();
  
  await pageDesktop.addInitScript(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
    document.cookie = '';
  });
  
  console.log('\n=== DESKTOP SCREENSHOT ===');
  await pageDesktop.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Wait for splash overlay
  await pageDesktop.waitForTimeout(500);
  
  const desktopText = await pageDesktop.textContent('body');
  console.log('Desktop page text (first 300 chars):', desktopText?.substring(0, 300));
  
  await pageDesktop.screenshot({ path: 'verify-desktop.png', fullPage: false });
  console.log('Desktop screenshot saved');
  
  await browser.close();
  console.log('\nDone!');
}

verifySplashOverlay().catch(console.error);
