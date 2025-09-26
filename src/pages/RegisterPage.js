const BasePage = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(page, world) {
    super(page, world);

    this.url = 'https://parabank.parasoft.com/parabank/register.htm';

    this.selectors = {
      ...this.selectors,

      // Registration form fields
      firstNameField: 'input[name="customer.firstName"]',
      lastNameField: 'input[name="customer.lastName"]',
      addressField: 'input[name="customer.address.street"]',
      cityField: 'input[name="customer.address.city"]',
      stateField: 'input[name="customer.address.state"]',
      zipCodeField: 'input[name="customer.address.zipCode"]',
      phoneNumberField: 'input[name="customer.phoneNumber"]',
      ssnField: 'input[name="customer.ssn"]',

      // Account credentials
      usernameField: 'input[name="customer.username"]',
      passwordField: 'input[name="customer.password"]',
      confirmPasswordField: 'input[name="repeatedPassword"]',

      // Form controls
      registerButton: 'input[type="submit"][value="Register"]',

      // Success/Error messages
      successMessage: '#rightPanel .title',
      errorMessages: '.error',

      // Bill Pay (optional, if used here)
      payeeNameField: 'input[name="payee.name"]',
      payeeAddressField: 'input[name="payee.address.street"]',
      payeeCityField: 'input[name="payee.address.city"]',
      payeeStateField: 'input[name="payee.address.state"]',
      payeeZipCodeField: 'input[name="payee.address.zipCode"]',
      payeePhoneField: 'input[name="payee.phoneNumber"]',
      payeeAccountField: 'input[name="payee.accountNumber"]',
      payeeVerifyAccountField: 'input[name="verifyAccount"]',
    };
  }

  ///////////////////////////
  // Navigation
  ///////////////////////////
  async goToRegisterPage() {
    await this.page.goto(this.url, { waitUntil: 'networkidle' });
    await this.waitForPageLoad();
  }

  ///////////////////////////
  // Form Actions
  ///////////////////////////
  async fillRegistrationForm(userData) {
    const fields = {
      firstName: this.selectors.firstNameField,
      lastName: this.selectors.lastNameField,
      address: this.selectors.addressField,
      city: this.selectors.cityField,
      state: this.selectors.stateField,
      zipCode: this.selectors.zipCodeField,
      phoneNumber: this.selectors.phoneNumberField,
      ssn: this.selectors.ssnField,
      username: this.selectors.usernameField,
      password: this.selectors.passwordField,
      confirmPassword: this.selectors.confirmPasswordField
    };

    for (const [key, selector] of Object.entries(fields)) {
      const value = key === 'confirmPassword' ? userData.password : userData[key];
      await this.fillField(selector, value);
    }
  }

  async submitRegistrationForm() {
    await this.clickElement(this.selectors.registerButton);
    await this.waitForPageLoad();
  }

  ///////////////////////////
  // Result Handling
  ///////////////////////////
  async getSuccessMessage() {
    return await this.getTextContent(this.selectors.successMessage);
  }

  async getErrorMessages() {
    const errors = [];
    if (await this.elementExists(this.selectors.errorMessages)) {
      const elements = await this.getAllElements(this.selectors.errorMessages);
      for (const el of elements) {
        const text = await el.textContent();
        if (text?.trim()) errors.push(text.trim());
      }
    }
    return errors;
  }

  async waitForRegistrationResult(timeout = 10000) {
    if (await this.waitForElement(this.selectors.successMessage, timeout)) {
      return true;
    }
    if (await this.elementExists(this.selectors.errorMessages)) {
      const errors = await this.getErrorMessages();
      console.log(`Registration errors: ${errors.join(', ')}`);
      return false;
    }
    return false;
  }

  ///////////////////////////
  // Bill Pay Form (optional)
  ///////////////////////////
  async fillPayeeForm(data) {
    await this.fillField(this.selectors.payeeNameField, data.name);
    await this.fillField(this.selectors.payeeAddressField, data.address);
    await this.fillField(this.selectors.payeeCityField, data.city);
    await this.fillField(this.selectors.payeeStateField, data.state);
    await this.fillField(this.selectors.payeeZipCodeField, data.zip);
    await this.fillField(this.selectors.payeePhoneField, data.phone);
    await this.fillField(this.selectors.payeeAccountField, data.account);
    await this.fillField(this.selectors.payeeVerifyAccountField, data.verifyAccount);
  }

  ///////////////////////////
  // Utilities & Validation
  ///////////////////////////
  async clearAllFields() {
    const fields = [
      this.selectors.firstNameField,
      this.selectors.lastNameField,
      this.selectors.addressField,
      this.selectors.cityField,
      this.selectors.stateField,
      this.selectors.zipCodeField,
      this.selectors.phoneNumberField,
      this.selectors.ssnField,
      this.selectors.usernameField,
      this.selectors.passwordField,
      this.selectors.confirmPasswordField
    ];

    for (const selector of fields) {
      if (await this.elementExists(selector)) {
        await this.clearAndFill(selector, '');
      }
    }
  }

  async getCurrentFormValues() {
    const fields = {
      firstName: this.selectors.firstNameField,
      lastName: this.selectors.lastNameField,
      address: this.selectors.addressField,
      city: this.selectors.cityField,
      state: this.selectors.stateField,
      zipCode: this.selectors.zipCodeField,
      phoneNumber: this.selectors.phoneNumberField,
      ssn: this.selectors.ssnField,
      username: this.selectors.usernameField,
      password: this.selectors.passwordField,
      confirmPassword: this.selectors.confirmPasswordField
    };

    const values = {};
    for (const [key, selector] of Object.entries(fields)) {
      if (await this.elementExists(selector)) {
        values[key] = await this.getAttribute(selector, 'value');
      }
    }
    return values;
  }

  async isUsernameAvailable(username) {
    await this.clearAndFill(this.selectors.usernameField, username);
    await this.wait(1000);
    if (await this.elementExists(this.selectors.errorMessages)) {
      const text = await this.getTextContent(this.selectors.errorMessages);
      return !(text.toLowerCase().includes('username') && text.toLowerCase().includes('already exists'));
    }
    return true;
  }

  async verifyPageLoaded() {
    const title = await this.getPageTitle();
    return title.includes('ParaBank') &&
           await this.elementExists(this.selectors.registerButton) &&
           await this.elementExists(this.selectors.firstNameField);
  }
}

module.exports = RegisterPage;
