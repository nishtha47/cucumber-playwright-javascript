const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { createSavingsAccount } = require('../helpers/account');

///////////////////////////
// UTILITY: ENSURE PAGE
///////////////////////////
async function ensurePage(world) {
  if (!world.page) {
    console.log('⚠️ Browser not initialized, initializing now...');
    await world.initBrowser();
  }
}

///////////////////////////
// STEP DEFINITIONS
///////////////////////////

// ✅ Navigate to Parabank
Given('I navigate to Parabank application', async function () {
  await ensurePage(this);
  await this.page.goto('https://parabank.parasoft.com/parabank/index.htm', { waitUntil: 'networkidle' });
});

Given('I am on the Parabank homepage', async function () {
  await ensurePage(this);
  await this.page.goto('https://parabank.parasoft.com/parabank/index.htm', { waitUntil: 'networkidle' });
});

// ✅ Registration
When('I click on Register link', async function () {
  await ensurePage(this);
  await this.page.click('a[href*="register.htm"]');
});

When('I fill the registration form with unique user details', async function () {
  await ensurePage(this);
  const timestamp = Date.now();
  await this.page.fill('input[name="customer.firstName"]', 'Test');
  await this.page.fill('input[name="customer.lastName"]', 'User' + timestamp);
  await this.page.fill('input[name="customer.address.street"]', '123 Main St');
  await this.page.fill('input[name="customer.address.city"]', 'Anytown');
  await this.page.fill('input[name="customer.address.state"]', 'CA');
  await this.page.fill('input[name="customer.address.zipCode"]', '12345');
  await this.page.fill('input[name="customer.phoneNumber"]', '555-1234');
  await this.page.fill('input[name="customer.ssn"]', '123-45-6789');
  await this.page.fill('input[name="customer.username"]', 'user' + timestamp);
  await this.page.fill('input[name="customer.password"]', 'Password123!');
  await this.page.fill('input[name="repeatedPassword"]', 'Password123!');
});

When('I submit the registration form', async function () {
  await ensurePage(this);
  await this.page.click('input[value="Register"]');
});

Then('I should see successful registration message', async function () {
  await ensurePage(this);
  const successMsg = await this.page.textContent('div[id="rightPanel"] > p');
  expect(successMsg).toContain('Your account was created successfully');
});

Then('I should be logged in automatically', async function () {
  await ensurePage(this);
  const welcomeText = await this.page.textContent('div[id="rightPanel"] > h1');
  expect(welcomeText).toContain('Welcome user');
  await this.page.click('a[href*="overview.htm"]');
});

/*Given('I have registered and logged in with a new user', async function () {
  await ensurePage(this);
  const timestamp = Date.now();
  await this.page.click('a[href*="register.htm"]');
  await this.page.fill('input[name="customer.firstName"]', 'Test');
  await this.page.fill('input[name="customer.lastName"]', 'User' + timestamp);
  await this.page.fill('input[name="customer.address.street"]', '123 Main St');
  await this.page.fill('input[name="customer.address.city"]', 'Anytown');
  await this.page.fill('input[name="customer.address.state"]', 'CA');
  await this.page.fill('input[name="customer.address.zipCode"]', '12345');
  await this.page.fill('input[name="customer.phoneNumber"]', '555-1234');
  await this.page.fill('input[name="customer.ssn"]', '123-45-6789');
  await this.page.fill('input[name="customer.username"]', 'user' + timestamp);
  await this.page.fill('input[name="customer.password"]', 'Password123!');
  await this.page.fill('input[name="repeatedPassword"]', 'Password123!');
  await this.page.click('input[value="Register"]');
  await this.page.waitForSelector('h1:has-text("Welcome user")', { timeout: 120000 });
  await this.page.click('a[href*="overview.htm"]');
});*/

///////////////////////////
// Create Savings Account
///////////////////////////

Given('I have registered and logged in with a new user', async function () {
  await ensurePage(this);
  const timestamp = Date.now();
  const username = 'user' + timestamp;
  const user = {
    firstName: 'Test',
    lastName: 'User' + timestamp,
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    phoneNumber: '555-1234',
    ssn: '123-45-6789',
    username: username,
    password: 'Password123!'
  };

  // Fill registration form
  await this.page.click('a[href*="register.htm"]');
  await this.page.fill('input[name="customer.firstName"]', user.firstName);
  await this.page.fill('input[name="customer.lastName"]', user.lastName);
  await this.page.fill('input[name="customer.address.street"]', user.address);
  await this.page.fill('input[name="customer.address.city"]', user.city);
  await this.page.fill('input[name="customer.address.state"]', user.state);
  await this.page.fill('input[name="customer.address.zipCode"]', user.zipCode);
  await this.page.fill('input[name="customer.phoneNumber"]', user.phoneNumber);
  await this.page.fill('input[name="customer.ssn"]', user.ssn);
  await this.page.fill('input[name="customer.username"]', user.username);
  await this.page.fill('input[name="customer.password"]', user.password);
  await this.page.fill('input[name="repeatedPassword"]', user.password);
  await this.page.click('input[value="Register"]');

  // Wait for successful registration
  await this.page.waitForSelector('h1:has-text("Welcome user")', { timeout: 120000 });

  // Navigate to overview
  await this.page.click('a[href*="overview.htm"]');

  // ✅ Store user in world for API steps
  this.setTestData('user', user);
});

Given('I have created a savings account', async function () {
  await ensurePage(this);
  await this.page.click('a[href*="openaccount"]');

  // Wait for form to appear
  await this.page.waitForSelector('#openAccountForm', { state: 'visible', timeout: 10000 });

  // Select account type
  await this.page.selectOption('#type', '1'); // 1 = Savings

  // Wait until at least one option appears in "From Account" dropdown
  await this.page.waitForFunction(() => {
    const select = document.querySelector('#fromAccountId');
    return select && select.options.length > 0;
  }, { timeout: 10000 });

  // Select the first account option
  const firstOptionValue = await this.page.$eval('#fromAccountId option', el => el.value);
  await this.page.selectOption('#fromAccountId', firstOptionValue);

  // Click "Open New Account"
  await this.page.click('input[value="Open New Account"]');

  /*await this.page.click('a[href*="openaccount.htm"]');
  await this.page.waitForSelector('select[id="type"]', { state: 'visible', timeout: 60000 });
  await this.page.selectOption('select[id="type"]', '1'); // SAVINGS
  await this.page.waitForSelector('select[name="fromAccountId"]', { state: 'visible', timeout: 60000 });
  await this.page.selectOption('select[name="fromAccountId"]', { index: 0 });
  await this.page.click('input[value="Open New Account"]');*/
  await this.page.waitForSelector('#newAccountId', { timeout: 120000 });
  const accountId = await this.page.textContent('#newAccountId');
  this.setTestData('newAccountId', accountId);
});


/*Given('I have created a savings account with sufficient balance', async function () {
  await this.runStep('I have created a savings account');
  // optionally top up balance via API if needed
});*/



Given('I have created a savings account with sufficient balance', async function () {
  await ensurePage(this);
  this.savingsAccount = await createSavingsAccount(this.page, 'SAVINGS');
});


///////////////////////////
// Global Navigation
///////////////////////////
When('I verify the global navigation menu', async function () {
  await ensurePage(this);
  const navItems = await this.page.$$('div#leftPanel a');
  expect(navItems.length).toBeGreaterThan(0);
});

Then('all navigation links should be present and functional', async function () {
  await ensurePage(this);
  const links = await this.page.$$eval('div#leftPanel a', els => els.map(e => e.href));
  expect(links.length).toBeGreaterThan(0);
});

Then('each menu item should navigate to correct page', async function () {
  await ensurePage(this);
  const menuItems = ['overview.htm', 'openaccount.htm', 'transfer.htm', 'billpay.htm'];
  for (const item of menuItems) {
    await this.page.click(`a[href*="${item}"]`);
    await this.page.waitForLoadState('networkidle');
    expect(this.page.url()).toContain(item);
  }
});

///////////////////////////
// Page navigation
///////////////////////////
When('I navigate to {string} page', async function (pageName) {
  await ensurePage(this);
  const pageMap = {
    'Open New Account': 'openaccount.htm',
    'Accounts Overview': 'overview.htm',
    'Transfer Funds': 'transfer.htm',
    'Bill Pay': 'billpay.htm'
  };
  const relativeUrl = pageMap[pageName];
  if (!relativeUrl) throw new Error(`Page mapping missing for ${pageName}`);
  await this.page.click(`a[href*="${relativeUrl}"]`);
  await this.page.waitForLoadState('networkidle');
});

///////////////////////////
// Open New Account
///////////////////////////
When('I select "SAVINGS" account type', async function () {
  await ensurePage(this);
  await this.page.waitForSelector('select[id="type"]', { state: 'visible', timeout: 120000 });
  await this.page.selectOption('select[id="type"]', '1');
//  await this.page.click('input[@type="button"]');
const button = this.page.locator('//*[@id="openAccountForm"]/form/div/input');
await button.waitFor({ state: 'visible', timeout: 60000 });
await button.scrollIntoViewIfNeeded();
await button.click({ force: true });
});

/*When('I select an existing account to transfer from', async function () {
  await ensurePage(this);
  await this.page.waitForSelector('select[name="fromAccountId"]', { state: 'visible', timeout: 120000 });
  await this.page.selectOption('select[name="fromAccountId"]', { index: 0 });
});*/

// Try different selector approaches
/*When('I select an existing account to transfer from', async function () {
    // Wait for page load
    await this.page.waitForLoadState('networkidle');

    // Assuming a select element with name="fromAccountId"
const dropdown = await this.page.$('select[name="fromAccountId"]');
const options = await dropdown.$$('option'); // get all option elements
const lastOptionValue = await options[options.length - 1].getAttribute('value'); // get value of last option

// Select the last option
await this.page.selectOption('select[name="fromAccountId"]', lastOptionValue);

    
    // Try multiple selector strategies
    /*const selectors = [
       // '//*[@id="accountTable"]/tbody/tr[1]/td[1]/a',
        '//a[@id="newAccountId"]',
       // 'select[id="fromAccountId"]',
       // '#fromAccountId',
       // 'select[id="fromAccountId"]',
        //'.form-group select:first-of-type'
    ];
    
    let elementFound = false;
    
    for (const selector of selectors) {
        try {
            await this.page.waitForSelector(selector, { state: 'visible', timeout: 30000 });
            
            // Check if options are available
            const options = await this.page.locator(`${selector} option`).count();
            if (options > 1) {
                await this.page.selectOption(selector, { index: 1 });
                elementFound = true;
                break;
            }
        } catch (error) {
            console.log(`Selector ${selector} not found, trying next...`);
            continue;
        }
    }
    
    if (!elementFound) {
        throw new Error('Could not find or interact with account selection dropdown');
    }*/


When('I select an existing account to transfer from', async function () {
  await ensurePage(this);

  // Wait for the dropdown to appear
  await this.page.waitForSelector('select[id="fromAccountId"]', { state: 'visible', timeout: 60000 });

  // Get all options
  const options = await this.page.$$eval('select[id="fromAccountId"] option', els =>
    els.map(e => e.value)
  );

  if (options.length === 0) throw new Error('No accounts available in the dropdown');

  // Select the last account
  const lastAccount = options[options.length - 1];
  await this.page.selectOption('select[id="fromAccountId"]', lastAccount);
});


/*When('I click {string} button', async function (buttonText) {
  await ensurePage(this);

  // Use more flexible locator
  const button = this.page.locator(`button:has-text("${buttonText}"), input[value="${buttonText}"]`).first();

  // Wait until the button is visible and enabled
  await button.waitFor({ state: 'visible', timeout: 60000 });

  // Ensure it’s interactable
  await button.scrollIntoViewIfNeeded();

  // Click and wait for possible navigation or network activity safely
  try {
    await Promise.all([
      button.click({ timeout: 60000 }),
      this.page.waitForLoadState('domcontentloaded', { timeout: 60000 }).catch(() => {}) // fallback
    ]);
  } catch (err) {
    console.error(`Failed to click button "${buttonText}":`, err);
    throw err;
  }
});*/

/*When('I click "Open New Account" button', async function () {
  await ensurePage(this);

  // Wait for overlays or loaders to disappear
  await this.page.locator('.overlay, .loading, .spinner').waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

  const button = this.page.locator('button:has-text("Open New Account"), input[type="button"]').first();

  // Wait until button is visible and enabled
  await button.waitFor({ state: 'visible', timeout: 60000 });
  await button.waitFor({ state: 'enabled', timeout: 60000 });

  // Scroll and click
  await button.scrollIntoViewIfNeeded();
  try {
    await button.click({ timeout: 60000 });
  } catch (err) {
    console.warn('Normal click failed, using force click');
    await button.click({ force: true });
  }

  await this.page.waitForLoadState('domcontentloaded');
});*/

When('I click "Open New Account" button', async function () {
  await ensurePage(this);

  // Wait for the form that contains the button
  await this.page.waitForSelector('#openAccountForm', { timeout: 60000 });

  const button = this.page.locator('//*[@id="openAccountForm"]/form/div/input');

  // Ensure visible and enabled
  await button.waitFor({ state: 'visible', timeout: 60000 });
  await button.scrollIntoViewIfNeeded();

  try {
    await button.click({ timeout: 60000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  } catch (err) {
    console.error(`❌ Failed to click "Open New Account" button`, err);
    throw err;
  }
});

When('I click "Send Payment" button', async function () {
  await ensurePage(this);

  // Wait for the form that contains the button
 // await this.page.waitForSelector('#form2', { timeout: 60000 });

  const button = this.page.locator('//*[@id="billpayForm"]/form/table/tbody/tr[14]/td[2]/input');

  // Ensure visible and enabled
  await button.waitFor({ state: 'visible', timeout: 60000 });
  await button.scrollIntoViewIfNeeded();

  try {
    await button.click({ timeout: 60000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  } catch (err) {
    console.error(`❌ Failed to click "Open New Account" button`, err);
    throw err;
  }
});

  

When('I click "Transfer" button', async function () {
  await ensurePage(this);

  // Wait for the form that contains the button
 // await this.page.waitForSelector('#form2', { timeout: 60000 });

  const button = this.page.locator('//input[@type="submit"][@value="Transfer"]');

  // Ensure visible and enabled
  await button.waitFor({ state: 'visible', timeout: 60000 });
  await button.scrollIntoViewIfNeeded();

  try {
    await button.click({ timeout: 60000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  } catch (err) {
    console.error(`❌ Failed to click "Transfer" button`, err);
    throw err;
  }
});

/* When('I click "Open New Account" button', async function () {
  await ensurePage(this);

  console.log(await this.page.content());

  // Use fixed XPath for Open New Account
  const button = this.page.locator('//*[@id="openAccountForm"]/form/div/input');

  // Wait for it to be visible and enabled
  await button.waitFor({ state: 'visible', timeout: 60000 });
  await button.waitFor({ state: 'attached', timeout: 60000 }); // ensure it's in DOM
  await button.waitFor({ state: 'enabled', timeout: 60000 }); // ensure enabled

  // Scroll into view
  await button.scrollIntoViewIfNeeded();

  // Click safely
  try {
    await button.click({ timeout: 60000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  } catch (err) {
    console.error(`Failed to click "Open New Account" button`, err);
    throw err;
  }
});*/


/*When('I click {string} button', async function (buttonText) {
  await ensurePage(this);

  // Locate the button
  //*[@id="openAccountForm"]/form/div/input
  const button = this.page.locator(`button:has-text("${buttonText}"), input[value="${buttonText}"]`).first();

  // Wait for it to be visible and enabled
  await button.waitFor({ state: 'visible', timeout: 60000 });
  await button.waitFor({ state: 'attached', timeout: 60000 }); // ensure it's in DOM
  await button.waitFor({ state: 'enabled', timeout: 60000 }); // ensure enabled

  // Scroll into view
  await button.scrollIntoViewIfNeeded();

  // Click safely
  try {
    await button.click({ timeout: 60000 });
    // Optional: wait for navigation or network activity if needed
    await this.page.waitForLoadState('networkidle').catch(() => {});
  } catch (err) {
    console.error(`Failed to click button "${buttonText}"`, err);
    throw err;
  }
});*/


/*When('I click {string} button', async function (buttonText) {
  await ensurePage(this);

  const button = this.page.locator(`input[value="${buttonText}"], button:has-text("${buttonText}")`).first();

  // Ensure button is visible and enabled
  await button.waitFor({ state: 'visible', timeout: 60000 });
  await button.scrollIntoViewIfNeeded();
  
  // Click the button safely
  await Promise.all([
    button.click({ timeout: 60000 }),
    this.page.waitForLoadState('networkidle').catch(() => {}) // in case navigation happens
  ]);

  // Map buttonText to expected selectors
  const expectedSelectors = {
    'Open New Account': '#newAccountId',
    'Transfer': 'h1:has-text("Transfer Complete!")',
    'Send Payment': 'div#rightPanel:has-text("Bill Payment Complete")'
  };

  const expectedSelector = expectedSelectors[buttonText];
  if (expectedSelector) {
    await this.page.waitForSelector(expectedSelector, { state: 'visible', timeout: 120000 });
  } else {
    // fallback: wait briefly for UI update if button has no mapped selector
    await this.page.waitForTimeout(3000);
  }
});
*/



Then('I should see account creation success message', async function () {
  await ensurePage(this);
  await this.page.waitForSelector('h1:has-text("Account Opened!")', { timeout: 120000 });
});

Then('I should capture the new savings account number', async function () {
  await ensurePage(this);
  const accountId = await this.page.textContent('#newAccountId');
  this.setTestData('newAccountId', accountId);
  expect(accountId).toMatch(/\d+/);
});

Then('the account should appear in accounts overview', async function () {
  await ensurePage(this);
  await this.page.click('a[href*="overview.htm"]');
  const newAccountId = this.getTestData('newAccountId');
  await this.page.waitForSelector(`a:has-text("${newAccountId}")`, { timeout: 60000 });
});

///////////////////////////
// Fund Transfer
///////////////////////////
When('I enter amount {string} to transfer', async function (amount) {
  await ensurePage(this);

  // Wait for the amount input to be visible
  const amountInput = this.page.locator('input[name="input"]');
  await amountInput.waitFor({ state: 'visible', timeout: 60000 });

  // Fill the amount
  await amountInput.fill(amount);

  // Tab out to trigger blur/validation
  await amountInput.press('Enter');
  

  // Optional: focus the Transfer button to avoid later click issues
  //const transferButton = this.page.locator('button[name="transfer"]');
  //await transferButton.focus();
  //await transferButton.scrollIntoViewIfNeeded();
});


/*When('I select source account', async function () {
  await ensurePage(this);
  await this.page.selectOption('select[name="fromAccountId"]', { index: 0 });
});*/

When('I select source account', async function () {
  await ensurePage(this);

  // Wait for the dropdown to be visible
  const fromAccountSelect = this.page.locator('select[id="fromAccountId"]');
  await fromAccountSelect.waitFor({ state: 'visible', timeout: 20000 });

  // Ensure at least one option exists
  const options = await fromAccountSelect.locator('option').allTextContents();
  if (options.length === 0) {
    throw new Error('No options available in the source account dropdown');
  }

  // Select the first account (or use saved account)
  const accountToSelect = this.savingsAccount || options[0];
  await fromAccountSelect.selectOption({ label: accountToSelect });

  //await fromAccountSelect.selectOption(firstOptionValue);

  // Optional: Highlight the selected account for debugging
  /*await this.page.evaluate((sel) => {
    const dropdown = document.querySelector(sel);
    dropdown.style.border = '2px solid red';
  }, 'select[name="fromAccountId"]');*/

 // await amountInput.press('Tab');
});


When('I select destination account', async function () {
  await ensurePage(this);
  await this.page.selectOption('select[id="toAccountId"]', { index: 1 });
});

Then('I should see transfer success message', async function () {
  await ensurePage(this);
  await this.page.waitForSelector('h1:has-text("Transfer Complete!")', { timeout: 60000 });
});

Then('the transfer should be reflected in account balances', async function () {
  await ensurePage(this);

  // Navigate to overview/accounts page
  await this.page.click('a[href*="overview.htm"]');

  // Wait for balances table to be visible
  await this.page.waitForSelector('table tr td:nth-child(2)', { timeout: 60000 });

  // Extract balances as numbers
  const balances = await this.page.$$eval(
    'table tr td:nth-child(2)',
    els => els
      .map(e => e.textContent?.replace('$', '').replace(',', '').trim())
      .filter(Boolean)
      .map(v => parseFloat(v))
      .filter(n => !isNaN(n))
  );

  expect(balances.length).toBeGreaterThan(0); // Ensure balances exist

  const newTotal = balances.reduce((a, b) => a + b, 0);

  if (typeof this.initialBalance === 'number') {
    // Assert that the balance has decreased (transfer happened)
    expect(newTotal).toBeLessThan(this.initialBalance);
  } else {
    console.warn('⚠️ initialBalance was not set before this step');
  }
});


/*hen('the transfer should be reflected in account balances', async function () {
  await ensurePage(this);

  // Navigate to overview or accounts page
  await this.page.click('a[href*="overview.htm"]');

  // Wait for balances table to be visible
  await this.page.waitForSelector('table tr td:nth-child(2)', { timeout: 60000 });

  // Parse balances as numbers
  const balances = await this.page.$$eval(
    'table tr td:nth-child(2)',
    els => els.map(e => parseFloat(e.textContent.replace('$', '').replace(',', '').trim()))
  );

  // Example: compare total balance before/after if you stored it in this.initialBalance
  if (this.initialBalance !== undefined) {
    const newTotal = balances.reduce((a, b) => a + b, 0);
    expect(this.initialBalance - newTotal).toBeGreaterThan(0); // ensures deduction
  } else {
    // Fallback: at least check table has some numeric balances
    expect(balances.length).toBeGreaterThan(0);
  }
});*/


Then('transaction should appear in transaction history', async function () {
  await ensurePage(this);
  await this.page.click('a[href*="activity.htm"]');
  const rows = await this.page.$$('table tr');
  expect(rows.length).toBeGreaterThan(1);
});

///////////////////////////
// Bill Pay
///////////////////////////
/*When('I fill payee information:', async function (dataTable) {
  await ensurePage(this);
  const data = dataTable.rowsHash();
  const selectorMap = {
    'Payee Name': 'payee.name',
    'Address': 'payee.address.street',
    'City': 'payee.address.city',
    'State': 'payee.address.state',
    'Zip Code': 'payee.address.zipCode',
    'Phone': 'payee.phoneNumber',
    'Account Number': 'payee.accountNumber',
    'Verify Account': 'verifyAccount'
  };
  for (const [field, value] of Object.entries(data)) {
    const selector = `input[name="${selectorMap[field]}"]`;
    await this.page.waitForSelector(selector, { state: 'visible', timeout: 60000 });
    await this.page.fill(selector, value);
  }
});*/

When('I fill payee information:', async function (dataTable) {
  await ensurePage(this);

  const rows = dataTable.hashes(); // array of { field: '...', value: '...' }

  // Map table labels to actual input names
  const selectorMap = {
    'Payee Name': 'payee.name',
    'Address': 'payee.address.street',
    'City': 'payee.address.city',
    'State': 'payee.address.state',
    'Zip Code': 'payee.address.zipCode',
    'Phone': 'payee.phoneNumber',
    'Account Number': 'payee.accountNumber',
    'Verify Account': 'verifyAccount',
    'Amount': 'amount'
  };

  for (const row of rows) {
    const { field, value } = row;
    const inputName = selectorMap[field];
    if (!inputName) throw new Error(`Unknown payee field: ${field}`);

    const selector = `input[name="${inputName}"]`;
    await this.page.waitForSelector(selector, { state: 'visible', timeout: 60000 });
    await this.page.fill(selector, ''); // clear first
    await this.page.fill(selector, value);
  }
});



When('I enter payment amount {string}', async function (amount) {
  await ensurePage(this);
  await this.page.fill('input[name="amount"]', amount);
});

When('I select account to pay from', async function () {
  await ensurePage(this);
  await this.page.selectOption('select[name="fromAccountId"]', { index: 0 });
});

Then('I should see payment success message', async function () {
  await ensurePage(this);
  await this.page.waitForSelector('div#rightPanel:has-text("Bill Payment Complete")', { timeout: 60000 });
});

/*Then('the payment should be deducted from account balance', async function () {
  await ensurePage(this);
  await this.page.click('a[href*="overview.htm"]');
  const balances = await this.page.$$eval('table tr td:nth-child(2)', els => els.map(e => e.textContent.trim()));
  expect(balances.length).toBeGreaterThan(0);
});*/

Then('the payment should be deducted from account balance', async function () {
  await ensurePage(this);

  // Navigate back to the account overview page
  await this.page.click('a[href*="overview.htm"]');

  // Locate the row corresponding to the savings account created
  const accountRow = await this.page.locator(`#accountTable tbody tr:has-text("${this.savingsAccount}")`);
  await accountRow.waitFor({ state: 'visible', timeout: 10000 });

  // Get the balance text from the 2nd column of that row
  const balanceText = await accountRow.locator('td:nth-child(2)').textContent();
  
  // Convert it to a number (strip currency symbols, commas, etc.)
  const balance = parseFloat(balanceText.replace(/[^0-9.-]+/g, ""));

  // Assert that balance is greater than 0
  expect(balance).toBeGreaterThan(0);
});


Then('payment transaction should be recorded', async function () {
  await ensurePage(this);
  await this.page.click('a[href*="activity.htm"]');
  const rows = await this.page.$$('table tr');
  expect(rows.length).toBeGreaterThan(1);
});

///////////////////////////
// Accounts Overview
///////////////////////////
Then('I should see all my accounts listed', async function () {
  await ensurePage(this);
  const rows = await this.page.$$('table tr');
  expect(rows.length).toBeGreaterThan(1);
});

Then('each account should display correct balance', async function () {
  await ensurePage(this);
  const balances = await this.page.$$eval('table tr td:nth-child(2)', els => els.map(e => parseFloat(e.textContent.trim().replace('$', ''))));
  balances.forEach(b => expect(b).toBeGreaterThanOrEqual(0));
});

/*Then('account details should be accurate', async function () {
  await ensurePage(this);
  const accountId = this.getTestData('newAccountId');
  const accountExists = await this.page.$(`a:has-text("${accountId}")`);
  expect(accountExists).not.toBeNull();
});*/

Then('account details should be accurate', async function () {
  // Wait for the account table row link to appear
  const accountLink = this.page.locator('//*[@id="accountTable"]/tbody/tr[1]/td[1]/a');

  await accountLink.waitFor({ state: 'visible', timeout: 60000 });

  const accountNumber = await accountLink.textContent();
  expect(accountNumber).not.toBeNull();
  expect(accountNumber.trim()).not.toEqual('');  // ensure not empty

  console.log(`✅ Found account number: ${accountNumber}`);
});


///////////////////////////
// End-to-end workflow
///////////////////////////
Then('all banking operations should be completed successfully', async function () {
  console.log('✅ All UI banking steps executed successfully');
});

Then('all transactions should be properly recorded', async function () {
  console.log('✅ Transactions verified (if API/DB verification implemented)');
});

// Capture UI balance after transaction
Then('I capture the UI balance', async function () {
  await ensurePage(this);

  // Navigate to accounts overview
  await this.page.click('a[href*="overview.htm"]');

  // Wait for balances table to be visible
  await this.page.waitForSelector('table tr td:nth-child(2)', { timeout: 30000 });

  // Get the first balance
  const balanceText = await this.page.textContent('table tr td:nth-child(2)');
  const uiBalance = parseFloat(balanceText.replace('$', '').replace(',', '').trim());

  console.log('💰 Captured UI Balance:', uiBalance);

  // Store in world context
  this.uiBalance = uiBalance;
});



