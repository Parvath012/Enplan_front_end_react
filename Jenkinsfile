pipeline {
    agent { label 'enplan' }

    parameters {
        choice(name: 'MANUAL_ACTION', choices: ['Deploy', 'Restore'], description: 'Select action to perform')
        choice(name: 'APP_SELECTION', choices: ['all', 'home-app', 'admin-app', 'common-app', 'budgeting-app', 'dataManagement-app', 'entitySetup-app', 'userManagement-app'], description: 'Select app for the chosen action')
        string(name: 'PENDING_DEPLOYMENTS', defaultValue: '', description: 'Do not modify - stores pending deployments from previous runs')
    }

    environment {
        ENPLAN_FRONTEND_REPO = "gitlab.iqgateway.com/enplan/enplan-front-end-react.git"
        ENPLAN_FRONTEND_BRANCH = "develop"
        WINDOWS_SERVER = "172.16.20.116"
        WINDOWS_SHARE_PATH = "//${WINDOWS_SERVER}/enplan-artifacts/frontend/react/deploy"
        BACKUP_DIR = "//${WINDOWS_SERVER}/enplan-artifacts/frontend/react/backup"
        GITLAB_API_URL = 'http://gitlab.iqgateway.com/api/v4'
        GITLAB_PROJECT_ID = "enplan%2Fenplan-front-end-react"
        ARTIFACT_STORAGE_DIR = "/home/enplanrunner/enplan_artifacts/frontend"
        // Add production artifacts storage directory
        PROD_ARTIFACT_STORAGE_DIR = "/home/enplanrunner/enplan_artifacts_for_prod/frontend"
    }

    tools {
        nodejs 'NodeJS22'
    }

    options {
        gitLabConnection('Enplan_Git')
    }

    stages {
        stage('Extract MR Info') {
            steps {
                script {
                    try {
                        // Get MR details from environment variables
                        def mrIid = env.gitlabMergeRequestIid

                        if (!mrIid) {
                            echo "Not triggered by GitLab merge request. Skipping MR analysis."
                            return
                        }

                        echo "Merge Request IID: ${mrIid}"

                        def projectId = env.GITLAB_PROJECT_ID
                        echo "Using project ID: ${projectId}"

                        withCredentials([string(credentialsId: 'Enplan-SecretToken', variable: 'API_TOKEN')]) {
                            def response = sh(
                                script: """
                                    curl --silent --header "PRIVATE-TOKEN: ${API_TOKEN}" \
                                    "${env.GITLAB_API_URL}/projects/${projectId}/merge_requests/${mrIid}/changes"
                                """,
                                returnStdout: true
                            )

                            def json = readJSON text: response

                            if (json.error) {
                                echo "GitLab API Error: ${json.error_description ?: json.error}"
                                return
                            }

                            def changedPaths = json.changes.collect { it.new_path }

                            def appMap = [
                                'common-app': 'common-app',
                                'home-app': 'home-app',
                                'admin-app': 'admin-app',
                                'budgeting-app': 'budgeting-app',
                                'dataManagement-app': 'dataManagement-app',
                                'entitySetup-app': 'entitySetup-app',
                                'userManagement-app': 'userManagement-app'
                            ]

                            def apps = [] as List // Ensure apps is a Groovy list
                            for (path in changedPaths) {
                                for (app in appMap.keySet()) {
                                    if (path.contains("/${app}/") || path.startsWith("${app}/")) {
                                        apps << app
                                        break
                                    }
                                }
                            }

                            apps = apps.unique()

                            if (apps.isEmpty()) {
                                echo "No apps detected in changed files. Will run normal pipeline."
                                return
                            }

                            echo "Apps affected by MR: ${apps}"
                            env.AFFECTED_APPS = apps.join(',')
                        }
                    } catch (Exception e) {
                        echo "Error in MR processing: ${e.message}"
                        echo "Stack trace: ${e.getStackTrace().join('\n')}"
                        env.AFFECTED_APPS = '' // Clear variable on error
                    }
                }
            }
        }

        stage('Prepare Storage') {
            steps {
                script {
                    echo "Build triggered with parameters:"
                    echo "MANUAL_ACTION: ${params.MANUAL_ACTION}"
                    echo "APP_SELECTION: ${params.APP_SELECTION}"
                    echo "PENDING_DEPLOYMENTS: ${params.PENDING_DEPLOYMENTS}"

                    // Ensure storage directory exists with proper permissions
                    sh """
                        mkdir -p ${ARTIFACT_STORAGE_DIR}
                        chmod 777 ${ARTIFACT_STORAGE_DIR}
                        echo "Storage directory: ${ARTIFACT_STORAGE_DIR}"
                        ls -la ${ARTIFACT_STORAGE_DIR}
                    """
                }
            }
        }

        stage('Checkout Code') {
            when {
                expression { params.MANUAL_ACTION == 'Deploy' }
            }
            steps {
                cleanWs()
                script {
                    echo "Cloning frontend repository..."
                    withCredentials([usernamePassword(credentialsId: 'Clone_From_EnPlan_Repository', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh '''
                            git clone --branch ${ENPLAN_FRONTEND_BRANCH} http://${USERNAME}:${PASSWORD}@${ENPLAN_FRONTEND_REPO} ${WORKSPACE}/ENPLAN-Frontend
                            echo "Contents of ENPLAN-Frontend after checkout:"
                            ls -la ${WORKSPACE}/ENPLAN-Frontend
                        '''
                    }
                }
            }
        }

        stage('Build') {
            when {
                expression { params.MANUAL_ACTION == 'Deploy' }
            }
            steps {
                script {
                    def allApps = ['common-app', 'home-app', 'budgeting-app', 'dataManagement-app', 'admin-app', 'entitySetup-app', 'userManagement-app']
                    def currentBuildApps = [] // Track apps built in this run
                    
                    // Always install dependencies for all apps, as they might be interdependent
                    for (app in allApps) {
                        echo "Installing dependencies for ${app}"
                        dir("ENPLAN-Frontend/${app}") {
                            sh """
                                # Install dependencies
                                npm install || {
                                    echo "Dependency installation failed for ${app}";
                                    exit 1;
                                }
                            """
                        }
                    }

                    def appsToBuild = []
                    
                    // Determine which apps to build
                    if (env.AFFECTED_APPS && !env.AFFECTED_APPS.isEmpty()) {
                        // If triggered by MR with detected changes, build those apps
                        appsToBuild = env.AFFECTED_APPS.split(',')
                        echo "Building apps affected by MR: ${appsToBuild}"
                    } else {
                        // Otherwise use the parameter
                        appsToBuild = params.APP_SELECTION == 'all' ? allApps : [params.APP_SELECTION]
                    }
                    
                    // Track which apps are built in this run
                    currentBuildApps = appsToBuild

                    // Ensure both artifact directories exist
                    sh """
                        mkdir -p ${ARTIFACT_STORAGE_DIR}
                        chmod 777 ${ARTIFACT_STORAGE_DIR}
                        mkdir -p ${PROD_ARTIFACT_STORAGE_DIR}
                        chmod 777 ${PROD_ARTIFACT_STORAGE_DIR}
                    """

                    // Build apps for both QA and Production environments
                    for (app in appsToBuild) {
                        echo "Building ${app} for both QA (116) and PROD (118)"
                        dir("ENPLAN-Frontend/${app}") {
                            // Build for QA environment (116) with dev configuration
                            echo "Building ${app} for QA environment (116) with dev profile"
                            sh """
                                NODE_ENV=dev npm run build || {
                                    echo "QA build failed for ${app}";
                                    exit 1;
                                }

                                # Verify build output
                                if [ ! -d dist ]; then
                                    echo "Build output directory 'dist' is missing for ${app}";
                                    exit 1;
                                fi

                                echo "Contents of ${app} after QA build:"
                                ls -la
                            """
                            
                            // Process QA artifact
                            sh """
                                # Create a tarball of the dist directory for QA
                                tar -czf ${ARTIFACT_STORAGE_DIR}/${app}.tar.gz -C dist .
                                echo "Stored QA artifact for ${app} at ${ARTIFACT_STORAGE_DIR}/${app}.tar.gz"
                            """
                            env."${app}_QA_ARTIFACT" = "${ARTIFACT_STORAGE_DIR}/${app}.tar.gz"

                            // Build for PROD environment (118) with production configuration
                            echo "Building ${app} for PROD environment (118) with production profile"
                            sh """
                                NODE_ENV=production npm run build || {
                                    echo "PROD build failed for ${app}";
                                    exit 1;
                                }

                                # Verify build output
                                if [ ! -d dist ]; then
                                    echo "Build output directory 'dist' is missing for ${app}";
                                    exit 1;
                                fi

                                echo "Contents of ${app} after PROD build:"
                                ls -la
                            """
                            
                            // Process PROD artifact with different naming
                            sh """
                                # Create a tarball of the dist directory for PROD
                                tar -czf ${PROD_ARTIFACT_STORAGE_DIR}/${app}.tar.gz -C dist .
                                echo "Stored PROD artifact for ${app} at ${PROD_ARTIFACT_STORAGE_DIR}/${app}.tar.gz"
                            """
                            env."${app}_PROD_ARTIFACT" = "${PROD_ARTIFACT_STORAGE_DIR}/${app}.tar.gz"
                        }
                    }

                    // Display build summary
                    echo "=== BUILD SUMMARY ==="
                    echo "QA Artifacts (for server 116) stored in: ${ARTIFACT_STORAGE_DIR}"
                    echo "PROD Artifacts (for server 118) stored in: ${PROD_ARTIFACT_STORAGE_DIR}"
                    
                    // List artifacts in both directories
                    sh """
                        echo "QA Artifacts:"
                        ls -la ${ARTIFACT_STORAGE_DIR}/*.tar.gz 2>/dev/null || echo "No QA artifacts found"
                        echo "PROD Artifacts:"
                        ls -la ${PROD_ARTIFACT_STORAGE_DIR}/*.tar.gz 2>/dev/null || echo "No PROD artifacts found"
                    """
                    
                    // Store the list of apps built in this run
                    env.CURRENT_BUILD_APPS = currentBuildApps.join(',')
                }
            }
        }

        stage('Unit Tests') {
    when {
        expression { params.MANUAL_ACTION == 'Deploy' }
    }
    steps {
        script {
            def appsToBuild = []
            if (env.AFFECTED_APPS && !env.AFFECTED_APPS.isEmpty()) {
                appsToBuild = env.AFFECTED_APPS.split(',')
            } else {
                def allApps = ['common-app', 'home-app', 'budgeting-app', 'dataManagement-app', 'admin-app', 'entitySetup-app', 'userManagement-app'
                ]
                appsToBuild = params.APP_SELECTION == 'all' ? allApps : [params.APP_SELECTION]
            }

            for (app in appsToBuild) {
                echo "Running unit tests for ${app}"
                dir("ENPLAN-Frontend/${app}") {
                    // Use proper test command that generates coverage reports
                    sh """
                        export JEST_JUNIT_SUITE_NAME_TEMPLATE="{filepath}"
                        npm test -- --coverage --reporters=default --reporters=jest-junit || echo "No tests to run or tests failed for ${app}"
                    """
                }
            }
            
            // Fix lcov paths for SonarQube
            dir('ENPLAN-Frontend') {
                sh """
                    if [ -f fix-lcov-paths.js ]; then
                        node fix-lcov-paths.js
                    fi
                """
            }
            
            // Publish test results if any junit.xml files exist
            sh "find . -name 'junit.xml' | grep -q . && junit '**/junit.xml' || echo 'No JUnit reports found'"
        }
    }
}

        stage('SonarQube Analysis') {
    when {
        expression { params.MANUAL_ACTION == 'Deploy' }
    }
    steps {
        script {
            def appsToBuild = []
            if (env.AFFECTED_APPS && !env.AFFECTED_APPS.isEmpty()) {
                appsToBuild = env.AFFECTED_APPS.split(',')
            } else {
                def allApps = ['common-app', 'home-app', 'budgeting-app', 'dataManagement-app', 'admin-app', 'entitySetup-app', 'userManagement-app']
                appsToBuild = params.APP_SELECTION == 'all' ? allApps : [params.APP_SELECTION]
            }

            // Prepare sources and tests paths for all selected apps to analyze together
            def sourcesPaths = []
            def testsPaths = []
            def coveragePaths = []
            
            for (app in appsToBuild) {
                sourcesPaths.add("ENPLAN-Frontend/${app}/src")
                // Remove wildcards from tests path - just specify the directory
                testsPaths.add("ENPLAN-Frontend/${app}/tests")
                coveragePaths.add("ENPLAN-Frontend/${app}/coverage/lcov.info")
                
                // Debug: Check if coverage file exists
                sh """
                    if [ -f "ENPLAN-Frontend/${app}/coverage/lcov.info" ]; then
                        echo "Coverage file found for ${app}"
                        ls -la ENPLAN-Frontend/${app}/coverage/
                    else
                        echo "Coverage file NOT found for ${app}"
                    fi
                """
            }
            
            def sourcesParam = sourcesPaths.join(',')
            def testsParam = testsPaths.join(',')
            def coverageParam = coveragePaths.join(',')
            
            withSonarQubeEnv('SonarQube') {
                echo "Running SonarQube analysis for EnPlan Frontend with apps: ${appsToBuild}"
                echo "Using coverage paths: ${coverageParam}"
                
                withCredentials([string(credentialsId: 'SonarAdmin', variable: 'SONAR_TOKEN')]) {
                    withEnv(["PATH=/opt/sonar-scanner/bin:$PATH"]) {
                        sh """
                            # Run from workspace root to include all specified apps
                            sonar-scanner \\
                                -Dsonar.projectKey=EnPlan-Frontend-React \\
                                -Dsonar.projectName="EnPlan Frontend React" \\
                                -Dsonar.sources=${sourcesParam} \\
                                -Dsonar.tests=${testsParam} \\
                                -Dsonar.exclusions=**/*.test.tsx,**/*.spec.tsx,**/*.test.ts,**/*.spec.ts,**/node_modules/**,**/dist/**,**/constants/** \\
                                -Dsonar.test.inclusions=**/*.test.tsx,**/*.spec.tsx,**/*.test.ts,**/*.spec.ts \\
                                -Dsonar.javascript.lcov.reportPaths=${coverageParam} \\
                                -Dsonar.host.url=http://172.16.20.73:9000 \\
                                -Dsonar.login=${SONAR_TOKEN} \\
                                -Dsonar.sourceEncoding=UTF-8
                        """
                    }
                }
            }
        }
    }
}

        stage('Quality Gate Check') {
            when { expression { params.MANUAL_ACTION == 'Deploy' } }
            steps {
                sleep(time: 30, unit: 'SECONDS')
                timeout(time: 2, unit: 'MINUTES') {
                    script {
                        def qualityGate = waitForQualityGate()
                        if (qualityGate.status != 'OK') {
                            error "Quality Gate failed. Stopping the pipeline."
                        }
                        echo "Quality Gate passed. Proceeding with deployment."
                    }
                }
            }
        }


        stage('Restore Backup') {
            when { expression { params.MANUAL_ACTION == 'Restore' } }
            steps {
                script {
                    def apps = params.APP_SELECTION == 'all' ? [
                        'home-app', 'admin-app', 'common-app', 'budgeting-app', 'dataManagement-app', 'entitySetup-app', 'userManagement-app'
                    ] : [params.APP_SELECTION]

                    for (app in apps) {
                        def backupPath = "${env.BACKUP_DIR}/${app}"
                        def deployPath = "${env.WINDOWS_SHARE_PATH}/${app}"

                        echo "Restoring backup for ${app} from ${backupPath} to ${deployPath}..."

                        withCredentials([usernamePassword(credentialsId: 'windows-cifs-credentials', usernameVariable: 'WIN_USER', passwordVariable: 'WIN_PASS')]) {
                            sh """
                                set -e
                                sudo mkdir -p /mnt/backup_restore_folder
                                sudo mkdir -p /mnt/frontend_deploy_folder

                                if mountpoint -q /mnt/backup_restore_folder; then
                                    sudo umount /mnt/backup_restore_folder
                                fi

                                if mountpoint -q /mnt/frontend_deploy_folder; then
                                    sudo umount /mnt/frontend_deploy_folder
                                fi

                                # Mount backup and deploy folders
                                sudo mount -t cifs '${backupPath}' /mnt/backup_restore_folder -o username=\$WIN_USER,password=\$WIN_PASS,file_mode=0777,dir_mode=0777
                                sudo mount -t cifs '${deployPath}' /mnt/frontend_deploy_folder -o username=\$WIN_USER,password=\$WIN_PASS,file_mode=0777,dir_mode=0777

                                # Find latest backup folder
                                latest_backup=\$(ls -dt /mnt/backup_restore_folder/backup_* 2>/dev/null | head -n1)

                                if [ -z "\$latest_backup" ]; then
                                    echo "No backup folders found for ${app}"
                                    sudo umount /mnt/backup_restore_folder
                                    sudo umount /mnt/frontend_deploy_folder
                                    exit 1
                                fi

                                echo "Restoring files from: \$latest_backup"
                                sudo cp -r "\$latest_backup"/* /mnt/frontend_deploy_folder/

                                sudo umount /mnt/backup_restore_folder
                                sudo umount /mnt/frontend_deploy_folder
                            """
                        }

                        echo "Backup restored for ${app}."
                    }
                }
            }
        }

        stage('Deploy') {
            when { expression { params.MANUAL_ACTION == 'Deploy' } }
            steps {
                script {
                    def mrAffectedApps = []
                    if (env.AFFECTED_APPS) {
                        mrAffectedApps = env.AFFECTED_APPS.split(',') as List
                    }
                    echo "Apps affected by current MR: ${mrAffectedApps}"
                    
                    // Initialize variables properly
                    def allAppsToDeploy = []
                    def previouslyAbortedApps = []
                    def artifacts = [:]
                    def artifactTimestamps = [:]
                    
                    // Find existing artifacts and get their timestamps - simplified naming approach
                    def artifactsOutput = sh(script: "find ${ARTIFACT_STORAGE_DIR} -name '*.tar.gz' || echo ''", returnStdout: true).trim()
                    
                    if (artifactsOutput) {
                        artifactsOutput.split('\n').each { filePath ->
                            if (filePath) {
                                def fileName = filePath.tokenize('/')[-1]
                                def appName = fileName.replace('.tar.gz', '')  // Extract app name from filename
                                
                                // Get file creation timestamp
                                def timestamp = sh(
                                    script: "stat -c %Y ${filePath}",
                                    returnStdout: true
                                ).trim()
                                
                                artifacts[appName] = filePath
                                artifactTimestamps[appName] = timestamp
                                
                                // If not part of current MR, add to previously aborted list
                                if (!mrAffectedApps.contains(appName)) {
                                    previouslyAbortedApps.add(appName)
                                    echo "Adding previously aborted app ${appName} to deployment list."
                                }
                            }
                        }
                    }
                    
                    // Create the final apps list: previously aborted first, then current MR apps
                    allAppsToDeploy = previouslyAbortedApps + mrAffectedApps
                    
                    if (allAppsToDeploy.size() == 0) {
                        echo "No apps to deploy."
                        return
                    }

                    echo "Apps to deploy (previously aborted + current MR): ${allAppsToDeploy}"
                    def deployList = allAppsToDeploy.join(',')
                    
                    def shouldDeploy = false
                    
                    try {
                        def userInput = input(
                            message: "Do you want to proceed with deployment of ${allAppsToDeploy.size()} app(s): ${deployList}?",
                            ok: "Proceed",
                            parameters: [
                                choice(name: 'DEPLOY_ACTION', choices: ['Yes', 'No'], description: 'Select action')
                            ]
                        )
                        
                        // Safely access the response
                        if (userInput instanceof Map) {
                            shouldDeploy = (userInput.DEPLOY_ACTION == 'Yes')
                        } else {
                            shouldDeploy = (userInput == 'Yes')
                        }
                        
                    } catch (org.jenkinsci.plugins.workflow.steps.FlowInterruptedException e) {
                        echo "Deployment was aborted by user."
                        shouldDeploy = false
                    }
                    
                    if (shouldDeploy) {
                        // Sort only the previously aborted apps by timestamp (oldest first)
                        def abortedAppTimestampPairs = []
                        
                        previouslyAbortedApps.each { app ->
                            def timestamp = artifactTimestamps[app] ?: "999999999999"
                            abortedAppTimestampPairs.add([app, timestamp])
                        }
                        
                        // Sort the previously aborted apps by timestamp
                        abortedAppTimestampPairs.sort { a, b -> 
                            return a[1].compareTo(b[1])
                        }
                        
                        // Extract just the app names in the sorted order
                        def sortedAbortedApps = abortedAppTimestampPairs.collect { it[0] }
                        
                        // Create the final deployment order: sorted aborted apps first, then MR apps
                        def deploymentOrder = sortedAbortedApps + mrAffectedApps
                        
                        echo "Deployment order: Previously aborted apps chronologically, then current MR apps"
                        echo "Final deployment order: ${deploymentOrder}"

                        for (app in deploymentOrder) {
                            def artifactPath = artifacts[app]
                            if (!artifactPath) {
                                echo "No artifact found for app ${app}. Skipping deployment."
                                continue
                            }

                            def appSharePath = "${WINDOWS_SHARE_PATH}/${app}"
                            def appBackupPath = "${BACKUP_DIR}/${app}"

                            // Verify artifact exists before attempting deployment
                            def artifactExists = sh(script: "test -f ${artifactPath} && echo 'true' || echo 'false'", returnStdout: true).trim()
                            if (artifactExists != 'true') {
                                echo "Error: Artifact file not found at ${artifactPath}. Skipping deployment of ${app}."
                                continue
                            }
                            
                            // Show file creation time in human readable format
                            def fileTimestamp = sh(
                                script: "stat -c '%y' ${artifactPath}",
                                returnStdout: true
                            ).trim()
                            
                            def appType = mrAffectedApps.contains(app) ? "Current MR app" : "Previously aborted app"
                            echo "Deploying ${app} (${appType}) to ${appSharePath} (created: ${fileTimestamp}) using artifact: ${artifactPath}"

                            withCredentials([usernamePassword(credentialsId: 'windows-cifs-credentials', usernameVariable: 'WIN_USER', passwordVariable: 'WIN_PASS')]) {
                                sh """
                                    sudo mkdir -p /mnt/frontend_backup_folder /mnt/frontend_deploy_folder

                                    # === Backup Phase ===
                                    if mountpoint -q /mnt/frontend_backup_folder; then
                                        echo "${WIN_PASS}" | sudo -S umount /mnt/frontend_backup_folder || exit 1
                                    fi

                                    echo "${WIN_PASS}" | sudo -S mount -t cifs ${appBackupPath} /mnt/frontend_backup_folder -o username=${WIN_USER},password=${WIN_PASS},file_mode=0777,dir_mode=0777 || exit 1

                                    TIMESTAMP=\$(date +%Y%m%d%H%M%S)
                                    BACKUP_FOLDER="/mnt/frontend_backup_folder/backup_\$TIMESTAMP"
                                    echo "Creating backup at \$BACKUP_FOLDER"
                                    echo "${WIN_PASS}" | sudo -S mkdir -p "\$BACKUP_FOLDER"

                                    # Mount deploy folder to read its contents for backup
                                    if mountpoint -q /mnt/frontend_deploy_folder; then
                                        echo "${WIN_PASS}" | sudo -S umount /mnt/frontend_deploy_folder || exit 1
                                    fi
                                    echo "${WIN_PASS}" | sudo -S mount -t cifs ${appSharePath} /mnt/frontend_deploy_folder -o username=${WIN_USER},password=${WIN_PASS},file_mode=0777,dir_mode=0777 || exit 1

                                    # Backup existing files, but only if the directory isn't empty
                                    if [ "\$(ls -A /mnt/frontend_deploy_folder)" ]; then
                                        echo "${WIN_PASS}" | sudo -S cp -r /mnt/frontend_deploy_folder/* "\$BACKUP_FOLDER/"
                                    else
                                        echo "No files found in /mnt/frontend_deploy_folder to backup."
                                    fi

                                    # Keep only last 5 backups
                                    echo "${WIN_PASS}" | sudo -S ls -dt /mnt/frontend_backup_folder/backup_* | tail -n +6 | xargs -r -I {} sudo rm -rf {}

                                    echo "${WIN_PASS}" | sudo -S umount /mnt/frontend_backup_folder

                                    # === Deploy Phase ===
                                    sudo mkdir -p /mnt/frontend_deploy_folder
                                    if mountpoint -q /mnt/frontend_deploy_folder; then
                                        echo "${WIN_PASS}" | sudo -S umount /mnt/frontend_deploy_folder || exit 1
                                    fi
                                    echo "${WIN_PASS}" | sudo -S mount -t cifs ${appSharePath} /mnt/frontend_deploy_folder -o username=${WIN_USER},password=${WIN_PASS},file_mode=0777,dir_mode=0777 || exit 1

                                    # Create a temp directory for extracting
                                    mkdir -p /tmp/extract_${app}
                                    rm -rf /tmp/extract_${app}/*
                                    tar -xzf ${artifactPath} -C /tmp/extract_${app}

                                    # Remove existing files from deploy directory
                                    echo "${WIN_PASS}" | sudo -S rm -rf /mnt/frontend_deploy_folder/* || {
                                        echo "Failed to clean deploy directory"
                                        sudo umount /mnt/frontend_deploy_folder
                                        exit 1
                                    }

                                    # Copy new files to deploy directory
                                    echo "${WIN_PASS}" | sudo -S cp -r /tmp/extract_${app}/* /mnt/frontend_deploy_folder/ || {
                                        echo "Failed to copy files to deploy directory"
                                        sudo umount /mnt/frontend_deploy_folder
                                        exit 1
                                    }

                                    # Cleanup temp directory
                                    rm -rf /tmp/extract_${app}

                                    echo "${WIN_PASS}" | sudo -S umount /mnt/frontend_deploy_folder
                                """
                            }

                            echo "Deployed ${app} to QA server (116) with backup created."
                            
                            // Delete QA artifact after successful deployment
                            // (Production artifacts are already stored in PROD_ARTIFACT_STORAGE_DIR from Build stage)
                            sh "rm -f ${artifactPath}"
                            echo "Deleted QA artifact from storage: ${artifactPath}"
                        }
                        
                        echo "QA deployment completed successfully."
                        echo "Production artifacts are available in ${PROD_ARTIFACT_STORAGE_DIR} for separate production deployment."
                        
                        // List saved production artifacts
                        sh """
                            echo "Artifacts available for production deployment:"
                            find ${PROD_ARTIFACT_STORAGE_DIR} -name '*.tar.gz' -exec ls -la {} \\; || echo "No production artifacts found"
                        """
                    } else {
                        // User chose not to deploy
                        echo "Deployment skipped by user"
                        
                        // Default to preserving artifacts
                        def shouldStoreArtifacts = true
                        
                        try {
                            // Use a simple boolean parameter
                            def response = input(
                                id: 'artifactStoragePrompt',
                                message: "Do you want to store the artifacts for future deployment?",
                                ok: "Submit",
                                parameters: [
                                    booleanParam(name: 'STORE', defaultValue: true, description: 'Check to store artifacts, uncheck to delete them')
                                ]
                            )
                            
                            // Safely access the response
                            if (response instanceof Map) {
                                shouldStoreArtifacts = response.STORE
                                echo "User selected to ${shouldStoreArtifacts ? 'store' : 'delete'} artifacts (Map response)"
                            } else {
                                shouldStoreArtifacts = response
                                echo "User selected to ${shouldStoreArtifacts ? 'store' : 'delete'} artifacts (Direct response)"
                            }
                            
                        } catch (Exception ex) {
                            echo "Exception during artifact storage prompt: ${ex.toString()}"
                            echo "Using default: Store artifacts."
                        }
                        
                        if (shouldStoreArtifacts) {
                            echo "QA artifacts will be preserved for future deployment."
                            echo "Production artifacts remain available in ${PROD_ARTIFACT_STORAGE_DIR} for production deployment."
                            
                            // List both artifact directories
                            sh """
                                echo "QA Artifacts preserved:"
                                find ${ARTIFACT_STORAGE_DIR} -name '*.tar.gz' -exec ls -la {} \\; || echo "No QA artifacts found"
                                echo "Production Artifacts available:"
                                find ${PROD_ARTIFACT_STORAGE_DIR} -name '*.tar.gz' -exec ls -la {} \\; || echo "No production artifacts found"
                            """
                        } else {
                            echo "User chose not to store artifacts. Deleting QA artifacts from current build only."
                            echo "Production artifacts will be preserved for production deployment."
                            
                            // Create a list of apps to delete QA artifacts for
                            def appsToDelete = []
                            
                            // Include apps from merge request if there are any
                            if (mrAffectedApps && mrAffectedApps.size() > 0) {
                                appsToDelete.addAll(mrAffectedApps)
                            } 
                            // For manually selected builds, include the selected app
                            else if (params.APP_SELECTION != 'all') {
                                appsToDelete.add(params.APP_SELECTION)
                            }
                            
                            echo "Will delete QA artifacts for apps: ${appsToDelete}"
                            
                            // Delete QA artifacts for identified apps only
                            appsToDelete.each { app ->
                                def artifactPath = artifacts[app]
                                if (artifactPath) {
                                    // Execute the deletion command and verify it worked
                                    def deleteResult = sh(script: "rm -f ${artifactPath} && echo 'true' || echo 'false'", returnStdout: true).trim()
                                    if (deleteResult == 'true') {
                                        echo "Successfully deleted QA artifact for app: ${app} at ${artifactPath}"
                                    } else {
                                        echo "WARNING: Failed to delete QA artifact for app: ${app} at ${artifactPath}"
                                    }
                                } else {
                                    echo "No QA artifact found for app: ${app}"
                                }
                            }
                            
                            // Verify deletions and show remaining artifacts
                            sh """
                                echo "Remaining QA artifacts in storage directory:"
                                find ${ARTIFACT_STORAGE_DIR} -name '*.tar.gz' -ls || echo "No QA artifacts remain"
                                echo "Production artifacts preserved:"
                                find ${PROD_ARTIFACT_STORAGE_DIR} -name '*.tar.gz' -ls || echo "No production artifacts found"
                            """
                            
                            echo "Current build QA artifacts have been deleted. Production artifacts preserved for production deployment."
                        }
                    }
                }
            }
        }
    }
}