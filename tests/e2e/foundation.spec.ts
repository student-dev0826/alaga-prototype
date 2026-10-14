import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [320, 768, 1440]) {
  test(`responsive home and search at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'What healthcare do you need?' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const search = page.getByRole('search', { name: 'Healthcare service search' });
    await search.getByRole('searchbox').focus();
    await page.keyboard.type('I need dialysis');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Results for “I need dialysis”' })).toBeVisible();
    await expect(page).toHaveURL(/\/search$/);
    await expect(page.getByText('0 verified facilities available.')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
}
test('direct routes, privacy, booking and keyboard skip link', async ({ page }) => {
  for (const path of ['/health-centers/example', '/appointments/example', '/book', '/health-guide/example', '/notifications', '/services', '/help', '/missing', '/auth/login', '/auth/register', '/auth/recover', '/auth/callback', '/auth/update-password']) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.getByText('Maria Santos')).toHaveCount(0);
    await expect(page.getByText('Sample Dialysis Center')).toHaveCount(0);
  }
  await page.goto('/book');
  await expect(page.getByRole('heading', { name: 'Online booking is not yet available' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Confirm Appointment/ })).toHaveCount(0);
  await page.getByRole('link', { name: 'Skip to content' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});
test('preferences persist with enlarged text and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/accessibility');
  await page.getByLabel('Text Size').selectOption('extra-large');
  await page.getByRole('checkbox', { name: /High Contrast/ }).check();
  await page.getByRole('checkbox', { name: /Reduce Motion/ }).check();
  await page.reload();
  await expect(page.getByLabel('Text Size')).toHaveValue('extra-large');
  await expect(page.getByRole('checkbox', { name: /High Contrast/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /Reduce Motion/ })).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
test('all foundation pages have no detected WCAG AA violations', async ({ page }) => {
  for (const path of ['/', '/appointments', '/health-guide', '/profile', '/help', '/book', '/notifications', '/health-centers', '/services', '/auth/login', '/auth/register', '/auth/recover']) {
    await page.goto(path); await expect(page.locator('main h1')).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations, path).toEqual([]);
  }
});
test('200 percent text reflows and home captures', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/'); await expect(page.locator('main h1')).toBeVisible();
  await page.screenshot({ path: 'test-results/alaga-desktop.png', fullPage: true });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 320, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; });
  await page.screenshot({ path: 'test-results/alaga-mobile.png', fullPage: true });
});
