const { BasePage } = require('./BasePage');

class HomePage extends BasePage {
  constructor(page, world) {
    super(page, world);
  }

  // Page selectors
  selectors = {
    ...this.selectors,
    // Navigation
    registerLink: 'a[href*="register"]',
    loginPanel: '#loginPanel',
    usernameField: 'input[name="username"]',
    passwordField: 'input[name="password"]',
    loginButton: 'input[type="submit"][value="Log In"]',
    logoutLink: 'a[href*="logout"]',
    
    // Global Navigation Menu
    homeLink: 'a[href*="overview"]',
    accountsOverviewLink: 'a[href*="overview"]',
    transferFundsLink: 'a[href*="transfer"]',
    billPayLink: 'a[href*="billpay"]',
    findTransactionsLink: 'a[href*="findtrans"]',
    updateContactInfoLink: 'a[href*="updateprofile"]',
    requestLoanLink: 'a[href*="requestloan"]',
    openNewAccountLink: 'a[href*="openaccount"]',
    
    // Welcome message
    welcomeMessage: '.smallText',
    accountsTable: '#accountTable',
    totalBalance: '#accountTable .ng-binding',
    
    // Right panel
    accountServicesPanel: '#rightPanel',
    newAccountPromo: '.captionthree'
  };

  // Navigation methods
  async navigateToRegister() {
    await this.clickElement(this.selectors.registerLink);
  }

  async login(username, password) {
    await this.fillField(this.selectors.usernameField, username);
    await this.fillField(this.selectors.passwordField, password);
    await this.clickElement(this.selectors.loginButton);
    await this.waitForPageLoad();
  }

  async logout() {
    if (await this.elementExists(this.selectors.logoutLink)) {
      await this.clickElement(this.selectors.logoutLink);
      await this.waitForPageLoad();
    }
  }

  // Verify user is logged in
  async isLoggedIn() {
    return await this.elementExists(this.selectors.welcomeMessage);
  }

  // Get welcome message
  async getWelcomeMessage() {
    if (await this.elementExists(this.selectors.welcomeMessage)) {
      return await this.getTextContent(this.selectors.welcomeMessage);
    }
    return null;
  }

  // Global Navigation Menu methods
  async verifyNavigationMenu() {
    const menuItems = [
      { selector: this.selectors.homeLink, name: 'Home' },
      { selector: this.selectors.accountsOverviewLink, name: 'Accounts Overview' },
      { selector: this.selectors.transferFundsLink, name: 'Transfer Funds' },
      { selector: this.selectors.billPayLink, name: 'Bill Pay' },
      { selector: this.selectors.findTransactionsLink, name: 'Find Transactions' },
      { selector: this.selectors.updateContactInfoLink, name: 'Update Contact Info' },
      { selector: this.selectors.requestLoanLink, name: 'Request Loan' },
      { selector: this.selectors.openNewAccountLink, name: 'Open New Account' }
    ];

    const results = {};
    
    for (const item of menuItems) {
      results[item.name] = {
        exists: await this.elementExists(item.selector),
        clickable: false
      };
      
      if (results[item.name].exists) {
        try {
          // Test if element is clickable by hovering
          await this.hoverElement(item.selector);
          results[item.name].clickable = true;
        } catch (error) {
          console.log(`Menu item ${item.name} exists but not clickable: ${error.message}`);
        }
      }
    }
    
    return results;
  }

  // Navigate to specific pages via menu
  async navigateToAccountsOverview() {
    await this.clickElement(this.selectors.accountsOverviewLink);
  }

  async navigateToTransferFunds() {
    await this.clickElement(this.selectors.transferFundsLink);
  }

  async navigateToBillPay() {
    await this.clickElement(this.selectors.billPayLink);
  }

  async navigateToFindTransactions() {
    await this.clickElement(this.selectors.findTransactionsLink);
  }

  async navigateToOpenNewAccount() {
    await this.clickElement(this.selectors.openNewAccountLink);
  }

  async navigateToUpdateContactInfo() {
    await this.clickElement(this.selectors.updateContactInfoLink);
  }

  async navigateToRequestLoan() {
    await this.clickElement(this.selectors.requestLoanLink);
  }

  // Account information methods
  async getAccountsTable() {
    if (await this.elementExists(this.selectors.accountsTable)) {
      return await this.page.locator(this.selectors.accountsTable);
    }
    return null;
  }

  async getTotalBalance() {
    const balanceElements = await this.page.locator('#accountTable .ng-binding').all();
    if (balanceElements.length > 0) {
      // Usually the last element contains the total
      const lastElement = balanceElements[balanceElements.length - 1];
      const balanceText = await lastElement.textContent();
      return balanceText ? balanceText.trim() : null;
    }
    return null;
  }

  async getAccountList() {
    const accounts = [];
    
    if (await this.elementExists(this.selectors.accountsTable)) {
      const rows = await this.page.locator('#accountTable tbody tr').all();
      
      for (const row of rows) {
        const cells = await row.locator('td').all();
        if (cells.length >= 3) {
          const account = {
            number: await cells[0].textContent(),
            type: await cells[1].textContent(),
            balance: await cells[2].textContent()
          };
          accounts.push(account);
        }
      }
    }
    
    return accounts;
  }

  // Utility methods
  async waitForAccountsToLoad() {
    // Wait for accounts table to be populated
    await this.waitForElement(this.selectors.accountsTable);
    await this.wait(2000); // Additional wait for dynamic content
  }

  async verifyPageTitle() {
    const title = await this.getPageTitle();
    return title.includes('ParaBank') || title.includes('Accounts Overview');
  }

  // Check if user has any accounts
  async hasAccounts() {
    if (await this.elementExists(this.selectors.accountsTable)) {
      const accountCount = await this.countElements('#accountTable tbody tr');
      return accountCount > 0;
    }
    return false;
  }
}

module.exports = { HomePage };