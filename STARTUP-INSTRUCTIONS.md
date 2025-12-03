# Micro Frontend Startup Instructions

This document provides instructions for starting and stopping all micro frontends in the ENPLAN project.

## Quick Start

### Option 1: PowerShell Script (Recommended)
```powershell
.\start-all-apps.ps1
```
- **Features**: Smart verification every 10 seconds, stops when all apps are ready
- **Best for**: Development and testing

### Option 2: Batch File (Simple)
```cmd
start-all-apps.bat
```
- **Features**: Simple startup without verification
- **Best for**: Quick startup when you know everything works

## Application URLs

Once started, access the applications at:

| Application | URL | Port | Description |
|-------------|-----|------|-------------|
| **Admin App** (Host) | http://localhost:3000 | 3000 | Main application entry point |
| Home App | http://localhost:3001 | 3001 | Home micro frontend |
| Common App | http://localhost:3002 | 3002 | Shared components |
| Budgeting App | http://localhost:3003 | 3003 | Budgeting micro frontend |
| Data Management App | http://localhost:3004 | 3004 | Data management micro frontend |
| Entity Setup App | http://localhost:3005 | 3005 | Entity setup micro frontend |

## API Endpoints

The applications connect to these backend services:

| Service | URL | Port | Description |
|---------|-----|------|-------------|
| API Base | http://localhost:50005 | 50005 | Main API service |
| Users API | http://localhost:8082 | 8082 | User management API |
| Admin API | http://localhost:8888 | 8888 | Admin operations API |

## Stopping Applications

### Stop All Applications
```powershell
.\stop-all-apps.ps1
```

### Stop Individual Applications
- Press `Ctrl+C` in each application window
- Or close the individual PowerShell/Command windows

## Environment Variables

The scripts automatically set the following environment variables:

### Common App
- `REACT_APP_API_BASE_URL=http://localhost:50005`
- `REACT_APP_API_ENDPOINT=/api/v1/data/Data/ExecuteSqlQueries`
- `REACT_APP_HEALTH_ENDPOINT=/api/v1/health`

### Home App
- `COMMON_APP_URL=http://localhost:3002/remoteEntry.js`

### Budgeting App
- `COMMON_APP_URL=http://localhost:3002/remoteEntry.js`

### Data Management App
- `COMMON_APP_URL=http://localhost:3002/remoteEntry.js`

### Entity Setup App
- `REACT_APP_ENTITY_HIERARCHY_API_URL=http://localhost:50005`
- `REACT_APP_DATA_API_URL=http://localhost:8082`

### Admin App (Host)
- `REACT_APP_API_BASE_URL=http://localhost:50005`
- `REACT_APP_USERS_API_URL=http://localhost:8082`
- `REACT_APP_ADMIN_API_URL=http://localhost:8888`
- `COMMON_APP_URL=http://localhost:3002/remoteEntry.js`
- `HOME_APP_URL=http://localhost:3001/remoteEntry.js`
- `BUDGETING_APP_URL=http://localhost:3003/remoteEntry.js`
- `DATA_MGMT_APP_URL=http://localhost:3004/remoteEntry.js`
- `ENTITY_SETUP_APP_URL=http://localhost:3005/remoteEntry.js`

## Troubleshooting

### Node.js Not Found
If you get "node is not recognized" errors:
1. Ensure Node.js is installed
2. Add `C:\Program Files\nodejs` to your system PATH
3. Restart your terminal

### Port Already in Use
If a port is already in use:
1. Stop all applications: `.\stop-all-apps.ps1`
2. Wait a few seconds
3. Start again: `.\start-all-apps.ps1`

### Applications Not Loading
1. Check that all backend APIs are running on their respective ports
2. Verify no firewall is blocking the ports
3. Check individual application windows for error messages

### PowerShell Execution Policy
If PowerShell scripts won't run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Development Notes

- **Startup Order**: Common App → Home App → Budgeting App → Data Management App → Entity Setup App → Admin App
- **Dependencies**: Admin App depends on all other micro frontends
- **Module Federation**: Uses Webpack Module Federation for micro frontend communication
- **Environment**: All URLs point to localhost (no hardcoded IPs)

## File Structure

```
D:\E20\enplan-front-end-react\
├── start-all-apps.ps1          # PowerShell startup script (recommended)
├── start-all-apps.bat          # Batch startup script
├── stop-all-apps.ps1           # PowerShell stop script
├── STARTUP-INSTRUCTIONS.md     # This file
├── admin-app/                  # Host application
├── home-app/                   # Home micro frontend
├── common-app/                 # Shared components
├── budgeting-app/              # Budgeting micro frontend
├── dataManagement-app/         # Data management micro frontend
└── entitySetup-app/            # Entity setup micro frontend
```






