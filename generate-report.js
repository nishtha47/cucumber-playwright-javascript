const path = require('path');
const fs = require('fs');
const reporter = require('multiple-cucumber-html-reporter');

// Paths for all browser JSONs
const browsers = ['chromium', 'firefox', 'webkit'];
const jsonFiles = browsers
  .map(browser => path.join(__dirname, 'reports', `${browser}-report.json`))
  .filter(fs.existsSync); // only include existing files

if (jsonFiles.length === 0) {
  console.error('❌ No JSON reports found for any browser!');
  process.exit(1);
}

const extentReportDir = path.join(__dirname, 'reports', 'extent');

// Generate unified report
reporter.generate({
  jsonDir: path.dirname(jsonFiles[0]), // all JSONs should be in the same folder
  jsonFile: jsonFiles.map(f => path.basename(f)), // multiple JSON files
  reportPath: extentReportDir,
  displayDuration: true,
  openReportInBrowser: true,
  metadata: {
    browser: {
      name: 'Multiple Browsers',
      version: 'N/A'
    },
    device: 'CI Machine',
    platform: {
      name: process.platform,
      version: process.version
    }
  },
  customData: {
    title: 'Project Info',
    data: [
      { label: 'Project', value: 'Parabank Automation' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Execution Start Time', value: new Date().toLocaleString() }
    ]
  }
});

console.log(`✅ Unified Extent/Spark-style report generated at ${extentReportDir}`);
