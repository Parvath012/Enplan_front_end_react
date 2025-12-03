# PowerShell Script to Start All Micro Frontends
# Run this script from the root directory: D:\E20\enplan-front-end-react

Write-Host "Starting All Micro Frontends..." -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if we're in the correct directory
$currentDir = Get-Location
$expectedPath = "D:\E20\enplan-front-end-react"
if ($currentDir.Path -ne $expectedPath) {
    Write-Host "Warning: You are not in the expected directory." -ForegroundColor Yellow
    Write-Host "Current: $($currentDir.Path)" -ForegroundColor Yellow
    Write-Host "Expected: $expectedPath" -ForegroundColor Yellow
    Write-Host "Attempting to change to the correct directory..." -ForegroundColor Yellow
    
    if (Test-Path $expectedPath) {
        Set-Location $expectedPath
        Write-Host "Changed to correct directory: $expectedPath" -ForegroundColor Green
    } else {
        Write-Host "Error: Expected directory does not exist: $expectedPath" -ForegroundColor Red
        Write-Host "Please run this script from the correct directory." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Add Node.js to PATH if not already there
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:APPDATA\npm"
)

$nodeFound = $false
foreach ($nodePath in $nodePaths) {
    if (Test-Path $nodePath) {
        if ($env:PATH -notlike "*$nodePath*") {
            $env:PATH += ";$nodePath"
            Write-Host "Added $nodePath to PATH" -ForegroundColor Yellow
        }
        $nodeFound = $true
    }
}

if (-not $nodeFound) {
    Write-Host "Warning: Node.js installation not found in common locations." -ForegroundColor Yellow
    Write-Host "Please ensure Node.js is installed and available in PATH." -ForegroundColor Yellow
}

# Verify Node.js and npm are available
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js or npm not found. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to check if a directory exists and has package.json
function Test-AppDirectory {
    param([string]$Path)
    return (Test-Path $Path) -and (Test-Path (Join-Path $Path "package.json"))
}

# Function to start an app with error handling
function Start-MicroApp {
    param(
        [string]$AppName,
        [string]$AppPath,
        [int]$Port,
        [string]$EnvVars = ""
    )
    
    Write-Host "Starting $AppName on port $Port..." -ForegroundColor Magenta
    
    if (-not (Test-AppDirectory $AppPath)) {
        Write-Host "Error: $AppName directory not found or missing package.json: $AppPath" -ForegroundColor Red
        return $false
    }
    
    $command = "cd '$AppPath'; $EnvVars; npm start"
    
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
        Write-Host "$AppName started successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "Error starting $AppName" -ForegroundColor Red
        return $false
    }
}

Write-Host ""
Write-Host "IMPORTANT: This script will start all apps in separate windows." -ForegroundColor Yellow
Write-Host "Each app will open in its own PowerShell window." -ForegroundColor Yellow
Write-Host "Press Ctrl+C in each window to stop individual apps." -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting applications in 5 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Track successful starts
$startedApps = @()

# Start Common App first (port 3002)
$commonAppPath = "D:\E20\enplan-front-end-react\common-app"
$commonEnvVars = "`$env:REACT_APP_API_BASE_URL='http://localhost:50005'"
if (Start-MicroApp "Common App" $commonAppPath 3002 $commonEnvVars) {
    $startedApps += "Common App"
}
Start-Sleep -Seconds 3

# Start Home App (port 3001)
$homeAppPath = "D:\E20\enplan-front-end-react\home-app"
$homeEnvVars = "`$env:COMMON_APP_URL='http://localhost:3002/remoteEntry.js'"
if (Start-MicroApp "Home App" $homeAppPath 3001 $homeEnvVars) {
    $startedApps += "Home App"
}
Start-Sleep -Seconds 2

# Start Budgeting App (port 3003)
$budgetingAppPath = "D:\E20\enplan-front-end-react\budgeting-app"
$budgetingEnvVars = "`$env:COMMON_APP_URL='http://localhost:3002/remoteEntry.js'"
if (Start-MicroApp "Budgeting App" $budgetingAppPath 3003 $budgetingEnvVars) {
    $startedApps += "Budgeting App"
}
Start-Sleep -Seconds 2

# Start Data Management App (port 3004)
$dataAppPath = "D:\E20\enplan-front-end-react\dataManagement-app"
$dataEnvVars = "`$env:COMMON_APP_URL='http://localhost:3002/remoteEntry.js'"
if (Start-MicroApp "Data Management App" $dataAppPath 3004 $dataEnvVars) {
    $startedApps += "Data Management App"
}
Start-Sleep -Seconds 2

# Start Entity Setup App (port 3005)
$entityAppPath = "D:\E20\enplan-front-end-react\entitySetup-app"
$entityEnvVars = "`$env:REACT_APP_ENTITY_HIERARCHY_API_URL='http://localhost:50005'"
if (Start-MicroApp "Entity Setup App" $entityAppPath 3005 $entityEnvVars) {
    $startedApps += "Entity Setup App"
}
Start-Sleep -Seconds 2

# Start User Management App (port 3006)
$userAppPath = "D:\E20\enplan-front-end-react\userManagement-app"
$userEnvVars = "`$env:REACT_APP_USER_MANAGEMENT_API_URL='http://localhost:8082'"
if (Start-MicroApp "User Management App" $userAppPath 3006 $userEnvVars) {
    $startedApps += "User Management App"
}
Start-Sleep -Seconds 3

# Start Admin App last (port 3000)
$adminAppPath = "D:\E20\enplan-front-end-react\admin-app"
$adminEnvVars = "`$env:REACT_APP_API_BASE_URL='http://localhost:50005'"
if (Start-MicroApp "Admin App" $adminAppPath 3000 $adminEnvVars) {
    $startedApps += "Admin App"
}

Write-Host ""
if ($startedApps.Count -gt 0) {
    Write-Host "Successfully Started Applications:" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    foreach ($app in $startedApps) {
        Write-Host "  * $app" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Waiting 10 seconds for applications to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "Applications should now be starting." -ForegroundColor Green
    Write-Host "Open http://localhost:3000 in your browser!" -ForegroundColor Green
} else {
    Write-Host "No applications were started successfully." -ForegroundColor Red
}

Write-Host ""
Write-Host "Application URLs:" -ForegroundColor White
Write-Host "  Admin App:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Home App:      http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Common App:    http://localhost:3002" -ForegroundColor Cyan
Write-Host "  Budgeting App: http://localhost:3003" -ForegroundColor Cyan
Write-Host "  Data Mgmt App: http://localhost:3004" -ForegroundColor Cyan
Write-Host "  Entity App:    http://localhost:3005" -ForegroundColor Cyan
Write-Host "  User Mgmt App: http://localhost:3006" -ForegroundColor Cyan

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
Read-Host
