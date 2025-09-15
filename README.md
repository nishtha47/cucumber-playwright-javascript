# Cucumber-Playwright-Javascript
Automation framework using cucumber playwright and JavaScript language.


# ParaBank Test Automation Framework

A comprehensive test automation framework for ParaBank application using Cucumber, Playwright, and JavaScript. This framework supports both API and UI testing across multiple browsers with parallel execution capabilities.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [CI/CD Integration](#cicd-integration)
- [Test Reports](#test-reports)
- [Browser Support](#browser-support)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

This framework provides automated testing capabilities for the ParaBank demo banking application (https://parabank.parasoft.com/parabank). It includes comprehensive test coverage for:

- **API Testing**: Account management, transactions, fund transfers
- **UI Testing**: User registration, login, navigation, banking operations
- **Cross-browser Testing**: Chromium, Firefox, WebKit
- **Parallel Execution**: Multiple browser tests running simultaneously
- **CI/CD Ready**: Jenkins pipeline integration with HTML reports

## Features

- **BDD Framework**: Cucumber with Gherkin syntax for readable test scenarios
- **Multi-browser Support**: Chromium, Firefox, WebKit via Playwright
- **Parallel Execution**: Concurrent test execution across browsers
- **API & UI Testing**: Comprehensive coverage of both interfaces
- **Rich Reporting**: JSON and HTML test reports with detailed results
- **CI/CD Integration**: Jenkins pipeline with artifact archiving
- **Environment Configuration**: Flexible configuration for different environments
- **Error Handling**: Robust error handling with detailed logging

## Prerequisites

- **Node.js**: Version 14 or higher
- **NPM**: Latest version
- **Operating System**: Linux/macOS/Windows (Linux recommended for CI/CD)
- **Memory**: Minimum 4GB RAM for parallel browser execution
- **Jenkins**: For CI/CD pipeline (optional)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nishtha47/cucumber-playwright-javascript.git
   cd cucumber-playwright-javascript
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

4. **Install system dependencies** (Linux/CI environments):
   ```bash
   npx playwright install-deps
   ```

## Project Structure

```
cucumber-playwright-javascript-nm/
├── src/
│   ├── features/                 # Cucumber feature files
│   │   ├── parabank-api.feature  # API test scenarios
│   │   └── parabank-ui.feature   # UI test scenarios
│   ├── step-definitions/         # Step definition files
│   │   ├── parabank-api-steps.js # API step implementations
│   │   └── parabank-ui-steps.js  # UI step implementations
│   ├── support/                  # Test support files
│   │   ├── hooks.js             # Before/After hooks
│   │   ├── world.js             # Custom World class
│   │   └── api-client.js        # API client utilities
│   └── utils/                   # Utility functions
│       ├── test-data-generator.js # Test data creation utilities
│       ├── config-manager.js     # Environment configuration
│       └── logger.js            # Logging utilities
├── reports/                     # Test execution reports
│   ├── cucumber-report.html     # HTML cucumber report
│   ├── cucumber-report.json     # JSON cucumber report
│   ├── junit-report.xml         # JUnit XML report
│   ├── playwright-report/       # Playwright HTML reports
│   │   └── index.html
│   ├── screenshots/             # Test failure screenshots
│   └── videos/                  # Test execution videos
├── docker/                      # Docker configuration files
│   ├── Dockerfile              # Main application Dockerfile
│   ├── Dockerfile.test         # Test execution Dockerfile
│   ├── docker-compose.yml      # Multi-service orchestration
│   ├── docker-compose.test.yml # Test environment setup
│   └── scripts/                # Docker utility scripts
│       ├── build.sh            # Docker build script
│       ├── run-tests.sh        # Test execution script
│       └── cleanup.sh          # Cleanup script
├── config/                     # Configuration files
│   ├── cucumber.js             # Cucumber configuration
│   ├── playwright.config.js    # Playwright configuration
│   ├── environments/           # Environment-specific configs
│   │   ├── dev.json
│   │   ├── staging.json
│   │   └── prod.json
│   └── test-settings.json      # Test execution settings
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml              # Continuous Integration
│       └── nightly-tests.yml   # Scheduled test runs
├── docs/                       # Project documentation
│   ├── api-documentation.md    # API testing guide
│   ├── ui-testing-guide.md     # UI testing best practices
│   └── docker-setup.md        # Docker setup instructions
├── .dockerignore              # Docker ignore file
├── .gitignore                 # Git ignore file
├── Jenkinsfile                # CI/CD pipeline configuration
├── package.json               # Project dependencies
├── package-lock.json          # Locked dependency versions
└── README.md                  # Project documentation
```

## Configuration

### Environment Variables

Set these environment variables for different configurations:

```bash
# Application URL
export BASE_URL="https://parabank.parasoft.com/parabank"

# Browser selection (chromium, firefox, webkit)
export BROWSER="chromium"

# Playwright browser path (for CI environments)
export PLAYWRIGHT_BROWSERS_PATH="/path/to/browsers"

# Environment
export NODE_ENV="test"
```

### Browser Configuration

The framework automatically detects and configures browsers. For headless execution (CI environments), browsers run in headless mode by default.

## Running Tests

### Local Execution

**Run all tests**:
```bash
npm test
```

**Run API tests only**:
```bash
npx cucumber-js src/features/parabank-api.feature
```

**Run UI tests only**:
```bash
npx cucumber-js src/features/parabank-ui.feature
```

**Run tests with specific browser**:
```bash
BROWSER=firefox npm test
```

### Parallel Execution

**Run tests in parallel across browsers**:
```bash
# Chromium
BROWSER=chromium npx cucumber-js src/features/**/*.feature --parallel 1 --format json:reports/chromium-report.json

# Firefox
BROWSER=firefox npx cucumber-js src/features/**/*.feature --parallel 1 --format json:reports/firefox-report.json

# WebKit
BROWSER=webkit npx cucumber-js src/features/**/*.feature --parallel 1 --format json:reports/webkit-report.json
```

## CI/CD Integration

### Jenkins Pipeline

The project includes a complete Jenkins pipeline (`Jenkinsfile`) with:

1. **Environment Setup**: System dependencies and browser installation
2. **Dependency Installation**: NPM packages and Playwright browsers
3. **Parallel Test Execution**: All browsers running simultaneously
4. **Report Generation**: JSON and HTML reports for each browser
5. **Artifact Archiving**: Test reports and logs
6. **Post-execution Cleanup**: Temporary file cleanup

**Key Pipeline Features**:
- Automatic browser dependency installation
- Parallel execution across Chromium, Firefox, WebKit
- Error handling with graceful degradation
- Comprehensive reporting and artifact management
- Environment-specific configurations

### Running in Jenkins

1. Create a new Pipeline job in Jenkins
2. Configure it to use the repository's Jenkinsfile
3. Set up any required credentials or environment variables
4. Run the pipeline

The pipeline will automatically:
- Install all dependencies
- Run tests across all browsers
- Generate HTML reports accessible via Jenkins UI
- Archive all test artifacts

## Test Reports

### JSON Reports
Located in `reports/` directory:
- `chromium-report.json`
- `firefox-report.json` 
- `webkit-report.json`

### HTML Reports
Generated automatically during execution:
- `reports/chromium-report.html`
- `reports/firefox-report.html`
- `reports/webkit-report.html`

### Jenkins Integration
HTML reports are automatically published in Jenkins with:
- Test execution summaries
- Pass/fail statistics
- Detailed scenario results
- Screenshots for failed tests (UI tests)

## Browser Support

| Browser | Status | Notes |
|---------|--------|--------|
| Chromium | ✅ Full Support | Default browser for development |
| Firefox | ✅ Full Support | Cross-browser compatibility testing |
| WebKit | ✅ Full Support | Safari engine testing |

All browsers support:
- Headless execution
- Screenshot capture on failures
- Network request interception
- Mobile device emulation

  

## Troubleshooting

### Common Issues

**Browser installation failures**:
```bash
# Install system dependencies
sudo npx playwright install-deps

# Reinstall browsers
npx playwright install --force
```

**Permission errors in CI**:
```bash
# Ensure proper permissions
chmod +x node_modules/.bin/*
```

**Memory issues during parallel execution**:
- Reduce parallel worker count
- Increase available system memory
- Use `--parallel 1` for sequential execution

**Network connectivity issues**:
- Check ParaBank application availability
- Verify firewall settings
- Use appropriate timeout configurations

### Debug Mode

Enable debug logging:
```bash
DEBUG=pw:api npm test
```

### System Requirements

**Minimum Requirements**:
- 4GB RAM for parallel execution
- 2GB free disk space
- Node.js 14+

**Recommended Requirements**:
- 8GB RAM
- SSD storage
- Multi-core processor

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Commit your changes: `git commit -am 'Add new feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

### Development Guidelines

- Follow existing code style and structure
- Add appropriate test coverage for new features
- Update documentation for significant changes
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

### Test Development

When adding new test scenarios:
1. Write feature files in Gherkin syntax
2. Implement step definitions with proper error handling
3. Add appropriate assertions and validations
4. Test across all supported browsers
5. Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions:
- Create an issue in the GitHub repository
- Check existing documentation and troubleshooting guides
- Review the Jenkins pipeline logs for CI/CD issues

---

**Note**: This framework is designed for testing the ParaBank demo application. Ensure the target application is accessible before running tests.
