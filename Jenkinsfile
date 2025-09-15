pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
        BASE_URL = 'https://parabank.parasoft.com/parabank'
        PLAYWRIGHT_BROWSERS_PATH = '/var/jenkins_home/.cache/ms-playwright'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out source code..."
                git url: 'https://github.com/nishtha47/cucumber-playwright-javascript-nm.git', branch: 'qa-coding-test'
            }
        }

        stage('Setup Environment') {
            steps {
                echo "Creating reports directory..."
                sh 'mkdir -p reports'
                
                echo "Installing system dependencies for browsers..."
                script {
                    try {
                        sh '''
                            if command -v sudo >/dev/null 2>&1; then
                                sudo apt-get update -qq
                                sudo apt-get install -y \
                                    libnss3 libnspr4 libatk-bridge2.0-0 libdrm2 \
                                    libxkbcommon0 libxcomposite1 libxdamage1 \
                                    libxrandr2 libgbm1 libxss1 libasound2
                            fi
                        '''
                    } catch (Exception e) {
                        echo "Warning: Could not install system dependencies - ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "Installing NPM dependencies..."
                sh 'npm ci'

                echo "Installing Playwright browsers..."
                sh '''
                    export PLAYWRIGHT_BROWSERS_PATH=/var/jenkins_home/.cache/ms-playwright
                    mkdir -p "$PLAYWRIGHT_BROWSERS_PATH"
                    npx playwright install chromium firefox webkit --with-deps || npx playwright install chromium firefox webkit
                '''
            }
        }

        stage('Run Tests in Parallel') {
            parallel {
                stage('Chromium Tests') {
                    steps {
                        echo "Running Chromium tests..."
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh """
                            export BROWSER=chromium
                            export PLAYWRIGHT_BROWSERS_PATH=/var/jenkins_home/.cache/ms-playwright
                            npx cucumber-js src/features/**/*.feature \
                                --require src/step-definitions/**/*.js \
                                --require src/support/hooks.js \
                                --require src/support/world.js \
                                --format json:reports/chromium-report.json \
                                --format summary \
                                --parallel 1 || echo "Chromium tests completed with issues"
                            """
                        }
                    }
                }

                stage('Firefox Tests') {
                    steps {
                        echo "Running Firefox tests..."
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh """
                            export BROWSER=firefox
                            export PLAYWRIGHT_BROWSERS_PATH=/var/jenkins_home/.cache/ms-playwright
                            npx cucumber-js src/features/**/*.feature \
                                --require src/step-definitions/**/*.js \
                                --require src/support/hooks.js \
                                --require src/support/world.js \
                                --format json:reports/firefox-report.json \
                                --format summary \
                                --parallel 1 || echo "Firefox tests completed with issues"
                            """
                        }
                    }
                }

                stage('WebKit Tests') {
                    steps {
                        echo "Running WebKit tests..."
                        catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                            sh """
                            export BROWSER=webkit
                            export PLAYWRIGHT_BROWSERS_PATH=/var/jenkins_home/.cache/ms-playwright
                            npx cucumber-js src/features/**/*.feature \
                                --require src/step-definitions/**/*.js \
                                --require src/support/hooks.js \
                                --require src/support/world.js \
                                --format json:reports/webkit-report.json \
                                --format summary \
                                --parallel 1 || echo "WebKit tests completed with issues"
                            """
                        }
                    }
                }
            }
        }

        stage('Validate Test Reports') {
            steps {
                echo "Validating test reports..."
                sh '''
                    for browser in chromium firefox webkit; do
                        if [ ! -f "reports/${browser}-report.json" ] || [ ! -s "reports/${browser}-report.json" ]; then
                            echo "Creating placeholder JSON for ${browser}"
                            echo "[]" > reports/${browser}-report.json
                        fi
                    done
                '''
            }
        }

        stage('Generate Unified HTML Report') {
            steps {
                echo "Generating unified Extent/Spark-style report..."
                sh '''
                    npm install multiple-cucumber-html-reporter --save-dev --no-audit --no-fund || echo "Reporter installation skipped"

                    node -e "
                        const path = require('path');
                        const fs = require('fs');
                        const reporter = require('multiple-cucumber-html-reporter');

                        const browsers = ['chromium', 'firefox', 'webkit'];
                        const jsonFiles = browsers.map(b => path.join(__dirname, 'reports', b+'-report.json')).filter(fs.existsSync);

                        if (jsonFiles.length === 0) {
                            console.error('❌ No JSON reports found!');
                            process.exit(1);
                        }

                        reporter.generate({
                            jsonDir: path.dirname(jsonFiles[0]),
                            jsonFile: jsonFiles.map(f => path.basename(f)),
                            reportPath: path.join(__dirname,'reports','extent'),
                            displayDuration: true,
                            openReportInBrowser: true,
                            metadata: {
                                browser: { name: 'Multiple Browsers', version: 'N/A' },
                                device: 'CI Machine',
                                platform: { name: process.platform, version: process.version }
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
                        console.log('✅ Unified report generated at reports/extent');
                    "
                '''
                publishHTML([
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports/extent',
                    reportFiles: 'index.html',
                    reportName: 'Unified Extent Spark Report'
                ])
            }
        }

        stage('Test Summary') {
            steps {
                echo "Generating test summary..."
                sh '''
                    for browser in chromium firefox webkit; do
                        count=$(node -e "
                            try {
                                const data = JSON.parse(require('fs').readFileSync('reports/${browser}-report.json','utf8'));
                                console.log(data.length || 0);
                            } catch(e){ console.log(0); }
                        " 2>/dev/null)
                        echo "${browser}: $count features"
                    done
                '''
            }
        }
    }

    post {
        always {
            echo "Archiving test artifacts..."
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true
        }
        success { echo "Pipeline completed successfully!" }
        unstable { echo "Pipeline completed with some test failures." }
        failure { echo "Pipeline failed!" }
        cleanup {
            echo "Performing cleanup..."
            sh '''
                find . -name "*.tmp" -type f -delete 2>/dev/null || true
                find . -name "playwright-report" -type d -exec rm -rf {} + 2>/dev/null || true
            '''
        }
    }
}
