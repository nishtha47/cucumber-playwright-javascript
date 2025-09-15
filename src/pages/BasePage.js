class BasePage {
  constructor(page, world) {
    this.page = page;
    this.world = world;
    this.timeout = 30000;
  }

  // Common selectors used across pages
  selectors = {
    loadingSpinner: '.loading',
    errorMessage: '.error',
    successMessage: '.message'
  };

  // Wait for element to be visible
  async waitForElement(selector, timeout = this.timeout) {
    try {
      await this.page.waitForSelector(selector, { 
        state: 'visible', 
        timeout 
      });
      return true;
    } catch (error) {
      console.log(`Element not found: ${selector}`);
      return false;
    }
  }

  // Wait for element to be hidden
  async waitForElementToHide(selector, timeout = this.timeout) {
    try {
      await this.page.waitForSelector(selector, { 
        state: 'hidden', 
        timeout 
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Click element with retry mechanism
  async clickElement(selector, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    await this.page.click(selector);
    await this.page.waitForLoadState('networkidle');
  }

  // Fill input field
  async fillField(selector, value, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    await this.page.fill(selector, value);
  }

  // Get text content
  async getTextContent(selector, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    return await this.page.textContent(selector);
  }

  // Get element attribute
  async getAttribute(selector, attribute, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    return await this.page.getAttribute(selector, attribute);
  }

  // Select option from dropdown
  async selectOption(selector, value, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    await this.page.selectOption(selector, value);
  }

  // Check if element exists
  async elementExists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // Wait for page to load completely
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // Take screenshot
  async takeScreenshot(name) {
    return await this.world.takeScreenshot(name);
  }

  // Scroll element into view
  async scrollIntoView(selector) {
    await this.page.evaluate(selector => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, selector);
  }

  // Wait for text to be present
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

  // Get current URL
  async getCurrentUrl() {
    return this.page.url();
  }

  // Navigate to URL
  async navigateTo(url) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  // Wait for navigation
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  // Hover over element
  async hoverElement(selector, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    await this.page.hover(selector);
  }

  // Double click element
  async doubleClick(selector, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    await this.page.dblclick(selector);
  }

  // Right click element
  async rightClick(selector, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    await this.page.click(selector, { button: 'right' });
  }

  // Get all elements matching selector
  async getAllElements(selector) {
    return await this.page.locator(selector).all();
  }

  // Count elements
  async countElements(selector) {
    return await this.page.locator(selector).count();
  }

  // Wait for element to contain text
  async waitForElementWithText(selector, text, timeout = this.timeout) {
    try {
      await this.page.waitForSelector(`${selector}:has-text("${text}")`, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  // Clear field and fill
  async clearAndFill(selector, value, timeout = this.timeout) {
    await this.waitForElement(selector, timeout);
    await this.page.fill(selector, ''); // Clear first
    await this.page.fill(selector, value);
  }

  // Press key
  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  // Handle alert/confirm dialogs
  async handleDialog(action = 'accept', text = null) {
    this.page.on('dialog', async dialog => {
      if (text) {
        await dialog[action](text);
      } else {
        await dialog[action]();
      }
    });
  }

  // Switch to frame
  async switchToFrame(frameSelector) {
    return await this.page.frame(frameSelector);
  }

  // Get page title
  async getPageTitle() {
    return await this.page.title();
  }

  // Refresh page
  async refreshPage() {
    await this.page.reload({ waitUntil: 'networkidle' });
  }

  // Go back in browser history
  async goBack() {
    await this.page.goBack({ waitUntil: 'networkidle' });
  }

  // Go forward in browser history
  async goForward() {
    await this.page.goForward({ waitUntil: 'networkidle' });
  }

  // Wait for specific amount of time
  async wait(milliseconds) {
    await this.page.waitForTimeout(milliseconds);
  }
}

module.exports = { BasePage };