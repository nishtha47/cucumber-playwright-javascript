const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

let testStartTime;
let totalScenarios = 0;
let passedScenarios = 0;
let failedScenarios = 0;

// -------------------- BEFORE ALL --------------------
BeforeAll(async function () {
    testStartTime = new Date();
    console.log('🚀 Test execution started...');
    console.log(`📅 Start time: ${testStartTime.toISOString()}`);

    // Ensure directories exist
    ['reports', 'reports/screenshots', 'reports/html-report', 'reports/pdf', 'screenshots']
        .forEach(dir => fs.mkdirSync(path.join(__dirname, '../../', dir), { recursive: true }));

    totalScenarios = passedScenarios = failedScenarios = 0;
});

// -------------------- BEFORE EACH SCENARIO --------------------
Before(async function (scenario) {
    totalScenarios++;
    console.log(`\n=== 🎬 Starting Scenario ${totalScenarios}: ${scenario.pickle.name} ===`);

    this.currentScenario = scenario;
    this.scenarioStartTime = new Date();

    const isUiScenario = scenario.pickle.tags.some(tag => tag.name === '@ui');

    if (isUiScenario) {
        console.log('🌐 Initializing browser for UI scenario...');
        try {
            // Always create a new browser per scenario for isolation
            this.browser = await chromium.launch({ headless: false });
            this.context = await this.browser.newContext();
            this.page = await this.context.newPage();
            this.page.setDefaultTimeout(60000);
            this.page.setDefaultNavigationTimeout(60000);

            // Capture console and page errors
            this.page.on('console', msg => {
                if (msg.type() === 'error') console.log(`🔴 Browser Console Error: ${msg.text()}`);
            });
            this.page.on('pageerror', error => console.log(`🔴 Page Error: ${error.message}`));

            // Set a base URL so HomePage.navigateTo("/") works
            this.baseUrl = 'https://parabank.parasoft.com/parabank';

            // Helper method for navigation
            this.navigateTo = async (path = '/') => {
                await this.page.goto(`${this.baseUrl}${path}`, { waitUntil: 'networkidle' });
            };

        } catch (error) {
            console.error('❌ Failed to initialize browser:', error);
            throw error;
        }
    } else {
        console.log('⚡ API scenario detected, skipping browser initialization');
    }
});

// -------------------- AFTER EACH SCENARIO --------------------
After(async function (scenario) {
    const scenarioEndTime = new Date();
    const duration = (scenarioEndTime - this.scenarioStartTime) / 1000;

    console.log(`\n=== 🏁 Scenario Result: ${scenario.result.status} ===`);
    console.log(`⏱️ Duration: ${duration.toFixed(2)} seconds`);

    if (scenario.result.status === 'PASSED') passedScenarios++;
    else if (scenario.result.status === 'FAILED') failedScenarios++;

    // Capture failure info for UI scenarios
    if (scenario.result.status === 'FAILED' && this.page) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const scenarioName = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
        const screenshotDir = path.join(__dirname, '../../reports/screenshots');
        fs.mkdirSync(screenshotDir, { recursive: true });

        try {
            // Screenshot
            const screenshotPath = path.join(screenshotDir, `failed-${scenarioName}-${timestamp}.png`);
            await this.page.screenshot({ path: screenshotPath, fullPage: true, timeout: 10000 });
            if (this.attach) await this.attach(fs.readFileSync(screenshotPath), 'image/png');

            // Debug JSON
            const debugInfo = {
                scenarioName: scenario.pickle.name,
                status: scenario.result.status,
                error: scenario.result.message || 'No error message',
                url: await this.page.url(),
                timestamp: scenarioEndTime.toISOString(),
                duration: `${duration.toFixed(2)} seconds`,
                testData: this.testData || {},
                browserInfo: {
                    userAgent: await this.page.evaluate(() => navigator.userAgent),
                    viewport: await this.page.viewportSize()
                }
            };
            fs.writeFileSync(path.join(screenshotDir, `debug-${scenarioName}-${timestamp}.json`), JSON.stringify(debugInfo, null, 2));
            if (this.attach) await this.attach(JSON.stringify(debugInfo, null, 2), 'application/json');

            // HTML page source
            const sourceFile = path.join(screenshotDir, `source-${scenarioName}-${timestamp}.html`);
            fs.writeFileSync(sourceFile, await this.page.content());

        } catch (error) {
            console.error('❌ Error capturing failure info:', error);
        }
    }

    // Close browser
    if (this.browser) {
        try {
            await this.browser.close();
        } catch (cleanupError) {
            console.error('⚠️ Error during browser cleanup:', cleanupError.message);
        } finally {
            this.browser = null;
            this.context = null;
            this.page = null;
        }
    }
});

// -------------------- AFTER ALL --------------------
AfterAll(async function () {
    const testEndTime = new Date();
    const totalDuration = (testEndTime - testStartTime) / 1000;

    console.log('\n🏆 === TEST EXECUTION SUMMARY ===');
    console.log(`📅 Start: ${testStartTime.toISOString()}`);
    console.log(`📅 End: ${testEndTime.toISOString()}`);
    console.log(`⏱️ Total time: ${totalDuration.toFixed(2)} seconds`);
    console.log(`📊 Total scenarios: ${totalScenarios}`);
    console.log(`✅ Passed: ${passedScenarios}`);
    console.log(`❌ Failed: ${failedScenarios}`);
    console.log(`📈 Success rate: ${totalScenarios > 0 ? ((passedScenarios / totalScenarios) * 100).toFixed(2) : 0}%`);
});
