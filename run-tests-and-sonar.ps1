# PowerShell script to run tests and SonarQube analysis
# This script runs all test commands sequentially and waits for each to complete

Write-Host "Starting test execution and SonarQube analysis..." -ForegroundColor Green

# Function to run command and check for errors
function Run-Command {
    param(
        [string]$Command,
        [string]$Description,
        [string]$WorkingDirectory = $null,
        [bool]$ContinueOnError = $false
    )
    
    Write-Host "`n$Description" -ForegroundColor Yellow
    Write-Host "Executing: $Command" -ForegroundColor Cyan
    
    try {
        if ($WorkingDirectory) {
            Push-Location $WorkingDirectory
        }
        
        Invoke-Expression $Command
        $exitCode = $LASTEXITCODE
        
        if ($WorkingDirectory) {
            Pop-Location
        }
        
        if ($exitCode -ne 0) {
            if ($ContinueOnError) {
                Write-Host "Warning: Command failed with exit code $exitCode but continuing..." -ForegroundColor Yellow
            } else {
                Write-Host "Error: Command failed with exit code $exitCode" -ForegroundColor Red
                exit $exitCode
            }
        } else {
            Write-Host "Command completed successfully" -ForegroundColor Green
        }
    }
    catch {
        if ($WorkingDirectory) {
            Pop-Location
        }
        if ($ContinueOnError) {
            Write-Host "Warning: Error executing command: $($_.Exception.Message) but continuing..." -ForegroundColor Yellow
        } else {
            Write-Host "Error executing command: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    }
}

# Change to admin-app directory and run tests
Run-Command "npm test -- --coverage" "Running tests for admin-app with coverage" "admin-app" $true

# Change to home-app directory and run tests
Run-Command "npm test -- --coverage" "Running tests for home-app with coverage" "home-app" $true

# Change to common-app directory and run tests
Run-Command "npm test -- --coverage" "Running tests for common-app with coverage" "common-app" $true

# Change to budgeting-app directory and run tests
Run-Command "npm test -- --coverage" "Running tests for budgeting-app with coverage" "budgeting-app" $true

# Change to dataManagement-app directory and run tests
Run-Command "npm test -- --coverage" "Running tests for dataManagement-app with coverage" "dataManagement-app" $true

# Change to entitySetup-app directory and run tests
Run-Command "npm test -- --coverage" "Running tests for entitySetup-app with coverage" "entitySetup-app" $true

# Change to userManagement-app directory and run tests
Run-Command "npm test -- --coverage" "Running tests for userManagement-app with coverage" "userManagement-app" $true

# Run the fix-lcov-paths.js script (from root directory) - CRITICAL, must succeed
Run-Command "node fix-lcov-paths.js" "Running fix-lcov-paths.js script"

# Run SonarQube scanner (from root directory) - CRITICAL, must succeed
Run-Command "npx sonar-scanner" "Running SonarQube scanner"

Write-Host "`nAll tests and SonarQube analysis completed successfully!" -ForegroundColor Green
