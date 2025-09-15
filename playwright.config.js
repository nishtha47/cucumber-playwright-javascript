module.exports = {
  testDir: './src/step-definitions',
  timeout: 30000, // Increase from 5000 to 30000ms
  expect: {
    timeout: 10000
  },
  use: {
    actionTimeout: 10000,
    navigationTimeout: 30000,
    headless: false, // Set to true for CI/CD
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};