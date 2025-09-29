pipeline {
    agent any

    environment {
        NODE_VERSION = '18.20.8'
        REPORTS_DIR = 'reports'
        DEBIAN_FRONTEND = 'noninteractive'
        PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '0'
        PLAYWRIGHT_BROWSERS_PATH = '/opt/playwright-browsers'
        NVM_DIR = "${env.HOME}/.nvm"
    }

    options {
        buildDiscarder(
            logRotator(
                daysToKeepStr: '30',
                numToKeepStr: '10'
            )
        )
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {

        stage('Environment Check') {
            steps {
                echo "🔍 Checking Jenkins environment..."
                script {
                    def whoami = sh(script: 'whoami', returnStdout: true).trim()
                    def canSudo = sh(script: 'sudo -n true 2>/dev/null && echo "yes" || echo "no"', returnStdout: true).trim()
                    echo "Running as user: ${whoami}"
                    echo "Sudo access: ${canSudo}"
                    sh 'df -h .'
                    def dockerAvailable = sh(script: 'command -v docker >/dev/null 2>&1 && echo "yes" || echo "no"', returnStdout: true).trim()
                    echo "Docker available: ${dockerAvailable}"
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
                echo "🔧 Setting up environment..."
                sh '''
                    mkdir -p ${REPORTS_DIR} ~/.cache/ms-playwright node_modules
                '''
                script {
                    sh '''
                        if sudo -n true 2>/dev/null; then
                            echo "✅ Running with sudo privileges"
                            sudo apt-get update -qq || true
                            sudo apt-get install -y curl wget gnupg2 software-properties-common || true
                        else
                            echo "⚠️ No sudo privileges - skipping system package installation"
                        fi
                    '''
                }
            }
        }

        stage('Install Node.js') {
            steps {
                echo '📦 Installing Node.js...'
                sh '''
                    if [ ! -s "$HOME/.nvm/nvm.sh" ]; then
                        echo "Installing NVM..."
                        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
                    fi

                    export NVM_DIR="$HOME/.nvm"
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                    nvm install 18.20.8
                    nvm use 18.20.8

                    node --version
                    npm --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "📦 Installing project dependencies..."
                sh '''
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

                    rm -rf node_modules package-lock.json
                    for i in 1 2 3; do
                        echo "Installation attempt $i/3..."
                        if npm install --no-fund --no-audit && npm install multiple-cucumber-html-reporter --save-dev; then
                            echo "✅ Dependencies installed successfully"
                            break
                        else
                            echo "⚠️ Installation attempt $i failed"
                            [ $i -eq 3 ] && { echo "❌ All installation attempts failed"; exit 1; }
                            sleep 10
                        fi
                    done
                '''
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                echo "🌐 Installing Playwright browsers..."
                sh '''
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    npx playwright install --with-deps chromium || echo "⚠️ Chromium installation failed (check sudo)"
                '''
            }
        }

        stage('Pre-test Validation') {
            steps {
                echo "✅ Validating test setup..."
                sh '''
                    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
                    find src -name "*.feature" | head -5
                    find src -name "*.js" | head -10
                    npm run || true
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

                            export REPORT_FILE="${REPORTS_DIR}/cucumber-report-chromium-$(date +%s).json"
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

                            export REPORT_FILE="${REPORTS_DIR}/cucumber-report-api-$(date +%s).json"
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

        stage('Generate Extent HTML Report') {
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
        unstable { echo "⚠️ Pipeline completed with issues - some tests may have failed" }
    }
}
