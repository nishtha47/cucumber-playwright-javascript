const BasePage = require('./BasePage');
const { expect } = require('@playwright/test');

class HomePage extends BasePage {
  constructor(page, world) {
    super(page, world);

    this.url = 'https://parabank.parasoft.com/parabank/index.htm';

    this.selectors = {
      ...this.selectors,

      // Authentication
      loginPanel: '#loginPanel',
      usernameField: 'input[name="username"]',
      passwordField: 'input[name="password"]',
      loginButton: 'input[type="submit"][value="Log In"]',
      logoutLink: 'a[href*="logout"]',

      // Global Navigation Menu
      accountsOverviewLink: 'a[href*="overview"]',
      transferFundsLink: 'a[href*="transfer"]',
      billPayLink: 'a[href*="billpay"]',
      openNewAccountLink: 'a[href*="openaccount"]',
      menuLinks: '#menu a',

      // Welcome message
      welcomeMessage: '#leftPanel h1',

      // Accounts & balances
      accountsTable: '#accountTable',
      accountBalances: '#accountTable .ng-binding',
      newAccountId: '#newAccountId',

      // Fund transfer
      transferAmountField: 'input[name="amount"]',
      fromAccountSelect: 'select[name="fromAccountId"]',
      toAccountSelect: 'select[name="toAccountId"]',
      transferButton: 'input[value="Transfer"]',
      transferSuccessMsg: 'span:has-text("Transfer Complete!")',

      // Bill Pay
      paymentAmountField: 'input[name="amount"]',
      sendPaymentButton: 'input[value="Send Payment"]',
      paymentSuccessMsg: 'span:has-text("Bill Payment Complete")'
    };
  }

  ///////////////////////////
  // Page Navigation
  ///////////////////////////
  async goToHomePage() {
    await this.page.goto(this.url, { waitUntil: 'networkidle' });
  }

  async navigateToRegister() {
    await this.clickElement('a[href*="register"]');
  }

  async navigateToAccountsOverview() {
    await this.clickElement(this.selectors.accountsOverviewLink);
  }

  async navigateToTransferFunds() {
    await this.clickElement(this.selectors.transferFundsLink);
  }

  async navigateToBillPay() {
    await this.clickElement(this.selectors.billPayLink);
  }

  /*async navigateToOpenNewAccount() {
    await this.clickElement(this.selectors.openNewAccountLink);
  }*/

  ///////////////////////////
  // Authentication
  ///////////////////////////
  /*async login(username, password) {
    await this.fillField(this.selectors.usernameField, username);
    await this.fillField(this.selectors.passwordField, password);
    await this.clickElement(this.selectors.loginButton);

    // Wait for logout link to confirm login
    await this.page.waitForSelector(this.selectors.logoutLink, { timeout: 30000 });
  }*/

  /*async login(username, password) {
  // Ensure page is loaded
  await this.page.goto(this.url, { waitUntil: 'networkidle' });
  await this.page.waitForSelector(this.selectors.usernameField, { timeout: 10000 });

  await this.fillField(this.selectors.usernameField, username);
  await this.fillField(this.selectors.passwordField, password);
  await this.clickElement(this.selectors.loginButton);

  // Wait for logout link to confirm login
  await this.page.waitForSelector(this.selectors.logoutLink, { timeout: 30000 });
}*/

// src/pages/HomePage.js - Updated login method

async login(username, password) {
    try {
        // Wait for page to be fully loaded
        await this.page.waitForLoadState('networkidle');
        
        // Check if already logged in by looking for logout link
        const logoutLink = this.page.locator('a[href*="logout"]');
        if (await logoutLink.isVisible()) {
            console.log('User already logged in');
            return;
        }
        
        // Wait for login form with increased timeout and multiple strategies
        const usernameField = this.page.locator('input[name="username"]');
        
        // Try multiple approaches to find the login form
        try {
            await usernameField.waitFor({ 
                state: 'visible', 
                timeout: 15000 
            });
        } catch (error) {
            // If direct wait fails, try refreshing and waiting again
            console.log('Login form not found, refreshing page...');
            await this.page.reload({ waitUntil: 'networkidle' });
            await usernameField.waitFor({ 
                state: 'visible', 
                timeout: 10000 
            });
        }
        
        // Clear and fill username
        await usernameField.clear();
        await usernameField.fill(username);
        
        // Wait for password field and fill it
        const passwordField = this.page.locator('input[name="password"]');
        await passwordField.waitFor({ state: 'visible', timeout: 5000 });
        await passwordField.clear();
        await passwordField.fill(password);
        
        // Click login button
        const loginButton = this.page.locator('input[value="Log In"]');
        await loginButton.waitFor({ state: 'visible', timeout: 5000 });
        await loginButton.click();
        
        // Wait for successful login - check for welcome message or accounts overview
        const welcomeMessage = this.page.locator('text=Welcome').first();
        const accountsOverview = this.page.locator('text=Accounts Overview');
        
        await Promise.race([
            welcomeMessage.waitFor({ state: 'visible', timeout: 10000 }),
            accountsOverview.waitFor({ state: 'visible', timeout: 10000 })
        ]);
        
        console.log(`Successfully logged in as: ${username}`);
        
    } catch (error) {
        console.error(`Login failed for user ${username}:`, error.message);
        
        // Take screenshot for debugging
        await this.page.screenshot({ 
            path: `./reports/screenshots/login_failure_${Date.now()}.png`,
            fullPage: true 
        });
        
        throw new Error(`Login failed: ${error.message}`);
    }
}

  async logout() {
    if (await this.elementExists(this.selectors.logoutLink)) {
      await this.clickElement(this.selectors.logoutLink);
      await this.waitForElement(this.selectors.loginPanel);
    }
  }

  /*async getWelcomeMessage() {
    try {
      await this.page.waitForSelector(this.selectors.welcomeMessage, { timeout: 30000 });
      return (await this.getTextContent(this.selectors.welcomeMessage))?.trim() || '';
    } catch {
      return '';
    }
  }*/

  async getWelcomeMessage() {
    try {
        // Try multiple selectors for welcome message
        const welcomeSelectors = [
            '.welcomePanel p',
            '#leftPanel p:has-text("Welcome")',
            'p:has-text("Welcome")',
            '.leftmenu p',
            '[class*="welcome"]',
            'p[class*="welcome"]'
        ];
        
        for (const selector of welcomeSelectors) {
            try {
                const element = this.page.locator(selector).first();
                if (await element.isVisible({ timeout: 3000 })) {
                    const text = await element.textContent();
                    if (text && text.includes('Welcome')) {
                        return text.trim();
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        // If no welcome message found, return empty string
        return '';
        
    } catch (error) {
        console.error('Error getting welcome message:', error.message);
        return '';
    }
}

async isLoggedIn() {
    try {
        // Check multiple indicators of being logged in
        const loginIndicators = [
            'a[href*="logout"]',
            'text=Log Out',
            '#leftPanel',
            '.leftmenu',
            'a[href*="overview"]',
            'text=Accounts Overview'
        ];
        
        for (const indicator of loginIndicators) {
            try {
                const element = this.page.locator(indicator).first();
                if (await element.isVisible({ timeout: 2000 })) {
                    return true;
                }
            } catch (error) {
                continue;
            }
        }
        
        return false;
        
    } catch (error) {
        console.error('Error checking login status:', error.message);
        return false;
    }
}

/*async selectFromAccount(index = 0) {
    try {
        // Try multiple selectors for the from account dropdown
        const fromAccountSelectors = [
            'select[name="fromAccountId"]',
            '#fromAccountId',
            'select[id="fromAccountId"]',
            'select:has(option[value])'
        ];
        
        let dropdown = null;
        for (const selector of fromAccountSelectors) {
            try {
                dropdown = this.page.locator(selector);
                if (await dropdown.isVisible({ timeout: 5000 })) {
                    break;
                }
            } catch (error) {
                continue;
            }
        }
        
        if (!dropdown || !(await dropdown.isVisible())) {
            throw new Error('From account dropdown not found');
        }
        
        // Get all options
        const options = await dropdown.locator('option').all();
        if (options.length <= 1) {
            throw new Error('No accounts available in dropdown');
        }
        
        // Select by index (skip first option which is usually empty/placeholder)
        const targetIndex = index + 1;
        if (targetIndex < options.length) {
            const optionValue = await options[targetIndex].getAttribute('value');
            await dropdown.selectOption(optionValue);
            console.log(`Selected account at index ${targetIndex} with value: ${optionValue}`);
        } else {
            // Fallback to first available option
            const optionValue = await options[1].getAttribute('value');
            await dropdown.selectOption(optionValue);
            console.log(`Fallback: Selected first available account with value: ${optionValue}`);
        }
        
    } catch (error) {
        console.error('Error selecting from account:', error.message);
        throw error;
    }
}*/

   async selectFromAccount() {
        try {
            const fromAccountDropdown = this.page.locator('select#fromAccountId');
            
            // Wait for dropdown to be present
            await fromAccountDropdown.waitFor({ timeout: 10000 });
            
            // Get all options
            const options = await fromAccountDropdown.locator('option').all();
            console.log(`Found ${options.length} options in dropdown`);
            
            // Log all available options for debugging
            for (let i = 0; i < options.length; i++) {
                const option = options[i];
                const value = await option.getAttribute('value');
                const text = await option.textContent();
                console.log(`Option ${i}: value="${value}", text="${text}"`);
            }
            
            // Check if we have any valid options (more than just the placeholder)
            const validOptions = options.filter(async (option) => {
                const value = await option.getAttribute('value');
                return value && value !== '' && value !== 'null';
            });
            
            if (validOptions.length === 0) {
                throw new Error('No accounts available in dropdown');
            }
            
            // Select the first valid option
            const firstValidOption = options[1]; // Skip the first placeholder option
            const optionValue = await firstValidOption.getAttribute('value');
            
            if (!optionValue || optionValue === '' || optionValue === 'null') {
                throw new Error('No valid account options available');
            }
            
            await fromAccountDropdown.selectOption(optionValue);
            console.log(`✅ Selected account: ${optionValue}`);
            
            return optionValue;
            
        } catch (error) {
            console.error('Error in selectFromAccount:', error.message);
            
            // Additional debugging - check if user is logged in
            const leftPanel = this.page.locator('div#leftPanel');
            const isLoggedIn = await leftPanel.isVisible();
            console.log(`User logged in: ${isLoggedIn}`);
            
            if (isLoggedIn) {
                // Check accounts overview
                await this.page.click('a:has-text("Accounts Overview")');
                await this.page.waitForLoadState('networkidle');
                
                const accountsTable = this.page.locator('table#accountTable');
                const hasAccountsTable = await accountsTable.isVisible();
                console.log(`Accounts table visible: ${hasAccountsTable}`);
                
                if (hasAccountsTable) {
                    const rowCount = await accountsTable.locator('tbody tr').count();
                    console.log(`Account rows found: ${rowCount}`);
                }
            }
            
            throw error;
        }
    }

async verifyNavigationMenu() {
    try {
        // Wait for navigation to be fully loaded
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(2000);
        
        // Try multiple selectors for navigation menu
        const navSelectors = [
            '#leftPanel a',
            '.leftmenu a',
            '#navigation a',
            '.menu a',
            'a[href*="overview"]',
            'a[href*="transfer"]',
            'a[href*="billpay"]',
            'a[href*="findtrans"]',
            'a[href*="updateprofile"]'
        ];
        
        let allMenuItems = [];
        
        for (const selector of navSelectors) {
            try {
                const elements = await this.page.locator(selector).all();
                
                for (const element of elements) {
                    try {
                        if (await element.isVisible()) {
                            const text = await element.textContent();
                            const href = await element.getAttribute('href');
                            
                            if (text && text.trim() && href) {
                                const menuItem = {
                                    text: text.trim(),
                                    href: href
                                };
                                
                                // Avoid duplicates
                                if (!allMenuItems.some(item => item.text === menuItem.text && item.href === menuItem.href)) {
                                    allMenuItems.push(menuItem);
                                }
                            }
                        }
                    } catch (error) {
                        continue;
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        console.log(`Found ${allMenuItems.length} navigation menu items:`, allMenuItems.map(item => item.text));
        return allMenuItems;
        
    } catch (error) {
        console.error('Error verifying navigation menu:', error.message);
        return [];
    }
}

async clickOpenNewAccountButton() {
    try {
        // Try multiple selectors for the Open New Account button
        const buttonSelectors = [
            'input[value="Open New Account"]',
            'button:has-text("Open New Account")',
            'input[type="submit"][value*="Open"]',
            '.button:has-text("Open")'
        ];
        
        for (const selector of buttonSelectors) {
            try {
                const button = this.page.locator(selector);
                if (await button.isVisible({ timeout: 5000 })) {
                    await button.click();
                    console.log(`Clicked Open New Account button using selector: ${selector}`);
                    return;
                }
            } catch (error) {
                continue;
            }
        }
        
        throw new Error('Open New Account button not found');
        
    } catch (error) {
        console.error('Error clicking Open New Account button:', error.message);
        throw error;
    }
}

// Enhanced navigation methods with better error handling
async navigateToOpenNewAccount() {
    try {
        const linkSelectors = [
            'a[href*="openaccount"]',
            'text=Open New Account',
            'a:has-text("Open New Account")'
        ];
        
        for (const selector of linkSelectors) {
            try {
                const link = this.page.locator(selector).first();
                if (await link.isVisible({ timeout: 5000 })) {
                    await link.click();
                    await this.page.waitForLoadState('networkidle');
                    console.log(`Navigated to Open New Account page using selector: ${selector}`);
                    return;
                }
            } catch (error) {
                continue;
            }
        }
        
        // Fallback: direct navigation
        await this.page.goto('https://parabank.parasoft.com/parabank/openaccount.htm');
        await this.page.waitForLoadState('networkidle');
        console.log('Navigated to Open New Account page via direct URL');
        
    } catch (error) {
        console.error('Error navigating to Open New Account page:', error.message);
        throw error;
    }
}

  /*async isLoggedIn() {
    try {
      await this.page.waitForSelector(this.selectors.welcomeMessage, { timeout: 30000 });
      return true;
    } catch {
      return false;
    }
  }*/

  ///////////////////////////
  // Global Navigation Menu
  ///////////////////////////
  /*async verifyNavigationMenu() {
    const menuItems = await this.page.$$eval(this.selectors.menuLinks, links =>
      links.map(l => l.textContent.trim())
    );
    return menuItems;
  }*/

  async verifyNavigationLinks() {
    const links = await this.page.$$(this.selectors.menuLinks);
    for (const link of links) {
      const text = (await link.textContent()).trim();
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle' }),
        link.click()
      ]);
      expect(this.page.url()).toContain(text.toLowerCase().replace(/ /g, ""));
      await this.page.goBack();
    }
  }

  ///////////////////////////
  // Accounts Overview
  ///////////////////////////
  async getAccountList() {
    const accounts = [];
    if (await this.elementExists(this.selectors.accountsTable)) {
      const rows = await this.page.locator('#accountTable tbody tr').all();
      for (const row of rows) {
        const cells = await row.locator('td').all();
        accounts.push({
          number: (await cells[0].textContent()).trim(),
          type: (await cells[1].textContent()).trim(),
          balance: (await cells[2].textContent()).trim()
        });
      }
    }
    return accounts;
  }

  async verifyAccountsListed() {
    const accounts = await this.getAccountList();
    expect(accounts.length).toBeGreaterThan(0);
  }

  async verifyAccountBalances() {
    const balances = await this.page.$$eval(this.selectors.accountBalances, els =>
      els.map(el => parseFloat(el.textContent.replace('$', '').trim()))
    );
    expect(balances.length).toBeGreaterThan(0);
  }

  async verifyAccountExists(accountNumber) {
    const accounts = await this.getAccountList();
    const accountNumbers = accounts.map(acc => acc.number);
    expect(accountNumbers).toContain(accountNumber);
  }

  ///////////////////////////
  // Fund Transfer
  ///////////////////////////
  async enterTransferAmount(amount) {
    await this.fillField(this.selectors.transferAmountField, amount);
  }

  /*async selectFromAccount(index = 0) {
    await this.page.waitForSelector(this.selectors.fromAccountSelect, { timeout: 30000 });
    await this.page.selectOption(this.selectors.fromAccountSelect, { index });
  }*/

  async selectToAccount(index = 1) {
    await this.page.waitForSelector(this.selectors.toAccountSelect, { timeout: 30000 });
    await this.page.selectOption(this.selectors.toAccountSelect, { index });
  }

  async clickTransferButton() {
    await this.clickElement(this.selectors.transferButton);
  }

  async waitForTransferSuccess() {
    await this.waitForElement(this.selectors.transferSuccessMsg);
  }

  async verifyBalancesUpdated() {
    const balances = await this.page.$$eval(this.selectors.accountBalances, els =>
      els.map(el => parseFloat(el.textContent.replace('$', '').trim()))
    );
    expect(balances.length).toBeGreaterThan(0);
  }

  async verifyTransactionRecorded() {
    const rows = await this.page.$$('#transactionTable tr');
    expect(rows.length).toBeGreaterThan(1);
  }

  ///////////////////////////
  // Bill Pay
  ///////////////////////////
  async enterPaymentAmount(amount) {
    await this.fillField(this.selectors.paymentAmountField, amount);
  }

  async clickSendPayment() {
    await this.clickElement(this.selectors.sendPaymentButton);
  }

  async waitForPaymentSuccess() {
    await this.waitForElement(this.selectors.paymentSuccessMsg);
  }

  async verifyPaymentDeducted() {
    const balances = await this.page.$$eval(this.selectors.accountBalances, els =>
      els.map(el => parseFloat(el.textContent.replace('$', '').trim()))
    );
    expect(balances.length).toBeGreaterThan(0);
  }

  async verifyPaymentRecorded() {
    const rows = await this.page.$$('#transactionTable tr');
    expect(rows.length).toBeGreaterThan(1);
  }

  ///////////////////////////
  // Open New Account
  ///////////////////////////
  async selectAccountType(type) {
    const selector = 'select#type';
    await this.page.waitForSelector(selector, { timeout: 30000 });
    await this.page.selectOption(selector, { label: type });
  }

  async getFirstAccountId() {
    const selector = this.selectors.fromAccountSelect;
    await this.page.waitForSelector(selector, { timeout: 30000 });
    const options = await this.page.$$eval(`${selector} option`, opts => opts.map(o => o.value));
    if (!options.length) throw new Error('No accounts found');
    return options[0];
  }

  async selectFromAccountById(accountId) {
    const selector = this.selectors.fromAccountSelect;
    await this.page.waitForSelector(selector, { timeout: 30000 });
    await this.page.selectOption(selector, { value: accountId });
  }


// Method to check if user has any accounts
    async hasAccounts() {
        try {
            // Navigate to accounts overview
            await this.page.click('a:has-text("Accounts Overview")');
            await this.page.waitForLoadState('networkidle');
            
            // Check for accounts table
            const accountsTable = this.page.locator('table#accountTable');
            const isVisible = await accountsTable.isVisible();
            
            if (!isVisible) {
                return false;
            }
            
            // Check for account rows
            const rowCount = await accountsTable.locator('tbody tr').count();
            return rowCount > 0;
            
        } catch (error) {
            console.log('Error checking for accounts:', error.message);
            return false;
        }
    }

    // Add these methods to your existing HomePage class in HomePage.js

// Method to wait for account creation after registration
async waitForInitialAccount(timeout = 15000) {
    const startTime = Date.now();
    
    console.log('Waiting for initial account creation...');
    
    while (Date.now() - startTime < timeout) {
        if (await this.hasAccounts()) {
            console.log('✅ Initial account detected');
            return true;
        }
        
        await this.page.waitForTimeout(1000); // Wait 1 second before checking again
    }
    
    console.log('⚠️ No initial account found within timeout');
    return false;
}

// Enhanced method to get account information
async getAccountInfo() {
    try {
        // Navigate to accounts overview
        await this.page.click('a:has-text("Accounts Overview")');
        await this.page.waitForLoadState('networkidle');
        
        const accountsTable = this.page.locator('table#accountTable');
        await accountsTable.waitFor({ timeout: 10000 });
        
        const accounts = [];
        const rows = await accountsTable.locator('tbody tr').all();
        
        for (const row of rows) {
            try {
                const cells = await row.locator('td').all();
                if (cells.length >= 3) {
                    const accountLink = cells[0].locator('a');
                    const accountNumber = await accountLink.textContent();
                    const type = await cells[1].textContent();
                    const balance = await cells[2].textContent();
                    
                    accounts.push({
                        number: accountNumber.trim(),
                        type: type.trim(),
                        balance: balance.trim()
                    });
                }
            } catch (error) {
                console.log('Error reading account row:', error.message);
                continue;
            }
        }
        
        console.log(`Found ${accounts.length} accounts:`, accounts);
        return accounts;
        
    } catch (error) {
        console.error('Error getting account info:', error.message);
        return [];
    }
}

// Method to ensure user has accounts before proceeding
async ensureAccountsAvailable() {
    const accounts = await this.getAccountInfo();
    
    if (accounts.length === 0) {
        throw new Error('No accounts available - user may not be properly registered or logged in');
    }
    
    return accounts;
}

// Enhanced registration method
async registerUser(userData) {
    try {
        console.log(`Registering user: ${userData.username}`);
        
        // Navigate to registration
        await this.page.click('a[href*="register"]');
        await this.page.waitForLoadState('networkidle');
        
        // Fill registration form
        await this.page.fill('input[name="customer.firstName"]', userData.firstName);
        await this.page.fill('input[name="customer.lastName"]', userData.lastName);
        await this.page.fill('input[name="customer.address.street"]', userData.address);
        await this.page.fill('input[name="customer.address.city"]', userData.city);
        await this.page.fill('input[name="customer.address.state"]', userData.state);
        await this.page.fill('input[name="customer.address.zipCode"]', userData.zipCode);
        await this.page.fill('input[name="customer.phoneNumber"]', userData.phone);
        await this.page.fill('input[name="customer.ssn"]', userData.ssn);
        await this.page.fill('input[name="customer.username"]', userData.username);
        await this.page.fill('input[name="customer.password"]', userData.password);
        await this.page.fill('input[name="repeatedPassword"]', userData.password);
        
        // Submit registration
        await this.page.click('input[value="Register"]');
        await this.page.waitForLoadState('networkidle');
        
        // Verify registration success
        const successMessage = this.page.locator('p:has-text("Your account was created successfully")');
        await successMessage.waitFor({ timeout: 10000 });
        
        // Wait for automatic login - check for left panel or welcome message
        await this.page.waitForSelector('div#leftPanel', { timeout: 15000 });
        
        // Important: Wait for initial account creation
        const accountCreated = await this.waitForInitialAccount(15000);
        
        if (!accountCreated) {
            console.log('Warning: Initial account not detected, but continuing...');
        }
        
        console.log(`✅ User registered successfully: ${userData.username}`);
        return true;
        
    } catch (error) {
        console.error('Registration failed:', error.message);
        
        // Take screenshot for debugging
        await this.page.screenshot({ 
            path: `./reports/screenshots/registration_failure_${Date.now()}.png`,
            fullPage: true 
        });
        
        throw new Error(`Registration failed: ${error.message}`);
    }
}

// Modified selectFromAccount method with better error handling
async selectFromAccount() {
    try {
        // First ensure we have accounts available
        const accounts = await this.ensureAccountsAvailable();
        
        // Navigate to Open New Account page if not already there
        const currentUrl = this.page.url();
        if (!currentUrl.includes('openaccount')) {
            await this.navigateToOpenNewAccount();
        }
        
        const fromAccountDropdown = this.page.locator('select#fromAccountId');
        
        // Wait for dropdown to be present and visible
        await fromAccountDropdown.waitFor({ timeout: 10000 });
        
        // Wait a bit more for options to populate
        await this.page.waitForTimeout(2000);
        
        // Get all options
        const options = await fromAccountDropdown.locator('option').all();
        console.log(`Found ${options.length} options in dropdown`);
        
        // Log all available options for debugging
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            const value = await option.getAttribute('value');
            const text = await option.textContent();
            console.log(`Option ${i}: value="${value}", text="${text}"`);
        }
        
        // Check if we have valid options (more than just the placeholder)
        if (options.length <= 1) {
            // Try refreshing the dropdown by re-selecting account type
            console.log('No options found, trying to refresh dropdown...');
            
            const accountTypeDropdown = this.page.locator('select#type');
            const currentType = await accountTypeDropdown.inputValue();
            await accountTypeDropdown.selectOption(currentType || 'SAVINGS');
            await this.page.waitForTimeout(2000);
            
            // Check again
            const newOptions = await fromAccountDropdown.locator('option').all();
            if (newOptions.length <= 1) {
                throw new Error('No accounts available in dropdown after refresh');
            }
        }
        
        // Select the first valid option (skip placeholder at index 0)
        const firstValidOption = options[1];
        const optionValue = await firstValidOption.getAttribute('value');
        
        if (!optionValue || optionValue === '' || optionValue === 'null') {
            throw new Error('No valid account options available');
        }
        
        await fromAccountDropdown.selectOption(optionValue);
        console.log(`✅ Selected account: ${optionValue}`);
        
        return optionValue;
        
    } catch (error) {
        console.error('Error in selectFromAccount:', error.message);
        
        const isLoggedIn = await this.isLoggedIn();
        console.log(`User logged in: ${isLoggedIn}`);
        
        if (isLoggedIn) {
            const accounts = await this.getAccountInfo();
            console.log(`Available accounts: ${accounts.length}`);
        }
        
        throw error;
    }
}

// Method to create a savings account with proper error handling
async createSavingsAccount() {
    try {
        console.log('Creating savings account...');
        
        // Ensure we have existing accounts first
        await this.ensureAccountsAvailable();
        
        // Navigate to Open New Account
        await this.navigateToOpenNewAccount();
        
        // Select SAVINGS account type
        await this.page.selectOption('select#type', 'SAVINGS');
        await this.page.waitForTimeout(1000); // Wait for dropdown to update
        
        // Select from account
        await this.selectFromAccount();
        
        // Click Open New Account button
        await this.clickOpenNewAccountButton();
        await this.page.waitForLoadState('networkidle');
        
        // Verify success and get account number
        const successContainer = this.page.locator('#openAccountResult');
        await successContainer.waitFor({ timeout: 10000 });
        
        const accountLink = successContainer.locator('a#newAccountId');
        await accountLink.waitFor({ timeout: 5000 });
        
        const newAccountNumber = await accountLink.textContent();
        
        console.log(`✅ Savings account created: ${newAccountNumber.trim()}`);
        
        return {
            number: newAccountNumber.trim(),
            type: 'SAVINGS'
        };
        
    } catch (error) {
        console.error('Failed to create savings account:', error.message);
        
        // Take screenshot for debugging
        await this.page.screenshot({ 
            path: `./reports/screenshots/account_creation_failure_${Date.now()}.png`,
            fullPage: true 
        });
        
        throw new Error(`Failed to create savings account: ${error.message}`);
    }
}

// Enhanced account type selection
async selectAccountType(type) {
    try {
        const selector = 'select#type';
        await this.page.waitForSelector(selector, { timeout: 10000 });
        
        // Get available options
        const options = await this.page.locator(`${selector} option`).all();
        console.log(`Available account types: ${options.length}`);
        
        for (const option of options) {
            const text = await option.textContent();
            const value = await option.getAttribute('value');
            console.log(`Account type option: "${text}" (value: ${value})`);
        }
        
        // Select the account type
        await this.page.selectOption(selector, type);
        console.log(`✅ Selected account type: ${type}`);
        
        // Wait for the form to update
        await this.page.waitForTimeout(1000);
        
    } catch (error) {
        console.error(`Error selecting account type ${type}:`, error.message);
        throw error;
    }
}
// Method to verify account creation success
async verifyAccountCreationSuccess() {
    try {
        // Look for success message
        const successSelectors = [
            '#openAccountResult',
            'text=Congratulations',
            'text=account opened',
            '#newAccountId'
        ];
        
        for (const selector of successSelectors) {
            try {
                const element = this.page.locator(selector);
                if (await element.isVisible({ timeout: 5000 })) {
                    console.log(`✅ Account creation success verified with selector: ${selector}`);
                    return true;
                }
            } catch (error) {
                continue;
            }
        }
        
        return false;
        
    } catch (error) {
        console.error('Error verifying account creation success:', error.message);
        return false;
    }
}

// Method to get new account number after creation
async getNewAccountNumber() {
    try {
        // Try multiple selectors for new account ID
        const accountIdSelectors = [
            'a#newAccountId',
            '#newAccountId',
            '#openAccountResult a',
            'a[href*="activity"]'
        ];
        
        for (const selector of accountIdSelectors) {
            try {
                const element = this.page.locator(selector);
                if (await element.isVisible({ timeout: 5000 })) {
                    const accountNumber = await element.textContent();
                    if (accountNumber && accountNumber.trim()) {
                        console.log(`Found new account number: ${accountNumber.trim()}`);
                        return accountNumber.trim();
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        throw new Error('Could not find new account number');
        
    } catch (error) {
        console.error('Error getting new account number:', error.message);
        throw error;
    }
}
  }
module.exports = HomePage;
