# Script para configurar el proyecto para nuevos miembros del equipo
Write-Host "🚀 Configurando Sistema de Gestión de Asistencia para trabajo en equipo..." -ForegroundColor Green

# Verificar si Git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git no está instalado. Por favor instala Git desde: https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar si npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está instalado. Por favor instala npm." -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Instalando dependencias..." -ForegroundColor Yellow

# Navegar al directorio raíz del proyecto (subir dos niveles desde team-setup/scripts/)
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot

# Instalar dependencias del proyecto raíz
Write-Host "Instalando dependencias del proyecto raíz..." -ForegroundColor Cyan
npm install

# Instalar dependencias del backend
Write-Host "Instalando dependencias del backend..." -ForegroundColor Cyan
cd backend
npm install
cd ..

# Instalar dependencias del frontend
Write-Host "Instalando dependencias del frontend..." -ForegroundColor Cyan
cd frontend
npm install
cd ..

# Copiar configuración del equipo
Write-Host "`n🔧 Copiando configuración del equipo..." -ForegroundColor Yellow
& "$PSScriptRoot\copy-config.ps1"

# Crear carpeta de uploads si no existe
if (-not (Test-Path "backend/uploads_excel")) {
    Write-Host "`n📁 Creando carpeta de uploads..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "backend/uploads_excel" -Force
    Write-Host "✅ Carpeta uploads_excel creada." -ForegroundColor Green
} else {
    Write-Host "✅ Carpeta uploads_excel ya existe." -ForegroundColor Green
}

# Verificar configuración de Git
Write-Host "`n🔍 Verificando configuración de Git..." -ForegroundColor Yellow

$gitUser = git config user.name
$gitEmail = git config user.email

if ($gitUser -and $gitEmail) {
    Write-Host "✅ Git configurado: $gitUser <$gitEmail>" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git no está configurado. Ejecuta estos comandos:" -ForegroundColor Yellow
    Write-Host "   git config --global user.name 'Tu Nombre'" -ForegroundColor Cyan
    Write-Host "   git config --global user.email 'tu-email@ejemplo.com'" -ForegroundColor Cyan
}

Write-Host "`n🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host "`n📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Revisa el archivo team-setup/docs/CONTRIBUTING.md para entender el flujo de trabajo" -ForegroundColor White
Write-Host "2. Configura tu editor de código (recomendado: VS Code)" -ForegroundColor White
Write-Host "3. Ejecuta 'npm run dev-team' para iniciar el proyecto" -ForegroundColor White
Write-Host "4. Crea una rama para tu primera funcionalidad: git checkout -b feature/mi-primera-funcionalidad" -ForegroundColor White

Write-Host "`n🔗 Enlaces útiles:" -ForegroundColor Yellow
Write-Host "- README.md: Documentación del proyecto" -ForegroundColor Cyan
Write-Host "- team-setup/docs/CONTRIBUTING.md: Guía de contribución" -ForegroundColor Cyan
Write-Host "- team-setup/docs/ONBOARDING.md: Checklist para nuevos miembros" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:4000" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n✨ ¡Listo para trabajar en equipo!" -ForegroundColor Green
