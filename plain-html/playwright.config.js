import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', browserName: 'chromium', screenshot: 'only-on-failure' },
  webServer: { command: 'npm run preview:plain', url: 'http://127.0.0.1:5173', reuseExistingServer: !process.env.CI },
});
