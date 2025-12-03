# ENPLAN Frontend - React

This repository contains the micro frontend-based React application for the ENPLAN project. It follows a **micro frontend architecture** using **Webpack Module Federation** and includes the following applications:

- **admin-app (Host):** The main module that integrates other micro frontends. Runs on port `3000`.
- **home-app (Remote 1):** A separate micro frontend module. Runs on port `3001`.
- **common-app (Remote 2):** Contains reusable components shared between other apps. Runs on port `3002`.
- **budgeting-app (Remote 3):** A separate micro frontend module. Runs on port `3003`.
- **dataManagement-app (Remote 4):** A separate micro frontend module. Runs on port `3004`.
- **entitySetup-app (Remote 5):** A separate micro frontend module. Runs on port `3005`.
- **userManagement-app (Remote 6):** A separate micro frontend module. Runs on port `3006`.

## Table of Contents
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running an Application](#running-an-application)
- [Micro Frontend Applications](#micro-frontend-applications)
- [Creating a New Micro Frontend Application](#creating-a-new-micro-frontend-application)
- [CI/CD Pipeline with Jenkins](#cicd-pipeline-with-jenkins)
- [Adding a New Micro Frontend Application: Jenkins Pipeline Changes](#adding-a-new-micro-frontend-application-jenkins-pipeline-changes)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [SonarQube Setup](#sonarqube-setup)

## Getting Started

### Prerequisites
Before setting up the project, make sure you have the following installed:
- **Node.js** (v22.14.0 version) - [Download here](https://nodejs.org/)

### Clone the Repository
To get started, clone the repository using SSH or HTTP:

#### Using SSH:
```sh
git clone git@gitlab.iqgateway.com:enplan/enplan-front-end-react.git
```

#### Using HTTP:
```sh
git clone http://gitlab.iqgateway.com/enplan/enplan-front-end-react.git
```

### Navigate to the Project Directory:
```sh
cd enplan-front-end-react/
```

### Checkout to the develop Branch:
```sh
git checkout develop
```

### Pull the Latest Code:
```sh
git pull
```

### Environment Configuration
Currently, only the `admin-app` uses a `.env` file for sensitive or default environment variables (such as credentials and API URLs). All applications use `.env.development` and `.env.production` files to manage environment-specific configurations, such as remote module URLs.

#### Example `admin-app/.env`:
```plaintext
REACT_APP_ADMIN_LOGIN_ID=admin
REACT_APP_ADMIN_PASSWORD=admin
REACT_APP_API_BASE_URL=http://172.16.20.116:50001
REACT_APP_USERS_API_URL=http://172.16.20.116:8081
REACT_APP_ADMIN_API_URL=http://172.16.20.116:50003
```

> **Guideline:**  
> If you need to add sensitive or default environment variables to other apps, you can create a `.env` file in that app’s root directory using the same format as above.

#### Example `.env.development`:
```plaintext
COMMON_APP_URL=http://localhost:3002/remoteEntry.js
HOME_APP_URL=http://localhost:3001/remoteEntry.js
BUDGETING_APP_URL=http://localhost:3003/remoteEntry.js
DATA_MGMT_APP_URL=http://localhost:3004/remoteEntry.js
ENTITY_SETUP_APP_URL=http://localhost:3005/remoteEntry.js
USER_MANAGEMENT_APP_URL=http://localhost:3006/remoteEntry.js
```

#### Example `.env.production`:
```plaintext
COMMON_APP_URL=http://172.16.20.116:3002/remoteEntry.js
HOME_APP_URL=http://172.16.20.116:3001/remoteEntry.js
BUDGETING_APP_URL=http://172.16.20.116:3003/remoteEntry.js
DATA_MGMT_APP_URL=http://172.16.20.116:3004/remoteEntry.js
ENTITY_SETUP_APP_URL=http://172.16.20.116:3005/remoteEntry.js
USER_MANAGEMENT_APP_URL=http://172.16.20.116:3006/remoteEntry.js
```

### Webpack Configuration
The `webpack.config.js` files in each application have been updated to load environment variables from the `.env` files. This ensures that the correct URLs and configurations are used based on the environment.

#### Key Changes in `webpack.config.js`:
1. Added `dotenv` to load environment variables:
   ```js
   const dotenv = require("dotenv");
   dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
   ```

2. Updated `ModuleFederationPlugin` to use environment variables:
   ```js
   remotes: {
       commonApp: `commonApp@${process.env.COMMON_APP_URL}`,
       homeApp: `homeApp@${process.env.HOME_APP_URL}`,
       budgetingApp: `budgetingApp@${process.env.BUDGETING_APP_URL}`,
       dataManagementApp: `dataManagementApp@${process.env.DATA_MGMT_APP_URL}`,
       entitySetupApp: `entitySetupApp@${process.env.ENTITY_SETUP_APP_URL}`,
       userManagementApp: `userManagementApp@${process.env.USER_MANAGEMENT_APP_URL}`,
   },
   ```

## Running an Application

Navigate to the application directory:
```sh
cd <app-name>  # Example: cd admin-app/
```

Install dependencies and start the application:

#### Using Yarn:
```sh
yarn install
yarn start
```
Or simply:
```sh
yarn && yarn start
```

#### Using NPM:
```sh
npm install
npm start
```
Or simply:
```sh
npm install && npm start
```

## Micro Frontend Applications

### admin-app (Host)
This is the main module of the micro frontend architecture. It serves as the host application and integrates remote modules.

#### Running the Application:
```sh
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Micro Frontend Integration:
- Acts as the host and consumes **home-app**, **common-app** and **budgeting-app** using Webpack Module Federation.

### home-app (Remote 1)
This is a separate micro frontend module that integrates with the **admin-app** via Module Federation.

#### Running the Application:
```sh
npm start
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

#### Micro Frontend Integration:
- Exposes its components to **admin-app** using Webpack Module Federation.

### common-app (Remote 2)
This micro frontend module contains reusable components that are shared across **admin-app**, **home-app** and **budgeting-app**.

#### Running the Application:
```sh
npm start
```
Open [http://localhost:3002](http://localhost:3002) in your browser.

#### Micro Frontend Integration:
- Exposes shared components to **admin-app**, **home-app** and **budgeting-app** using Webpack Module Federation.

### budgeting-app (Remote 3)
This is a separate micro frontend module that integrates with the **admin-app** via Module Federation.

#### Running the Application:
```sh
npm start
```
Open [http://localhost:3003](http://localhost:3003) in your browser.

#### Micro Frontend Integration:
- Exposes its components to **admin-app** using Webpack Module Federation.

### dataManagement-app (Remote 4)
This is a separate micro frontend module that integrates with the **admin-app** via Module Federation.

#### Running the Application:
```sh
npm start
```
Open [http://localhost:3004](http://localhost:3004) in your browser.

#### Micro Frontend Integration:
- Exposes its components to **admin-app** using Webpack Module Federation.

### entitySetup-app (Remote 5)
This is a separate micro frontend module that integrates with the **admin-app** via Module Federation.

#### Running the Application:
```sh
npm start
```
Open [http://localhost:3005](http://localhost:3005) in your browser.

#### Micro Frontend Integration:
- Exposes its components to **admin-app** using Webpack Module Federation.

### userManagement-app (Remote 6)
This is a separate micro frontend module that integrates with the **admin-app** via Module Federation.

#### Running the Application:
```sh
npm start
```
Open [http://localhost:3006](http://localhost:3006) in your browser.

#### Micro Frontend Integration:
- Exposes its components to **admin-app** using Webpack Module Federation.

## Creating a New Micro Frontend Application

Follow these steps to create a new micro frontend application by copying an existing one:

1. **Copy the Existing Application**
   - Choose an existing application (e.g., `home-app`) as the base.
   - Copy the entire directory to a new folder with the desired app name (e.g., `new-app`):
     ```sh
     cp -r home-app new-app
     ```

2. **Update `package.json`**
   - Open the `package.json` file in the new app directory.
   - Update the `name` field to the new app name (e.g., `"new-app"`).
   - Update the `version` if necessary.

3. **Update Ports**
   - Open the `webpack.config.js` file in the new app directory.
   - Update the `devServer.port` to a unique port (e.g., `3005`):
     ```js
     devServer: {
       port: 3005,
       ...
     },
     ```

4. **Update Module Federation Configuration**
   - In `webpack.config.js`, update the `name` and `filename` fields in the `ModuleFederationPlugin`:
     ```js
     new ModuleFederationPlugin({
       name: "newApp",
       filename: "remoteEntry.js",
       ...
     }),
     ```
   - Update the `remotes` and `exposes` fields if needed.

5. **Update Environment Variables**
   - Update the `.env.development` and `.env.production` files with the new app's URL:
     ```plaintext
     NEW_APP_URL=http://localhost:3005/remoteEntry.js
     ```

6. **Install Dependencies**
   - Navigate to the new app directory and install dependencies:
     ```sh
     cd new-app
     npm install
     ```

7. **Test the New Application**
   - Start the app to ensure it runs correctly:
     ```sh
     npm start
     ```
   - Open the app in the browser using the updated port (e.g., `http://localhost:3005`).

8. **Integrate with Host Application**
   - Update the `remotes` section in the `webpack.config.js` file of the host application (e.g., `admin-app`) to include the new app:
     ```js
     newApp: `newApp@${process.env.NEW_APP_URL}`,
     ```

9. **Commit and Push Changes**
   - Commit the changes to version control:
     ```sh
     git add .
     git commit -m "Add new-app"
     git push
     ```

10. **Update Documentation**
    - Add the new app details to the `README.md` file under the **Micro Frontend Applications** section.

By following these steps, you can create and integrate a new micro frontend application into the ENPLAN ecosystem.

## CI/CD Pipeline with Jenkins

This project uses a Jenkins pipeline (see [Jenkinsfile](./Jenkinsfile)) to automate build, test, analysis, backup/restore, and deployment for all micro frontend applications.

### Pipeline Parameters

- **MANUAL_ACTION**: Choose between `Deploy` (build, test, analyze, and deploy) or `Restore` (restore from backup).
- **APP_SELECTION**: Select which app(s) to deploy or restore (`all`, `home-app`, `admin-app`, `common-app`, `budgeting-app`, `dataManagement-app`, `entitySetup-app`, `userManagement-app`).

### Pipeline Stages

1. **Build**  
   - Checks out the `develop` branch.
   - Installs dependencies for all apps.
   - Builds only the selected app(s) (or all if `all` is chosen).
2. **Unit Test**  
   - Runs unit tests with coverage for all apps.
   - Publishes JUnit test results for trend graphs.
3. **SonarQube Analysis**  
   - Runs static code analysis and uploads coverage for all apps.
   - Pipeline stops if the SonarQube Quality Gate fails.
4. **Restore Backup**  
   - If `MANUAL_ACTION` is `Restore`, restores the latest backup for the selected app(s) from the backup share to the deployment share.
   - Handles Windows share mounting/unmounting and removes `desktop.ini` if present.
5. **Deploy**  
   - If `MANUAL_ACTION` is `Deploy`, prompts for confirmation before deploying.
   - Backs up the current deployment (keeps only the latest 5 backups).
   - Deploys the new build output to the Windows share for the selected app(s).

### Key Jenkins Pipeline Updates

- **All app lists** in the pipeline are now: `['common-app', 'home-app', 'budgeting-app', 'dataManagement-app', 'admin-app', 'entitySetup-app', 'userManagement-app']`.
- **APP_SELECTION** parameter choices are: `all`, `home-app`, `admin-app`, `common-app`, `budgeting-app`, `dataManagement-app`, `entitySetup-app`, `userManagement-app`.
- **SonarQube analysis** covers all seven apps, with sources and coverage paths updated accordingly.
- **Backup and deployment** logic uses the same app list and parameter, so new apps must be added to both for full integration.
- **Manual confirmation** is required before deployment proceeds.
- **Node.js 22** is used for all build and test steps.

### Triggering the Pipeline

1. Open Jenkins and select the pipeline for this project.
2. Set the parameters:
   - **MANUAL_ACTION**: `Deploy` or `Restore`
   - **APP_SELECTION**: Choose the app(s) to act on
3. Start the pipeline and follow prompts (for deployment confirmation).

### Notes

- **SonarQube Integration**: Requires `SonarAdmin` credentials and SonarQube server access.
- **Backup Management**: Keeps only the latest 5 backups per app.
- **Windows Share Access**: Uses `windows-cifs-credentials` for mounting/unmounting shares.
- **Node.js Version**: Uses Node.js 22 as configured in Jenkins.
- **Manual Confirmation**: Deployment requires user confirmation in Jenkins.

## Adding a New Micro Frontend Application: Jenkins Pipeline Changes

When you create a new micro frontend application (e.g., `new-app`), you must update the Jenkins pipeline to ensure it is included in all relevant CI/CD stages.

### Steps to Update Jenkins for a New App

1. **Update Jenkinsfile App Lists**  
   In the `Jenkinsfile`, locate all arrays or lists that reference the app names.  
   For example, update the following arrays to include your new app (`new-app`):

   ```groovy
   def allApps = ['common-app', 'home-app', 'budgeting-app', 'dataManagement-app', 'admin-app', 'new-app']
   ```

   Update this in every stage where `allApps` is used (Build, Unit Test, etc.).

2. **Update Pipeline Parameters**  
   Add your new app to the `APP_SELECTION` parameter choices:

   ```groovy
   parameters {
       choice(name: 'APP_SELECTION', choices: ['all', 'home-app', 'admin-app', 'common-app', 'budgeting-app', 'dataManagement-app', 'new-app'], description: 'Select app for the chosen action')
   }
   ```

3. **Update SonarQube Analysis**  
   Add the new app’s `src` and `coverage/lcov.info` paths to the SonarQube scanner command:

   ```groovy
   -Dsonar.sources=ENPLAN-Frontend/admin-app/src,ENPLAN-Frontend/home-app/src,ENPLAN-Frontend/common-app/src,ENPLAN-Frontend/budgeting-app/src,ENPLAN-Frontend/dataManagement-app/src,ENPLAN-Frontend/new-app/src \
   -Dsonar.javascript.lcov.reportPaths=ENPLAN-Frontend/admin-app/coverage/lcov.info,ENPLAN-Frontend/home-app/coverage/lcov.info,ENPLAN-Frontend/common-app/coverage/lcov.info,ENPLAN-Frontend/budgeting-app/coverage/lcov.info,ENPLAN-Frontend/dataManagement-app/coverage/lcov.info,ENPLAN-Frontend/new-app/coverage/lcov.info \
   ```

4. **Update Backup and Deploy Logic**  
   The backup and deployment stages use the `allApps` list and the `APP_SELECTION` parameter.  
   By updating these as above, your new app will be included automatically in backup and deployment operations.

5. **Commit and Push Jenkinsfile Changes**  
   After making these changes, commit and push the updated `Jenkinsfile` to your repository.

   ```sh
   git add Jenkinsfile
   git commit -m "Add new-app to Jenkins pipeline"
   git push
   ```

### Summary

Whenever you add a new micro frontend app:
- Add it to all app lists in the `Jenkinsfile`
- Add it to the `APP_SELECTION` parameter choices
- Update SonarQube analysis paths
- Commit and push the changes

This ensures your new app is fully integrated into the CI/CD pipeline.

## Project Scripts

### fix-lcov-paths.js
This script is used to fix the paths in LCOV coverage reports before SonarQube analysis.  
**Usage:**
```sh
node scripts/fix-lcov-paths.js
```
Run this script after running your tests and generating coverage reports, but before triggering SonarQube analysis. This ensures that the coverage paths are correct for SonarQube to process.

## Troubleshooting
If you encounter issues while running the applications, try the following:

- **Clear Cache & Reinstall Dependencies:**
  ```sh
  rm -rf node_modules && yarn install  # For Yarn
  rm -rf node_modules && npm install  # For NPM
  ```
- **Check for Port Conflicts:** Ensure no other processes are using ports `3000`, `3001`, `3002` or `3003`, `3004`.
- **Verify Webpack Configuration:** Double-check `moduleFederationPlugin` settings in each `webpack.config.js` file.

## License
This project is proprietary and intended for use within the ENPLAN ecosystem.

## SonarQube Setup
For detailed steps on setting up and using SonarQube locally in this project, please refer to the [SONARQUBE.md](./SONARQUBE.md) file.
