# Script simple para iniciar el proyecto
Write-Host "Iniciando proyecto..." -ForegroundColor Green

# Navegar al directorio raíz
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot

# Verificar dependencias
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Instalando dependencias del backend..." -ForegroundColor Yellow
    cd backend
    npm install
    cd ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

# Crear carpeta de uploads
if (-not (Test-Path "backend/uploads_excel")) {
    Write-Host "Creando carpeta de uploads..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "backend/uploads_excel" -Force
}

Write-Host "Iniciando servicios..." -ForegroundColor Yellow

# Iniciar Backend
Write-Host "Iniciando Backend (puerto 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; npm start"

# Esperar 3 segundos
Start-Sleep -Seconds 3

# Iniciar Frontend
Write-Host "Iniciando Frontend (puerto 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm start"

Write-Host "Proyecto iniciado!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:4000" -ForegroundColor Cyan
