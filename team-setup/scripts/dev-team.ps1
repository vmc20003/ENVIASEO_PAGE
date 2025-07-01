# Script para iniciar el proyecto en modo desarrollo colaborativo
Write-Host "🚀 Iniciando Sistema de Gestión de Asistencia en modo desarrollo colaborativo..." -ForegroundColor Green

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot

# Verificar si el proyecto está configurado para Git
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  El proyecto no está configurado para Git. Ejecuta primero:" -ForegroundColor Yellow
    Write-Host "   git init" -ForegroundColor Cyan
    Write-Host "   git add ." -ForegroundColor Cyan
    Write-Host "   git commit -m 'Initial commit'" -ForegroundColor Cyan
    Write-Host "   git remote add origin <URL-DEL-REPOSITORIO>" -ForegroundColor Cyan
}

# Verificar si las dependencias están instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Yellow
    cd backend
    npm install
    cd ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

# Crear carpeta de uploads si no existe
if (-not (Test-Path "backend/uploads_excel")) {
    Write-Host "📁 Creando carpeta de uploads..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "backend/uploads_excel" -Force
}

Write-Host "`n🎯 Iniciando servicios..." -ForegroundColor Yellow

# Iniciar Backend en una nueva ventana
Write-Host "🔧 Iniciando Backend (puerto 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\backend'; npm start"

# Esperar 3 segundos para que el backend se inicie
Start-Sleep -Seconds 3

# Iniciar Frontend en una nueva ventana
Write-Host "🎨 Iniciando Frontend (puerto 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm start"

Write-Host "`n✅ ¡Proyecto iniciado correctamente!" -ForegroundColor Green
Write-Host "`n🌐 URLs de acceso:" -ForegroundColor Yellow
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "- Backend API: http://localhost:4000" -ForegroundColor Cyan

Write-Host "`n💡 Consejos para trabajo en equipo:" -ForegroundColor Yellow
Write-Host "- Usa 'git status' para ver el estado de tus cambios" -ForegroundColor White
Write-Host "- Crea ramas para nuevas funcionalidades: git checkout -b feature/nombre" -ForegroundColor White
Write-Host "- Haz commits frecuentes con mensajes descriptivos" -ForegroundColor White
Write-Host "- Comunica cambios importantes al equipo" -ForegroundColor White

Write-Host "`n📚 Documentación:" -ForegroundColor Yellow
Write-Host "- README.md: Documentación general" -ForegroundColor Cyan
Write-Host "- team-setup/docs/CONTRIBUTING.md: Guía de contribución" -ForegroundColor Cyan
Write-Host "- team-setup/docs/ONBOARDING.md: Checklist para nuevos miembros" -ForegroundColor Cyan

Write-Host "`n✨ ¡Listo para desarrollar en equipo!" -ForegroundColor Green
