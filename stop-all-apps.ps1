# PowerShell Script to Stop All Micro Frontends
# Run this script from the root directory: D:\E20\enplan-front-end-react

Write-Host "Stopping All Micro Frontends..." -ForegroundColor Red
Write-Host "===============================" -ForegroundColor Red
Write-Host ""

# Find all Node.js processes
$nodeProcesses = Get-Process | Where-Object {$_.ProcessName -eq "node"}

if ($nodeProcesses.Count -eq 0) {
    Write-Host "No Node.js processes found running." -ForegroundColor Yellow
    Write-Host "All micro frontends are already stopped." -ForegroundColor Green
} else {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es) running:" -ForegroundColor Yellow
    
    foreach ($process in $nodeProcesses) {
        Write-Host "  - Process ID: $($process.Id), Name: $($process.ProcessName)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Stopping all Node.js processes..." -ForegroundColor Red
    
    foreach ($process in $nodeProcesses) {
        try {
            Stop-Process -Id $process.Id -Force
            Write-Host "Stopped process ID: $($process.Id)" -ForegroundColor Green
        } catch {
            Write-Host "Failed to stop process ID: $($process.Id)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "All Micro Frontends Stopped!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
Read-Host






