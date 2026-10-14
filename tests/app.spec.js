import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Only browser tests replace the backend SDK. No test sends real email or creates accounts.
async function mockAccounts(page, signedIn = false, recovering = false) {
  await page.addInitScript(value => { window.testSignedIn = value; }, signedIn);
  await page.addInitScript(value => { window.testRecovering = value; }, recovering);
  await page.route('**/assets/dist-*.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `export function createClient() {
      let user = window.testSignedIn ? { id: 'demo-resident', email: 'demo@example.test' } : null;
      let listener;
      window.testAuthEvent = (event, nextUser) => { user = nextUser; listener(event, user ? { user } : null); };
      const result = () => ({ data: { session: user ? { user } : null }, error: null });
      return {
        auth: {
          onAuthStateChange(callback) { listener = callback; },
          async getSession() {
            if (window.testRecovering) listener('PASSWORD_RECOVERY', { user });
            return result();
          },
          async signInWithPassword() { return { error: { code: 'invalid_credentials' } }; },
          async signUp() { return result(); },
          async resetPasswordForEmail() { return { error: window.testEmailLimit ? { code: 'over_email_send_rate_limit' } : null }; },
          async updateUser() { return { error: null }; },
          async signOut() { window.testAuthEvent('SIGNED_OUT', null); return { error: null }; },
        },
        from(table) {
          let change;
          const query = {
            select() { return query; }, eq() { return query; }, order() { return query; },
            range() { return query; }, abortSignal() { return query; },
            update(value) { change = value; return query; },
            async single() {
              if (table === 'profiles' && !change) window.profileReads = (window.profileReads || 0) + 1;
              if (window.delayProfileSave && change) await new Promise(resolve => { window.finishProfileSave = resolve; });
              return { data: { id: 'demo-resident', display_name: change?.display_name || 'DEMO Resident' }, error: null };
            },
            then(resolve) { return Promise.resolve({ data: table === 'notifications' ? [{ id: 'demo', title: '<img src=x onerror=alert(1)>', message: 'DEMO notification', created_at: '2026-10-14T00:00:00Z', read_at: null }] : [], error: null }).then(resolve); },
          };
          return query;
        },
      };
    }`,
  }));
}

for (const width of [320, 768, 1440]) {
  test('responsive search and honest booking at ' + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.locator('#home-query').fill('I need dialysis');
    await page.locator('#home-query').press('Enter');
    await expect(page.locator('#directory-title')).toContainText('I need dialysis');
    expect(page.url()).not.toContain('dialysis');
    await expect(page.getByRole('heading', { name: 'No verified facilities to show' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/#book');
    await expect(page.getByRole('heading', { name: 'Book an Appointment', exact: true })).toBeVisible();
    await expect(page.locator('[data-page="book"] button:enabled')).toHaveCount(0);
  });
}

test('preferences persist, categories work, and keyboard skip link works', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
  await page.goto('/#accessibility');
  await page.locator('#text-size').selectOption('extra-large');
  await page.locator('#high-contrast').check();
  await page.locator('#reduce-motion').check();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'extra-large');
  await expect(page.locator('#high-contrast')).toBeChecked();
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/#health-guide');
  await page.locator('#guide-query').fill('does not exist');
  await expect(page.locator('#guide-search-status')).toContainText('No categories match');
});

test('session refresh preserves unsaved profile edits and avoids duplicate reads', async ({ page }) => {
  await mockAccounts(page, true);
  await page.goto('/#profile');
  await expect(page.locator('#display-name')).toHaveValue('DEMO Resident');
  expect(await page.evaluate(() => window.profileReads)).toBe(1);
  await page.locator('#display-name').fill('Unsaved DEMO name');
  await page.evaluate(() => window.testAuthEvent('TOKEN_REFRESHED', { id: 'demo-resident', email: 'demo@example.test' }));
  await expect(page.locator('#display-name')).toHaveValue('Unsaved DEMO name');
  expect(await page.evaluate(() => window.profileReads)).toBe(1);
});

test('email throttling explains the limit without promising a short wait', async ({ page }) => {
  await mockAccounts(page);
  await page.goto('/#auth/recover');
  await page.evaluate(() => { window.testEmailLimit = true; });
  await page.locator('#recover-email').fill('demo@example.test');
  await page.locator('#recover-form button').click();
  await expect(page.locator('#recover-form [data-form-error]')).toContainText('Wait for the email limit to reset');
  await expect(page.locator('#recover-form [data-form-message]')).toBeEmpty();
});

test('expired email callback shows recovery guidance instead of page not found', async ({ page }) => {
  await mockAccounts(page, true);
  await page.goto('/auth/callback#error=access_denied&error_code=otp_expired');
  await expect(page.locator('#callback-status')).toContainText('may have expired');
  await expect(page).toHaveURL('http://127.0.0.1:5173/#auth/callback');
  await expect(page.locator('[data-page="not-found"]')).toBeHidden();
  await expect(page.locator('#password-form')).toBeHidden();
});

test('verified recovery callback opens password form and removes callback parameters', async ({ page }) => {
  await mockAccounts(page, true, true);
  await page.goto('/auth/callback?code=demo-code-for-mocked-sdk#type=recovery');
  await expect(page.locator('#password-form')).toBeVisible();
  await expect(page).toHaveURL('http://127.0.0.1:5173/#auth/update-password');
});

test('public and signed-out pages have no detected axe AA violations', async ({ page }) => {
  await mockAccounts(page);
  for (const route of ['home', 'health-centers', 'services', 'book', 'appointments', 'health-guide', 'notifications', 'profile', 'accessibility', 'help', 'auth/login', 'auth/register', 'auth/recover', 'auth/update-password']) {
    await page.goto('/#' + route);
    await expect(page.locator('[data-page="' + route + '"]')).toBeVisible();
    if (route.startsWith('auth/') || ['profile', 'appointments', 'notifications'].includes(route)) await expect.poll(() => page.evaluate(() => typeof window.testAuthEvent)).toBe('function');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations, route + ': ' + JSON.stringify(results.violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => node.target) })))).toEqual([]);
  }
});

test('forms validate and never claim a failed sign-in succeeded', async ({ page }) => {
  await mockAccounts(page);
  await page.goto('/#auth/login');
  await page.locator('#login-form button').click();
  await expect(page.locator('#login-email')).toBeFocused();
  await page.locator('#login-email').fill('demo@example.test');
  await page.locator('#login-password').fill('demo-password-only');
  await page.locator('#login-form button').click();
  await expect(page.locator('#login-form [data-form-error]')).toContainText('incorrect');
  await page.goto('/#auth/register');
  await page.locator('#register-email').fill('demo@example.test');
  await page.locator('#register-password').fill('short');
  await page.locator('#register-form button').click();
  await expect(page.locator('#register-password-error')).toContainText('12 characters');
  await page.locator('#register-password').fill('demo-password-only');
  await page.locator('#register-form button').click();
  await expect(page.locator('#register-form [data-form-message]')).toContainText('Check your email');
  await page.goto('/#auth/update-password');
  await expect(page.locator('#password-form')).toBeHidden();
});

test('late profile saves cannot restore private data after logout', async ({ page }) => {
  await mockAccounts(page, true);
  await page.goto('/#profile');
  await expect(page.locator('#display-name')).toHaveValue('DEMO Resident');
  await page.evaluate(() => { window.delayProfileSave = true; });
  await page.locator('#display-name').fill('DEMO Changed Name');
  await page.locator('#save-profile').click();
  await expect.poll(() => page.evaluate(() => !!window.finishProfileSave)).toBe(true);
  await page.locator('#sign-out').click();
  await expect(page.locator('[data-page="profile"] [data-resident-gate]')).toContainText('Sign in to continue');
  await page.evaluate(() => window.finishProfileSave());
  await expect(page.locator('#display-name')).toHaveValue('');
  await expect(page.locator('#profile-welcome')).toHaveText('Welcome, resident');
});

test('notifications render database strings as text and recovery belongs to one account', async ({ page }) => {
  await mockAccounts(page, true);
  await page.goto('/#notifications');
  await expect(page.locator('#notification-list')).toContainText('<img src=x onerror=alert(1)>');
  await expect(page.locator('#notification-list img')).toHaveCount(0);
  await page.evaluate(() => window.testAuthEvent('PASSWORD_RECOVERY', { id: 'demo-resident', email: 'demo@example.test' }));
  await page.goto('/#auth/update-password');
  await expect(page.locator('#password-form')).toBeVisible();
  await page.evaluate(() => window.testAuthEvent('SIGNED_IN', { id: 'other-demo-resident', email: 'other@example.test' }));
  await expect(page.locator('#password-form')).toBeHidden();
});
