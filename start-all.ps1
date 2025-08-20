# Start all servers in a single command window
Write-Host "Starting all servers in a single window..." -ForegroundColor Green

# Obtener el directorio actual del proyecto
$projectPath = Get-Location

# Iniciar todos los servidores en paralelo usando jobs
Write-Host "Iniciando Backend Principal (Alumbrado)..." -ForegroundColor Yellow
Start-Job -ScriptBlock {
    param($projectPath)
    Set-Location "$projectPath\backend"
    if (!(Test-Path "node_modules")) {
        Write-Host "Installing dependencies for Backend Principal..." -ForegroundColor Cyan
        npm install
    }
    Write-Host "Starting Backend Principal on port 4000..." -ForegroundColor Green
    npm start
} -ArgumentList $projectPath -Name "BackendPrincipal"

Write-Host "Iniciando Frontend..." -ForegroundColor Yellow
Start-Job -ScriptBlock {
    param($projectPath)
    Set-Location "$projectPath\frontend"
    if (!(Test-Path "node_modules")) {
        Write-Host "Installing dependencies for Frontend..." -ForegroundColor Cyan
        npm install
    }
    Write-Host "Starting Frontend on port 3000..." -ForegroundColor Green
    npm start
} -ArgumentList $projectPath -Name "Frontend"

Write-Host "Iniciando Backend Alcaldia..." -ForegroundColor Yellow
Start-Job -ScriptBlock {
    param($projectPath)
    Set-Location "$projectPath\backend-alcaldia"
    if (!(Test-Path "node_modules")) {
        Write-Host "Installing dependencies for Backend Alcaldia..." -ForegroundColor Cyan
        npm install
    }
    Write-Host "Starting Backend Alcaldia on port 4001..." -ForegroundColor Green
    node server-new.js
} -ArgumentList $projectPath -Name "BackendAlcaldia"

Write-Host "Todos los servidores están iniciando..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend Principal: http://localhost:4000" -ForegroundColor Cyan
Write-Host "Backend Alcaldia: http://localhost:4001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para ver el estado de los servidores, ejecuta: Get-Job" -ForegroundColor Yellow
Write-Host "Para ver los logs de un servidor específico, ejecuta: Receive-Job -Name 'NombreDelServidor'" -ForegroundColor Yellow
Write-Host "Para detener todos los servidores, ejecuta: Get-Job | Stop-Job" -ForegroundColor Red

# Mostrar el estado de los jobs
Start-Sleep -Seconds 3
Write-Host ""
Write-Host "Estado de los servidores:" -ForegroundColor Magenta
Get-Job | Format-Table -AutoSize
