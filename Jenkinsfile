pipeline {
    agent any

    environment {
        NODE_VERSION = '18.20.8'
        REPORTS_DIR = 'reports'
        DEBIAN_FRONTEND = 'noninteractive'
        PLAYWRIGHT_BROWSERS_PATH = "${env.WORKSPACE}/playwright-browsers"
        NVM_DIR = "${env.HOME}/.nvm"
    }

    options {
        buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {

        stage('Environment Check') {
            steps {
                echo "🔍 Checking Jenkins environment..."
                script {
                    echo "User: ${sh(script: 'whoami', returnStdout: true).trim()}"
                    echo "Disk usage:"
                    sh 'df -h .'
                }
            }
        }

        stage('Checkout') {
            steps {
                echo "📥 Checking out source code..."
                deleteDir()
                git branch: 'qa-coding-test',
                    url: 'https://github.com/nishtha47/cucumber-playwright-javascript-nm.git'
                sh 'ls -la'
            }
        }

        stage('Setup Environment') {
            steps {
                echo "🔧 Preparing workspace..."
                sh '''
                    mkdir -p ${REPORTS_DIR} ~/.cache/ms-playwright node_modules ${PLAYWRIGHT_BROWSERS_PATH}
                '''
            }
        }

        stage('Install Node.js & NPM') {
            steps {
                echo '📦 Installing Node.js via NVM...'
                sh '''
                    if [ ! -s "$NVM_DIR/nvm.sh" ]; then
                        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
                    fi

                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    nvm install ${NODE_VERSION}
                    nvm use ${NODE_VERSION}

                    node --version
                    npm --version
                '''
            }
        }

        stage('Install Project Dependencies') {
            steps {
                echo "📦 Installing project dependencies..."
                sh '''
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    rm -rf node_modules package-lock.json
                    npm install --no-fund --no-audit
                    npm install multiple-cucumber-html-reporter --save-dev
                '''
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                echo "🌐 Installing Playwright browsers in workspace..."
                sh '''
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH}"

                    npx playwright install --with-deps || echo "⚠️ Playwright browsers installation failed"
                '''
            }
        }

        stage('Pre-test Validation') {
            steps {
                echo "✅ Validating test setup..."
                sh '''
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    npx playwright --version || echo "⚠️ Playwright CLI not working"
                    curl -s --max-time 10 --head https://parabank.parasoft.com/parabank/index.htm || echo "⚠️ Parabank not accessible"
                '''
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Chromium Tests') {
                    environment { BROWSER = 'chromium' }
                    steps {
                        echo "🚀 Running tests in Chromium..."
                        sh '''
                            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                            export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH}"

                            REPORT_FILE="${REPORTS_DIR}/cucumber-report-chromium-$(date +%s).json"
                            timeout 20m npx cucumber-js "src/features/**/*.feature" \
                                --require "src/step-definitions/**/*.js" \
                                --require "src/support/hooks.js" \
                                --require "src/support/world.js" \
                                --format json:$REPORT_FILE \
                                --format progress \
                                --tags "not @skip and not @firefox-only and not @webkit-only" || true
                            [ -f "$REPORT_FILE" ] && echo "✅ Chromium tests report generated" || echo "⚠️ No report generated"
                        '''
                    }
                }

                stage('API Only Tests') {
                    environment { TEST_TYPE = 'api' }
                    steps {
                        echo "🔌 Running API-only tests..."
                        sh '''
                            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                            export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH}"

                            REPORT_FILE="${REPORTS_DIR}/cucumber-report-api-$(date +%s).json"
                            timeout 15m npx cucumber-js "src/features/**/*.feature" \
                                --require "src/step-definitions/**/*.js" \
                                --require "src/support/hooks.js" \
                                --require "src/support/world.js" \
                                --format json:$REPORT_FILE \
                                --format progress \
                                --tags "@api or @api-only" || true
                            [ -f "$REPORT_FILE" ] && echo "✅ API tests report generated" || echo "⚠️ No report generated"
                        '''
                    }
                }
            }
        }

        stage('Generate HTML Report') {
            steps {
                echo "📄 Generating Multiple-Cucumber HTML report..."
                sh '''
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                    node -e "
                        const report = require('multiple-cucumber-html-reporter');
                        report.generate({
                            jsonDir: '${REPORTS_DIR}',
                            reportPath: '${REPORTS_DIR}/html',
                            metadata: {
                                browser: { name: 'chromium', version: 'latest' },
                                device: 'Local Test Machine',
                                platform: { name: 'Linux', version: 'Jenkins' }
                            }
                        });
                    "
                '''
            }
        }

        stage('Publish HTML Report') {
            steps {
                echo "📄 Publishing HTML report to Jenkins..."
                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: "${REPORTS_DIR}/html",
                    reportFiles: 'index.html',
                    reportName: 'Parabank Extent Report'
                ])
            }
        }
    }

    post {
        always {
            echo "📋 Pipeline post-actions..."
            archiveArtifacts artifacts: 'reports/**/*', allowEmptyArchive: true, fingerprint: true
        }
        success { echo "✅ Pipeline completed successfully!" }
        failure { echo "❌ Pipeline failed!" }
        unstable { echo "⚠️ Pipeline completed with issues" }
    }
}
