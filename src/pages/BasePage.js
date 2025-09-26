class BasePage {
  constructor(page, world) {
    this.page = page;
    this.world = world;
    this.timeout = 30000; // default timeout
  }

  // Common selectors
  selectors = {
    loadingSpinner: '.loading',
    errorMessage: '.error',
    successMessage: '.message'
  };

  ///////////////////////////
  // ELEMENT ACTIONS
  ///////////////////////////

  // Wait for element to be visible
  async waitForElement(selector, timeout = this.timeout) {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout });
      return true;
    } catch (error) {
      console.warn(`Element not found: ${selector}`);
      return false;
    }
  }

  // Wait for element to be hidden
  async waitForElementToHide(selector, timeout = this.timeout) {
    try {
      await this.page.locator(selector).waitFor({ state: 'hidden', timeout });
      return true;
    } catch {
      return false;
    }
  }

  // Click element with optional force
  async clickElement(selector, { timeout = this.timeout, force = false } = {}) {
    await this.waitForElement(selector, timeout);
    await this.page.locator(selector).click({ force });
    await this.page.waitForLoadState('networkidle');
  }

  // Fill input field with optional clearing
  async fillField(selector, value, { timeout = this.timeout, clear = true } = {}) {
    await this.waitForElement(selector, timeout);
    const element = this.page.locator(selector);
    if (clear) await element.fill('');
    await element.fill(value);
  }

  // Get text content
  async getTextContent(selector, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    return await this.page.locator(selector).textContent();
  }

  // Get element attribute
  async getAttribute(selector, attribute, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    return await this.page.locator(selector).getAttribute(attribute);
  }

  // Select option from dropdown
  async selectOption(selector, value, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    await this.page.locator(selector).selectOption(value);
  }

  // Check if element exists
  async elementExists(selector) {
    try {
      await this.page.locator(selector).waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  ///////////////////////////
  // PAGE NAVIGATION
  ///////////////////////////

  async navigateTo(url) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async refreshPage() {
    await this.page.reload({ waitUntil: 'networkidle' });
  }

  async goBack() {
    await this.page.goBack({ waitUntil: 'networkidle' });
  }

  async goForward() {
    await this.page.goForward({ waitUntil: 'networkidle' });
  }

  ///////////////////////////
  // SCROLL, HOVER & KEYS
  ///////////////////////////

  async scrollIntoView(selector) {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  async hoverElement(selector, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    await this.page.locator(selector).hover();
  }

  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  ///////////////////////////
  // MISC
  ///////////////////////////

  async takeScreenshot(name = 'screenshot') {
    if (this.world && this.world.takeScreenshot) {
      return await this.world.takeScreenshot(name);
    } else {
      console.warn('world.takeScreenshot not defined');
      return null;
    }
  }

  async waitForText(text, timeout = this.timeout) {
    try {
      await this.page.waitForFunction(
        text => document.body.textContent.includes(text),
        text,
        { timeout }
      );
      return true;
    } catch {
      return false;
    }
  }

  async handleDialog(action = 'accept', text = null) {
    this.page.on('dialog', async dialog => {
      if (text) await dialog[action](text);
      else await dialog[action]();
    });
  }

  async switchToFrame(frameSelector) {
    return this.page.frame(frameSelector);
  }

  async getPageTitle() {
    return this.page.title();
  }

  ///////////////////////////
  // ELEMENT COLLECTION
  ///////////////////////////

  async getAllElements(selector) {
    return await this.page.locator(selector).all();
  }

  async countElements(selector) {
    return await this.page.locator(selector).count();
  }

  async waitForElementWithText(selector, text, timeout = this.timeout) {
    try {
      await this.page.locator(`${selector}:has-text("${text}")`).waitFor({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  async clearAndFill(selector, value, timeout = this.timeout) {
    await this.fillField(selector, value, { timeout, clear: true });
  }
}

module.exports = BasePage;
