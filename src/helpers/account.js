// src/helpers/account.js
const { expect } = require('@playwright/test');
async function createSavingsAccount(page) {
  // Navigate to Open New Account page
  await page.click('a[href*="openaccount"]');

  // Wait for form to appear
  await page.waitForSelector('#openAccountForm', { state: 'visible', timeout: 10000 });

  // Select account type
  await page.selectOption('#type', '1'); // 1 = Savings

  // Wait until at least one option appears in "From Account" dropdown
  await page.waitForFunction(() => {
    const select = document.querySelector('#fromAccountId');
    return select && select.options.length > 0;
  }, { timeout: 10000 });

  // Select the first account option
  const firstOptionValue = await page.$eval('#fromAccountId option', el => el.value);
  await page.selectOption('#fromAccountId', firstOptionValue);

  // Click "Open New Account"
  await page.click('input[value="Open New Account"]');

  // Wait for new account confirmation
  const newAccount = page.locator('#newAccountId, #accountTable tbody tr:first-child td:first-child a');
  await newAccount.waitFor({ state: 'visible', timeout: 60000 });

  return await newAccount.innerText();
}




module.exports = { createSavingsAccount };
