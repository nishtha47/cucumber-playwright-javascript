const path = require('path');
const fs = require('fs');
const reporter = require('multiple-cucumber-html-reporter');

const reportsDir = path.join(__dirname, 'reports');
const extentReportDir = path.join(reportsDir, 'extent');

// ✅ Ensure folders exist
if (!fs.existsSync(reportsDir)) {
  console.error('❌ Reports directory not found:', reportsDir);
  process.exit(1);
}

// ✅ Collect existing JSON files dynamically
const jsonFiles = fs.readdirSync(reportsDir)
  .filter(f => f.endsWith('.json'))
  .map(f => path.join(reportsDir, f));

// ✅ If no valid JSON files
if (jsonFiles.length === 0) {
  console.error('❌ No valid JSON reports found in reports folder!');
  process.exit(1);
}
console.log(`✅ Found ${jsonFiles.length} JSON report(s):`);
jsonFiles.forEach(file => console.log(` ➤ ${file}`));

// ✅ Generate unified HTML report
try {
  reporter.generate({
    jsonDir: reportsDir,      // Folder containing all JSON reports
    reportPath: extentReportDir, // Output folder
    displayDuration: true,
    openReportInBrowser: false, // Avoid browser auto-open in Jenkins
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
        { label: 'Execution Time', value: new Date().toLocaleString() }
      ]
    }
  });

  console.log(`✅ Unified HTML report generated at: ${extentReportDir}`);
} catch (e) {
  console.error('❌ Report generation failed:', e.message);
  process.exit(1);
}
