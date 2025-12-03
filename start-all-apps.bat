@echo off
REM Batch Script to Start All Micro Frontends
REM Run this script from the root directory: D:\E20\enplan-front-end-react

echo Starting All Micro Frontends...
echo =================================

REM Add Node.js to PATH if not already there
set PATH=%PATH%;C:\Program Files\nodejs

echo.
echo IMPORTANT: This script will start all apps in separate windows.
echo Each app will open in its own command window.
echo Press Ctrl+C in each window to stop individual apps.
echo.
echo Starting applications in 5 seconds...
timeout /t 5 /nobreak > nul

REM Start Common App first (port 3002)
echo Starting Common App (Shared Components) on port 3002...
start "Common App" cmd /k "cd /d D:\E20\enplan-front-end-react\common-app && set REACT_APP_API_BASE_URL=http://localhost:50005 && set REACT_APP_API_ENDPOINT=/api/v1/data/Data/ExecuteSqlQueries && set REACT_APP_HEALTH_ENDPOINT=/api/v1/health && npm start"
timeout /t 3 /nobreak > nul

REM Start Home App (port 3001)
echo Starting Home App on port 3001...
start "Home App" cmd /k "cd /d D:\E20\enplan-front-end-react\home-app && set COMMON_APP_URL=http://localhost:3002/remoteEntry.js && npm start"
timeout /t 2 /nobreak > nul

REM Start Budgeting App (port 3003)
echo Starting Budgeting App on port 3003...
start "Budgeting App" cmd /k "cd /d D:\E20\enplan-front-end-react\budgeting-app && set COMMON_APP_URL=http://localhost:3002/remoteEntry.js && npm start"
timeout /t 2 /nobreak > nul

REM Start Data Management App (port 3004)
echo Starting Data Management App on port 3004...
start "Data Management App" cmd /k "cd /d D:\E20\enplan-front-end-react\dataManagement-app && set COMMON_APP_URL=http://localhost:3002/remoteEntry.js && npm start"
timeout /t 2 /nobreak > nul

REM Start Entity Setup App (port 3005)
echo Starting Entity Setup App on port 3005...
start "Entity Setup App" cmd /k "cd /d D:\E20\enplan-front-end-react\entitySetup-app && set REACT_APP_ENTITY_HIERARCHY_API_URL=http://localhost:50005 && set REACT_APP_DATA_API_URL=http://localhost:8082 && npm start"
timeout /t 5 /nobreak > nul

REM Start Admin App last (port 3000) - Host application
echo Starting Admin App (Host Application) on port 3000...
start "Admin App" cmd /k "cd /d D:\E20\enplan-front-end-react\admin-app && set REACT_APP_API_BASE_URL=http://localhost:50005 && set REACT_APP_USERS_API_URL=http://localhost:8082 && set REACT_APP_ADMIN_API_URL=http://localhost:8888 && set COMMON_APP_URL=http://localhost:3002/remoteEntry.js && set HOME_APP_URL=http://localhost:3001/remoteEntry.js && set BUDGETING_APP_URL=http://localhost:3003/remoteEntry.js && set DATA_MGMT_APP_URL=http://localhost:3004/remoteEntry.js && set ENTITY_SETUP_APP_URL=http://localhost:3005/remoteEntry.js && npm start"

echo.
echo All Micro Frontends Started Successfully!
echo =============================================
echo.
echo Application URLs:
echo   Admin App (Host):     http://localhost:3000
echo   Home App:             http://localhost:3001
echo   Common App:           http://localhost:3002
echo   Budgeting App:        http://localhost:3003
echo   Data Management App:  http://localhost:3004
echo   Entity Setup App:     http://localhost:3005
echo.
echo API Endpoints:
echo   API Base:             http://localhost:50005
echo   Users API:            http://localhost:8082
echo   Admin API:            http://localhost:8888
echo.
echo Note: This batch script does not verify if applications are ready.
echo Use the PowerShell script (start-all-apps.ps1) for verification.
echo.
echo Press any key to exit this script...
pause > nul






