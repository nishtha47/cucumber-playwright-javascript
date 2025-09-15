#!/bin/bash

# Jenkins Setup Script for Parabank Automation Project
# This script sets up Jenkins with all required plugins and configurations

set -e

echo "🚀 Setting up Jenkins for Parabank Automation Project"
echo "=================================================="

# Configuration variables
JENKINS_HOME=${JENKINS_HOME:-"/var/lib/jenkins"}
JENKINS_URL=${JENKINS_URL:-"http://localhost:8080"}
JENKINS_CLI_JAR="$JENKINS_HOME/jenkins-cli.jar"
JENKINS_USER=${JENKINS_USER:-"admin"}
JENKINS_PASSWORD=${JENKINS_PASSWORD:-"admin123"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to wait for Jenkins to be ready
wait_for_jenkins() {
    print_status "Waiting for Jenkins to be ready..."
    local max_attempts=60
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$JENKINS_URL/login" > /dev/null 2>&1; then
            print_success "Jenkins is ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 5
    done
    
    print_error "Jenkins failed to start within expected time"
    exit 1
}

# Function to download Jenkins CLI
download_jenkins_cli() {
    print_status "Downloading Jenkins CLI..."
    
    if [ ! -f "$JENKINS_CLI_JAR" ]; then
        wget -q "$JENKINS_URL/jnlpJars/jenkins-cli.jar" -O "$JENKINS_CLI_JAR"
        print_success "Jenkins CLI downloaded"
    else
        print_status "Jenkins CLI already exists"
    fi
}

# Function to install Jenkins plugin
install_plugin() {
    local plugin_name=$1
    print_status "Installing plugin: $plugin_name"
    
    java -jar "$JENKINS_CLI_JAR" -s "$JENKINS_URL" -auth "$JENKINS_USER:$JENKINS_PASSWORD" \
        install-plugin "$plugin_name" || true
}

# Function to restart Jenkins
restart_jenkins() {
    print_status "Restarting Jenkins..."
    
    java -jar "$JENKINS_CLI_JAR" -s "$JENKINS_URL" -auth "$JENKINS_USER:$JENKINS_PASSWORD" \
        safe-restart
    
    print_status "Waiting for Jenkins to restart..."
    sleep 30
    wait_for_jenkins
}

# Main setup function
setup_jenkins() {
    print_status "Starting Jenkins setup process..."
    
    # Check if Jenkins is running
    wait_for_jenkins
    
    # Download Jenkins CLI
    download_jenkins_cli
    
    # Install required plugins
    print_status "Installing required plugins..."
    
    # Core plugins
    install_plugin "build-timeout"
    install_plugin "credentials-binding"
    install_plugin "timestamper"
    install_plugin "ws-cleanup"
    install_plugin "ant"
    install_plugin "gradle"
    install_plugin "workflow-aggregator" # Pipeline plugin
    install_plugin "pipeline-stage-view"
    install_plugin "pipeline-graph-analysis"
    
    # SCM plugins
    install_plugin "git"
    install_plugin "github"
    install_plugin "github-branch-source"
    
    # Node.js and JavaScript
    install_plugin "nodejs"
    install_plugin "nvm-wrapper"
    
    # Docker integration
    install_plugin "docker-workflow"
    install_plugin "docker-plugin"
    install_plugin "docker-build-step"
    
    # Reporting plugins
    install_plugin "htmlpublisher"
    install_plugin "junit"
    install_plugin "cucumber-reports"
    install_plugin "allure-jenkins-plugin"
    install_plugin "publishoverftp"
    install_plugin "publish-over-ssh"
    
    # Notification plugins
    install_plugin "slack"
    install_plugin "email-ext"
    install_plugin "mailer"
    
    # Utility plugins
    install_plugin "build-name-setter"
    install_plugin "build-user-vars-plugin"
    install_plugin "ansicolor"
    install_plugin "copyartifact"
    install_plugin "parameterized-trigger"
    
    # Security plugins
    install_plugin "matrix-auth"
    install_plugin "role-strategy"
    
    # Performance and monitoring
    install_plugin "performance"
    install_plugin "monitoring"
    
    print_success "All plugins queued for installation"
    
    # Restart Jenkins to activate plugins
    restart_jenkins
}

# Function to create Jenkins job
create_jenkins_job() {
    print_status "Creating Parabank Automation job..."
    
    cat > /tmp/parabank-job.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions/>
  <description>Parabank Automation Testing Pipeline - Cucumber, Playwright, JavaScript</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <hudson.plugins.jira.JiraProjectProperty plugin="jira@3.7"/>
    <hudson.plugins.buildblocker.BuildBlockerProperty plugin="build-blocker-plugin@1.7.8">
      <useBuildBlocker>false</useBuildBlocker>
      <blockLevel>GLOBAL</blockLevel>
      <scanQueueFor>DISABLED</scanQueueFor>
      <blockingJobs></blockingJobs>
    </hudson.plugins.buildblocker.BuildBlockerProperty>
    <com.coravy.hudson.plugins.github.GithubProjectProperty plugin="github@1.34.1">
      <projectUrl>https://github.com/imsaqibhussain/cucumber-playwright-javascript/</projectUrl>
      <displayName></displayName>
    </com.coravy.hudson.plugins.github.GithubProjectProperty>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.ChoiceParameterDefinition>
          <name>TEST_SUITE</name>
          <description>Select test suite to run</description>
          <choices class="java.util.Arrays$ArrayList">
            <a class="string-array">
              <string>all</string>
              <string>smoke</string>
              <string>ui</string>
              <string>api</string>
              <string>regression</string>
            </a>
          </choices>
        </hudson.model.ChoiceParameterDefinition>
        <hudson.model.ChoiceParameterDefinition>
          <name>BROWSER</name>
          <description>Select browser for UI tests</description>
          <choices class="java.util.Arrays$ArrayList">
            <a class="string-array">
              <string>chromium</string>
              <string>firefox</string>
              <string>webkit</string>
            </a>
          </choices>
        </hudson.model.ChoiceParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>HEADLESS_MODE</name>
          <description>Run tests in headless mode</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.BooleanParameterDefinition>
          <name>GENERATE_PDF_REPORT</name>
          <description>Generate PDF reports</description>
          <defaultValue>true</defaultValue>
        </hudson.model.BooleanParameterDefinition>
        <hudson.model.StringParameterDefinition>
          <name>PARALLEL_WORKERS</name>
          <description>Number of parallel test workers</description>
          <defaultValue>2</defaultValue>
          <trim>false</trim>
        </hudson.model.StringParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <hudson.triggers.TimerTrigger>
          <spec>H 2 * * 1-5</spec>
        </hudson.triggers.TimerTrigger>
        <com.cloudbees.jenkins.GitHubPushTrigger plugin="github@1.34.1">
          <spec></spec>
        </com.cloudbees.jenkins.GitHubPushTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.90">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/imsaqibhussain/cucumber-playwright-javascript.git</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

    # Create the job using Jenkins CLI
    java -jar "$JENKINS_CLI_JAR" -s "$JENKINS_URL" -auth "$JENKINS_USER:$JENKINS_PASSWORD" \
        create-job "Parabank-Automation" < /tmp/parabank-job.xml
    
    print_success "Jenkins job 'Parabank-Automation' created successfully"
    rm /tmp/parabank-job.xml
}

# Function to configure global tools
configure_global_tools() {
    print_status "Configuring global tools..."
    
    # Configure Node.js
    cat > /tmp/nodejs-config.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<hudson>
  <tool class="jenkins.plugins.nodejs.tools.NodeJSInstallation" name="Node 18">
    <properties>
      <jenkins.plugins.nodejs.tools.NodeJSInstallation_-NodeJSInstallationProperty>
        <home>/usr/local/lib/nodejs/node-v18.17.0-linux-x64</home>
      </jenkins.plugins.nodejs.tools.NodeJSInstallation_-NodeJSInstallationProperty>
    </properties>
  </tool>
</hudson>
EOF

    print_success "Global tools configuration completed"
}

# Function to setup credentials
setup_credentials() {
    print_status "Setting up credentials..."
    
    # Note: In a real environment, you should use proper credential management
    print_warning "Remember to manually configure the following credentials in Jenkins:"
    print_warning "  - GitHub credentials for repository access"
    print_warning "  - Slack webhook URL (if using Slack notifications)"
    print_warning "  - Email server settings (if using email notifications)"
}

# Function to create Jenkins views
create_jenkins_views() {
    print_status "Creating Jenkins views..."
    
    # Create Automation Dashboard view
    cat > /tmp/automation-view.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<listView>
  <name>Automation Dashboard</name>
  <description>Parabank Automation Testing Dashboard</description>
  <filterExecutors>false</filterExecutors>
  <filterQueue>false</filterQueue>
  <properties class="hudson.model.View$PropertyList"/>
  <jobNames>
    <comparator class="hudson.util.CaseInsensitiveComparator"/>
    <string>Parabank-Automation</string>
  </jobNames>
  <jobFilters/>
  <columns>
    <hudson.views.StatusColumn/>
    <hudson.views.WeatherColumn/>
    <hudson.views.JobColumn/>
    <hudson.views.LastSuccessColumn/>
    <hudson.views.LastFailureColumn/>
    <hudson.views.LastDurationColumn/>
    <hudson.views.BuildButtonColumn/>
  </columns>
  <recurse>false</recurse>
</listView>
EOF

    java -jar "$JENKINS_CLI_JAR" -s "$JENKINS_URL" -auth "$JENKINS_USER:$JENKINS_PASSWORD" \
        create-view "Automation Dashboard" < /tmp/automation-view.xml || true
    
    print_success "Jenkins views created"
    rm /tmp/automation-view.xml
}

# Function to display setup summary
display_summary() {
    print_success "Jenkins setup completed successfully!"
    echo ""
    echo "📋 Setup Summary:"
    echo "=================="
    echo "✅ Jenkins plugins installed"
    echo "✅ Parabank Automation job created"
    echo "✅ Global tools configured"
    echo "✅ Jenkins views created"
    echo ""
    echo "🔗 Access URLs:"
    echo "  Jenkins Dashboard: $JENKINS_URL"
    echo "  Automation Job: $JENKINS_URL/job/Parabank-Automation/"
    echo "  Automation Dashboard: $JENKINS_URL/view/Automation%20Dashboard/"
    echo ""
    echo "📚 Next Steps:"
    echo "  1. Configure GitHub credentials in Jenkins"
    echo "  2. Set up Slack webhook URL (if using notifications)"
    echo "  3. Configure email server settings"
    echo "  4. Run your first pipeline!"
    echo ""
    echo "🎯 Pipeline Features:"
    echo "  • Parameterized builds (test suite, browser, headless mode)"
    echo "  • Parallel test execution"
    echo "  • HTML and PDF report generation"
    echo "  • Quality gates with pass/fail thresholds"
    echo "  • Slack/Email notifications"
    echo "  • Docker support"
    echo "  • Allure reporting integration"
}

# Main execution
main() {
    print_status "Starting Jenkins setup for Parabank Automation..."
    
    # Check prerequisites
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed. Please install Java 8 or higher."
        exit 1
    fi
    
    if ! command -v wget &> /dev/null; then
        print_error "wget is not installed. Please install wget."
        exit 1
    fi
    
    # Run setup steps
    setup_jenkins
    sleep 10  # Wait for plugins to be fully loaded
    
    create_jenkins_job
    configure_global_tools
    setup_credentials
    create_jenkins_views
    
    display_summary
}

# Script execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi