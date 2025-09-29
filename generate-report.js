cat > generate_report.js << 'EOF'
const fs = require('fs');
const path = require('path');

try {
    const reportsDir = process.env.REPORTS_DIR || 'reports';
    let htmlDir = path.join(reportsDir, 'html');
    fs.mkdirSync(htmlDir, { recursive: true });

    const jsonFiles = fs.readdirSync(reportsDir).filter(f => f.endsWith('.json'));
    let total = 0, passed = 0;

    for (const file of jsonFiles) {
        const filePath = path.join(reportsDir, file);
        try {
            const content = fs.readFileSync(filePath, 'utf-8').trim();
            if (!content) {
                console.log(`⚠️ Skipping empty file: ${file}`);
                continue;
            }
            const data = JSON.parse(content);

            if (Array.isArray(data)) {
                for (const f of data) {
                    if (f.elements) {
                        total += f.elements.length;
                        passed += f.elements.filter(s => s.steps.every(step => step.result.status === 'passed')).length;
                    }
                }
            }
        } catch (err) {
            console.log(`⚠️ Skipping invalid JSON file: ${file}`);
        }
    }

    const html = `
        <html>
            <body>
                <h1>Parabank Test Results</h1>
                <p>Total: ${total}</p>
                <p>Passed: ${passed}</p>
                <p>Failed: ${total - passed}</p>
            </body>
        </html>
    `;
    
    fs.writeFileSync(path.join(reportsDir, 'simple-report.html'), html);
    console.log('✅ Simple HTML report created');
} catch (e) {
    console.log('⚠️ Report generation failed:', e.message);
}
EOF
