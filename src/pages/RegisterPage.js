const { BasePage } = require('./BasePage');

class RegisterPage extends BasePage {
  constructor(page, world) {
    super(page, world);
  }

  // Page selectors
  selectors = {
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
    welcomeMessage: '#rightPanel p',
    registrationTitle: '#rightPanel h1.title',
    errorMessages: '.error',
    successMessage: '#rightPanel .smallText'
  };

  // Fill registration form with provided data
  async fillRegistrationForm(userData) {
    await this.fillField(this.selectors.firstNameField, userData.firstName);
    await this.fillField(this.selectors.lastNameField, userData.lastName);
    await this.fillField(this.selectors.addressField, userData.address);
    await this.fillField(this.selectors.cityField, userData.city);
    await this.fillField(this.selectors.stateField, userData.state);
    await this.fillField(this.selectors.zipCodeField, userData.zipCode);
    await this.fillField(this.selectors.phoneNumberField, userData.phoneNumber);
    await this.fillField(this.selectors.ssnField, userData.ssn);
    await this.fillField(this.selectors.usernameField, userData.username);
    await this.fillField(this.selectors.passwordField, userData.password);
    await this.fillField(this.selectors.confirmPasswordField, userData.password);
  }

  // Submit registration form
  async submitRegistrationForm() {
    await this.clickElement(this.selectors.registerButton);
    await this.waitForPageLoad();
  }

  // Complete registration process
  async registerUser(userData) {
    await this.fillRegistrationForm(userData);
    await this.submitRegistrationForm();
    
    // Wait for either success or error message
    const isSuccess = await this.waitForRegistrationResult();
    return isSuccess;
  }

  // Wait for registration result
  async waitForRegistrationResult(timeout = 10000) {
    try {
      // Wait for either success message or error message
      const successExists = await this.waitForElement(this.selectors.welcomeMessage, timeout);
      if (successExists) {
        return true;
      }
      
      const errorExists = await this.elementExists(this.selectors.errorMessages);
      if (errorExists) {
        const errorMessage = await this.getTextContent(this.selectors.errorMessages);
        console.log(`Registration error: ${errorMessage}`);
        return false;
      }
      
      return false;
    } catch (error) {
      console.log(`Registration result check failed: ${error.message}`);
      return false;
    }
  }

  // Check if registration was successful
  async isRegistrationSuccessful() {
    // Check for welcome message indicating successful registration
    if (await this.elementExists(this.selectors.welcomeMessage)) {
      const welcomeText = await this.getTextContent(this.selectors.welcomeMessage);
      return welcomeText && welcomeText.includes('Your account was created successfully');
    }
    
    // Alternative check - look for title change
    if (await this.elementExists(this.selectors.registrationTitle)) {
      const titleText = await this.getTextContent(this.selectors.registrationTitle);
      return titleText && titleText.includes('Welcome');
    }
    
    return false;
  }

  // Get registration success message
  async getSuccessMessage() {
    if (await this.elementExists(this.selectors.welcomeMessage)) {
      return await this.getTextContent(this.selectors.welcomeMessage);
    }
    return null;
  }

  // Get registration error messages
  async getErrorMessages() {
    const errors = [];
    
    if (await this.elementExists(this.selectors.errorMessages)) {
      const errorElements = await this.getAllElements(this.selectors.errorMessages);
      
      for (const element of errorElements) {
        const errorText = await element.textContent();
        if (errorText && errorText.trim()) {
          errors.push(errorText.trim());
        }
      }
    }
    
    return errors;
  }

  // Validate form fields are present
  async validateFormFields() {
    const requiredFields = [
      { selector: this.selectors.firstNameField, name: 'First Name' },
      { selector: this.selectors.lastNameField, name: 'Last Name' },
      { selector: this.selectors.addressField, name: 'Address' },
      { selector: this.selectors.cityField, name: 'City' },
      { selector: this.selectors.stateField, name: 'State' },
      { selector: this.selectors.zipCodeField, name: 'Zip Code' },
      { selector: this.selectors.phoneNumberField, name: 'Phone Number' },
      { selector: this.selectors.ssnField, name: 'SSN' },
      { selector: this.selectors.usernameField, name: 'Username' },
      { selector: this.selectors.passwordField, name: 'Password' },
      { selector: this.selectors.confirmPasswordField, name: 'Confirm Password' }
    ];

    const results = {};
    
    for (const field of requiredFields) {
      results[field.name] = await this.elementExists(field.selector);
    }
    
    return results;
  }

  // Clear all form fields
  async clearAllFields() {
    const fieldSelectors = [
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

    for (const selector of fieldSelectors) {
      if (await this.elementExists(selector)) {
        await this.clearAndFill(selector, '');
      }
    }
  }

  // Get current form values
  async getCurrentFormValues() {
    const values = {};
    
    const fieldMapping = {
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

    for (const [key, selector] of Object.entries(fieldMapping)) {
      if (await this.elementExists(selector)) {
        values[key] = await this.getAttribute(selector, 'value');
      }
    }
    
    return values;
  }

  // Check if username is already taken
  async isUsernameAvailable(username) {
    // Fill only username field and check for immediate validation
    await this.clearAndFill(this.selectors.usernameField, username);
    await this.wait(1000); // Wait for validation
    
    const hasError = await this.elementExists(this.selectors.errorMessages);
    if (hasError) {
      const errorText = await this.getTextContent(this.selectors.errorMessages);
      return !errorText.toLowerCase().includes('username') && !errorText.toLowerCase().includes('already exists');
    }
    
    return true; // Assume available if no error
  }

  // Verify page loaded correctly
  async verifyPageLoaded() {
    const pageTitle = await this.getPageTitle();
    const hasForm = await this.elementExists(this.selectors.registerButton);
    const hasFields = await this.elementExists(this.selectors.firstNameField);
    
    return pageTitle.includes('ParaBank') && hasForm && hasFields;
  }
}

module.exports = { RegisterPage };