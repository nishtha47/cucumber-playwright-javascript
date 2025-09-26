const { setWorldConstructor, World, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ApiClient = require('../support/ApiClient'); // correct path


// Increase default step timeout to 3 minutes
setDefaultTimeout(180000);

class CustomWorld extends World {
    constructor(options) {
        super(options);
        this.browser = null;
        this.context = null;
        this.page = null;
        this.config = { baseUrl: 'https://parabank.parasoft.com/parabank/' };
        this.testData = {};
        this.apiResponse = { transactions: [] };
    
// ---- new properties ----
        this.apiClient = new ApiClient();  // initialize API client
        this.userId = null;                // store logged-in user ID
        this.accountData = null;           // store API account info
        this.uiBalance = null;             // store captured UI balance
        this.initialBalance = null;        // optional for pre/post comparison
    }
    
     // helper to set user ID after registration/login
    async setUser(userId) {
        this.userId = userId;
    }

    // -------------------- Browser Helpers --------------------
    async initBrowser(headless = true) {
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        if (!this.context) {
            this.context = await this.browser.newContext({
                viewport: { width: 1280, height: 720 },
                ignoreHTTPSErrors: true
            });
        }
        if (!this.page) {
            this.page = await this.context.newPage();
            this.page.setDefaultTimeout(60000);
            this.page.setDefaultNavigationTimeout(60000);

            // Capture console and page errors
            this.page.on('console', msg => {
                if (msg.type() === 'error') console.log(`🔴 Console Error: ${msg.text()}`);
            });
            this.page.on('pageerror', err => console.log(`🔴 Page Error: ${err.message}`));
        }
        return this.page;
    }

    async closeBrowser() {
        if (this.page) { await this.page.close(); this.page = null; }
        if (this.context) { await this.context.close(); this.context = null; }
        if (this.browser) { await this.browser.close(); this.browser = null; }
    }

    async navigateTo(path = '/') {
        if (!this.page) await this.initBrowser();
        const url = path.startsWith('http') ? path : `${this.config.baseUrl}${path.replace(/^\/+/, '')}`;
        await this.page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    }

    // -------------------- Test Data Helpers --------------------
    setTestData(key, value) { this.testData[key] = value; }
    getTestData(key) { return this.testData[key]; }

    generateUniqueUserData() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 100000);
        return {
            firstName: `TestFirst${timestamp}`,
            lastName: `TestLast${random}`,
            address: '123 Test St',
            city: 'TestCity',
            state: 'CA',
            zipCode: '12345',
            phoneNumber: '123-456-7890',
            ssn: `${Math.floor(100000000 + Math.random() * 900000000)}`,
            username: `user${timestamp}${random}`,
            password: 'Password123!'
        };
    }

    // -------------------- Registration & Login --------------------
    async registerAndLogin() {
        await this.initBrowser();
        const user = this.generateUniqueUserData();
        this.setTestData('user', user);

        try {
            await this.navigateTo('register.htm');

            // Fill registration form
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

            // Submit registration
            await Promise.all([
                this.page.click('input[value="Register"]'),
                this.page.waitForNavigation({ waitUntil: 'networkidle' })
            ]);

            // Verify registration success
            const message = await this.page.textContent('div[id="rightPanel"]');
            if (!message || !message.includes('Your account was created successfully')) {
                throw new Error(`Registration failed → Got message: ${message}`);
            }

            // Login after registration
            await this.page.fill('input[name="username"]', user.username);
            await this.page.fill('input[name="password"]', user.password);
            await Promise.all([
                this.page.click('input[value="Log In"]'),
                this.page.waitForNavigation({ waitUntil: 'networkidle' })
            ]);

            // Confirm login by checking dashboard panel
            await this.page.waitForSelector('#leftPanel', { timeout: 30000 });
        } catch (error) {
            await this.handleError(error, 'registerAndLogin');
        }

        return user;
    }

    // -------------------- Navigation --------------------
    async navigateToPage(pageName) {
        if (!this.page) await this.initBrowser();

        const pageMap = {
            'Open New Account': 'openaccount.htm',
            'Accounts Overview': 'overview.htm',
            'Transfer Funds': 'transfer.htm',
            'Bill Pay': 'billpay.htm',
            'Find Transactions': 'findtrans.htm',
            'Update Contact Info': 'updateprofile.htm'
        };

        const pagePath = pageMap[pageName];
        if (!pagePath) throw new Error(`Unknown page: ${pageName}`);
        await this.navigateTo(pagePath);
    }

    // -------------------- Screenshot & Attachments --------------------
    async attachScreenshot(name = 'screenshot') {
        if (this.page && this.attach) {
            const buffer = await this.page.screenshot({ fullPage: true });
            await this.attach(buffer, 'image/png');
        }
    }

    async attachJson(obj, name = 'data') {
        if (this.attach) await this.attach(JSON.stringify(obj, null, 2), 'application/json');
    }

    // -------------------- Error Handling --------------------
    async handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        if (this.page) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotDir = path.join(__dirname, '../../reports/screenshots');
            fs.mkdirSync(screenshotDir, { recursive: true });
            const screenshotPath = path.join(screenshotDir, `error-${context}-${timestamp}.png`);
            await this.page.screenshot({ path: screenshotPath, fullPage: true });
            await this.attachScreenshot();
            console.log(`📸 Screenshot saved at: ${screenshotPath}`);
        }
        throw error;
    }

    // -------------------- Wait Helpers --------------------
    async waitForElement(selector, timeout = 30000) { return await this.page.waitForSelector(selector, { timeout }); }
    async waitForText(text, timeout = 30000) { return await this.page.waitForSelector(`text=${text}`, { timeout }); }

    // -------------------- API Helpers --------------------
    setApiResponse(response) { this.apiResponse = { ...response, transactions: response?.transactions || [] }; }
    getApiResponse() { return this.apiResponse; }
    normalizeTransactionFields(txns) { return (txns || []).map(txn => ({ ...txn, id: Number(txn.id), accountId: Number(txn.accountId) })); }

    // -------------------- Cleanup --------------------
    async cleanup() { await this.closeBrowser(); }
}

setWorldConstructor(CustomWorld);
