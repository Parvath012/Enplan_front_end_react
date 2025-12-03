# SonarQube Setup Guide

This guide explains how to set up and use SonarQube for code quality analysis in the ENPLAN frontend React project. It covers installing prerequisites, running SonarQube locally, executing tests with coverage, analyzing your code, and integrating SonarLint with Visual Studio Code for real-time feedback.

## Table of Contents

- [Prerequisites](#-prerequisites)
- [How to Download and Set Up SonarScanner (Windows)](#-how-to-download-and-set-up-sonarscanner-windows)
  - [1. Download SonarScanner](#-1-download-sonarscanner)
  - [2. Set Environment Variables](#-2-set-environment-variables)
  - [3. Verify the Setup](#-3-verify-the-setup)
- [Running SonarQube Locally](#-running-sonarqube-locally)
  - [1. Download SonarQube](#1-download-sonarqube)
  - [2. Start SonarQube Server](#2-start-sonarqube-server)
  - [3. Create a Project in SonarQube](#3-create-a-project-in-sonarqube)
- [Running Tests and Analysis](#-running-tests-and-analysis)
  - [4. Run Jest Tests with Coverage for Each App](#4-run-jest-tests-with-coverage-for-each-app)
  - [5. Run SonarScanner](#5-run-sonarscanner)
  - [6. View Results in SonarQube](#6-view-results-in-sonarqube)
- [SonarLint Integration with VS Code](#-step-1-install-sonarlint-extension-in-vs-code)
  - [Step 1: Install SonarLint Extension in VS Code](#-step-1-install-sonarlint-extension-in-vs-code)
  - [Step 2: Set Up SonarQube Connection](#-step-2-set-up-sonarqube-connection)
  - [Step 3: Bind Your Project to SonarQube](#-step-3-bind-your-project-to-sonarqube)
  - [Step 4: View Issues in VS Code](#-step-4-view-issues-in-vs-code)
- [Adding a New Micro Frontend App to SonarQube](#-adding-a-new-micro-frontend-app-to-sonarqube)

---

## 📦 Prerequisites

Ensure that the following tools are installed:

- **Java (11 or later)**
- **SonarScanner**  
  👉 [Install SonarScanner](https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/)

---

## 🛠️ How to Download and Set Up SonarScanner (Windows)

### 🔽 1. Download SonarScanner

Go to the official download page:  
🔗 [https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/](https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/)

Download the latest version (e.g.):  
👉 `sonar-scanner-cli-7.1.0.4889-windows-x64.zip`

Extract the ZIP to a permanent location, e.g.:

```
C:\Tools\sonar-scanner
```

After extraction, your folder structure should look like:

```
C:\Tools\sonar-scanner\
    ├── bin\
    ├── conf\
    └── ...
```

---

### ⚙️ 2. Set Environment Variables

1. Press `Win + S` → Search for **“Environment Variables”**
2. Click **“Edit the system environment variables”**
3. In the **System Properties** window, click **Environment Variables**
4. Under **System variables**, select `Path` → Click **Edit**
5. Click **New**, and add:

```
C:\Tools\sonar-scanner\bin
```

6. Click **OK** → **OK** → **OK** to save and exit

---

### 🧪 3. Verify the Setup

Open a new terminal (VS Code or Command Prompt) and run:

```bash
sonar-scanner -v
```

You should see version details confirming that SonarScanner is installed and detects Java.

---

## 🚀 Running SonarQube Locally

### 1. Download SonarQube

Download the **Community Edition** from:  
🔗 [https://www.sonarsource.com/products/sonarqube/downloads/](https://www.sonarsource.com/products/sonarqube/downloads/)

> ⚠️ Ensure your Java version is compatible (Java 11+ is recommended).

---

### 2. Start SonarQube Server

After extracting the ZIP:

```bash
# Navigate to the correct folder for your OS
cd sonarqube-<version>/bin/<your-os-folder>

# Start the SonarQube server
StartSonar.bat      # For Windows
./sonar.sh start    # For macOS/Linux
```

Open SonarQube in your browser:  
🔗 [http://localhost:9000](http://localhost:9000)

**Default credentials:**

```
Username: admin
Password: admin
```

---

### 3. Create a Project in SonarQube

1. Go to [http://localhost:9000](http://localhost:9000)
2. Click **"Create Project"**
3. Choose **"Manually"**
4. Fill in:
   - **Project Key:** must match `sonar.projectKey` in `sonar-project.properties`
   - **Project Name:** e.g., `ENPLAN Frontend`
5. Click **"Set Up"**
6. Choose **"Locally"** as the analysis method
7. Generate a **token** and copy it
8. Create or update `sonar-project.properties` with:

```properties
sonar.login=<your-generated-token>
```

---

## 🧪 Running Tests and Analysis

### 4. Run Jest Tests with Coverage for Each App

Navigate to each app directory and run tests with coverage:

```bash
# For admin-app
cd admin-app
npm test -- --coverage

# For home-app
cd ../home-app
npm test -- --coverage

# For common-app
cd ../common-app
npm test -- --coverage

# For budgeting-app
cd ../budgeting-app
npm test -- --coverage

# For dataManagement-app
cd ../dataManagement-app
npm test -- --coverage

# For entitySetup-app
cd ../entitySetup-app
npm test -- --coverage

# For userManagement-app
cd ../userManagement-app
npm test -- --coverage
```




**After running coverage for all apps, run the following command from the root folder to fix coverage paths for SonarQube:**

```bash
node fix-lcov-paths.js
```

---

### 5. Run SonarScanner

From the root directory of the project:

```bash
sonar-scanner
```

---

### 6. View Results in SonarQube

Go to the SonarQube dashboard:

🔗 [http://localhost:9000](http://localhost:9000)

You’ll be able to see code quality metrics, coverage, code smells, and more!

---

## ✅ Step 1: Install SonarLint Extension in VS Code

1. Open Visual Studio Code.
2. Go to the Extensions panel (left sidebar or `Ctrl + Shift + X`).
3. In the search bar, type: **SonarLint**.
4. Click **Install** on **SonarLint** by SonarSource.

---

## ✅ Step 2: Set Up SonarQube Connection

Before this step, make sure your SonarQube server is running (e.g., `http://localhost:9000`)

### Add the Connection in VS Code:

1. Press `Ctrl + Shift + P` to open the Command Palette.
2. Search and select: **SonarLint: Connect to SonarQube or SonarCloud**.
3. Click **Add new connection**.
4. Fill in the details:
   - **Server URL:** `http://localhost:9000`
   - **User Token:** Find token from sonar-project.properties file and Paste that token.
   - **Connection Name:** (e.g., Local SonarQube)
5. Click **Save Connection** and **Bind Project**.
6. Select your SonarQube project (e.g., `ENPLAN Front-end-REACT`).

---

## ✅ Step 3: Bind Your Project to SonarQube

1. Again press `Ctrl + Shift + P`.
2. Search and select: **SonarLint: Bind Project to SonarQube Project**.
3. Select your connection.
4. Choose the corresponding project on SonarQube (`ENPLAN Front-end-REACT`).
5. Now your local VS Code project is linked with SonarQube.

---

## ✅ Step 4: View Issues in VS Code

1. Open any file in your project.
2. SonarLint will automatically analyze it.
3. You’ll see issues:
   - As underlines in your code.
   - In the **Problems** tab (`Ctrl + Shift + M` or click on the exclamation icon in the sidebar).
4. Hover over any issue to see the rule ID, description, and severity.

---

## ➕ Adding a New Micro Frontend App to SonarQube

If you add a new app (e.g., `new-app`), follow these steps to include it in SonarQube analysis:

1. **Update `sonar-project.properties`:**
   - Add the new app’s source folder to `sonar.sources`:
     ```
     sonar.sources=admin-app/src,home-app/src,common-app/src,budgeting-app/src,dataManagement-app/src,new-app/src
     ```
   - Add the new app’s coverage report to `sonar.javascript.lcov.reportPaths`:
     ```
     sonar.javascript.lcov.reportPaths=admin-app/coverage/lcov.info,home-app/coverage/lcov.info,common-app/coverage/lcov.info,budgeting-app/coverage/lcov.info,dataManagement-app/coverage/lcov.info,new-app/coverage/lcov.info
     ```
   - Add the new app’s `tsconfig.json` to `sonar.javascript.tsconfigPath`:
     ```
     sonar.javascript.tsconfigPath=admin-app/tsconfig.json,home-app/tsconfig.json,common-app/tsconfig.json,budgeting-app/tsconfig.json,dataManagement-app/tsconfig.json,new-app/tsconfig.json
     ```

2. **Run tests with coverage in the new app:**
   ```sh
   cd new-app
   npm test -- --coverage
   ```

3. **(Optional) Update exclusions**  
   If your new app has unique test/exclude patterns, update `sonar.exclusions` as needed.

4. **(Optional) Update documentation**  
   Add the new app to relevant sections in this guide and the main README.

5. **Re-run SonarScanner:**  
   From the root directory:
   ```sh
   sonar-scanner
   ```

6. **Check SonarQube dashboard**  
   Confirm the new app’s code and coverage are included in the analysis.

---