class AccountPage {
    constructor(page) {
        this.page = page;
    }

    // Navigate to "Open New Account" page
    async navigateToOpenNewAccount() {
        await this.page.click('a[href*="openaccount"]');
    }

    // Create a new account of given type and return the new account number
    async createNewAccount(accountType) {
        await this.page.selectOption('#type', { label: accountType });
        const options = await this.page.$$eval('#fromAccountId option', els => els.map(e => e.value));
        await this.page.selectOption('#fromAccountId', options[0]);
        await this.page.click('input[value="Open New Account"]');
        const newAccountNumber = await this.page.textContent('#newAccountId');
        return newAccountNumber.trim();
    }

    // Select source account in transfer funds
    async selectSourceAccount(accountNumber) {
        await this.page.selectOption('#fromAccountId', accountNumber);
    }

    // Select destination account in transfer funds
    async selectDestinationAccount(accountNumber) {
        await this.page.selectOption('#toAccountId', accountNumber);
    }

    // Enter amount to transfer
    async enterTransferAmount(amount) {
        await this.page.fill('#amount', amount);
    }

    // Get balance of a given account
    async getAccountBalance(accountNumber) {
        const accounts = await this.page.$$eval('#accountTable td a', els => {
            return els.map(e => ({
                account: e.textContent.trim(),
                balance: e.parentElement.nextElementSibling.textContent.trim()
            }));
        });
        const account = accounts.find(a => a.account === accountNumber);
        return account ? account.balance : null;
    }

    // Get transaction list for a given account
    async getTransactions(accountNumber) {
        await this.page.click(`a[href*="activity.htm?accountId=${accountNumber}"]`);
        const rows = await this.page.$$eval('#transactionTable tbody tr', trs => {
            return trs.map(tr => {
                const cells = tr.querySelectorAll('td');
                return {
                    date: cells[0].textContent.trim(),
                    description: cells[1].textContent.trim(),
                    amount: cells[2].textContent.trim(),
                    type: cells[3].textContent.trim()
                };
            });
        });
        return rows;
    }
}
    // src/helpers/account.js
async function createSavingsAccount(page, accountType = 'SAVINGS') {
  // Navigate to Open New Account page
  await page.click('text=Open New Account');

  // Wait for form to appear
  await page.waitForSelector('#openAccountForm', { state: 'visible', timeout: 60000 });

  // Select account type
  await page.selectOption('select#type', accountType);

  // Click Open New Account button
  const openButton = page.locator('#openAccountForm input[type="submit"]');
  await openButton.waitFor({ state: 'visible', timeout: 60000 });
  await openButton.click();

  // Wait for confirmation that account is created
  await page.waitForSelector('#newAccountId, #accountTable', { state: 'visible', timeout: 60000 });

  // Capture the newly created account number (optional)
  const accountNumber = await page.locator('#newAccountId, #accountTable tbody tr:first-child td:first-child a').textContent();
  console.log(`✅ Created ${accountType} account with number: ${accountNumber.trim()}`);

  return accountNumber.trim();


class AccountPage {
    constructor(page) {
        this.page = page;
    }

    // Navigate to "Open New Account" page
    async navigateToOpenNewAccount() {
        await this.page.click('a[href*="openaccount"]');
    }

    // Create a new account of given type and return the new account number
    async createNewAccount(accountType) {
        await this.page.selectOption('#type', { label: accountType });
        const options = await this.page.$$eval('#fromAccountId option', els => els.map(e => e.value));
        await this.page.selectOption('#fromAccountId', options[0]);
        await this.page.click('input[value="Open New Account"]');
        const newAccountNumber = await this.page.textContent('#newAccountId');
        return newAccountNumber.trim();
    }

    // Select source account in transfer funds
    async selectSourceAccount(accountNumber) {
        await this.page.selectOption('#fromAccountId', accountNumber);
    }

    // Select destination account in transfer funds
    async selectDestinationAccount(accountNumber) {
        await this.page.selectOption('#toAccountId', accountNumber);
    }

    // Enter amount to transfer
    async enterTransferAmount(amount) {
        await this.page.fill('#amount', amount);
    }

    // Get balance of a given account
    async getAccountBalance(accountNumber) {
        const accounts = await this.page.$$eval('#accountTable td a', els => {
            return els.map(e => ({
                account: e.textContent.trim(),
                balance: e.parentElement.nextElementSibling.textContent.trim()
            }));
        });
        const account = accounts.find(a => a.account === accountNumber);
        return account ? account.balance : null;
    }

    // Get transaction list for a given account
    async getTransactions(accountNumber) {
        await this.page.click(`a[href*="activity.htm?accountId=${accountNumber}"]`);
        const rows = await this.page.$$eval('#transactionTable tbody tr', trs => {
            return trs.map(tr => {
                const cells = tr.querySelectorAll('td');
                return {
                    date: cells[0].textContent.trim(),
                    description: cells[1].textContent.trim(),
                    amount: cells[2].textContent.trim(),
                    type: cells[3].textContent.trim()
                };
            });
        });
        return rows;
    }
}
    // src/helpers/account.js
async function createSavingsAccount(page, accountType = 'SAVINGS') {
  // Navigate to Open New Account page
  await page.click('text=Open New Account');

  // Wait for form to appear
  await page.waitForSelector('#openAccountForm', { state: 'visible', timeout: 60000 });

  // Select account type
  await page.selectOption('select#type', accountType);

  // Click Open New Account button
  const openButton = page.locator('#openAccountForm input[type="submit"]');
  await openButton.waitFor({ state: 'visible', timeout: 60000 });
  await openButton.click();

  // Wait for confirmation that account is created
  await page.waitForSelector('#newAccountId, #accountTable', { state: 'visible', timeout: 60000 });

  // Capture the newly created account number (optional)
  const accountNumber = await page.locator('#newAccountId, #accountTable tbody tr:first-child td:first-child a').textContent();
  console.log(`✅ Created ${accountType} account with number: ${accountNumber.trim()}`);

  return accountNumber.trim();

}

module.exports = { AccountPage, createSavingsAccount };

}