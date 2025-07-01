# Script de verificación y sincronización completa del proyecto
Write-Host "🔍 Verificación y Sincronización Completa del Proyecto" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot

Write-Host "`n📋 Verificando herramientas básicas..." -ForegroundColor Yellow

# Verificar Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git no está instalado" -ForegroundColor Red
    Write-Host "   Descarga desde: https://git-scm.com/" -ForegroundColor Cyan
    $gitMissing = $true
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "   Descarga desde: https://nodejs.org/" -ForegroundColor Cyan
    $nodeMissing = $true
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    $npmMissing = $true
}

if ($gitMissing -or $nodeMissing -or $npmMissing) {
    Write-Host "`n⚠️  Instala las herramientas faltantes antes de continuar" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🔗 Verificando conexión con GitHub..." -ForegroundColor Yellow

# Verificar configuración de Git
$gitUser = git config user.name
$gitEmail = git config user.email
$remoteUrl = git config --get remote.origin.url

if ($gitUser -and $gitEmail) {
    Write-Host "✅ Git configurado: $gitUser - $gitEmail" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git no está configurado" -ForegroundColor Yellow
    Write-Host "   Ejecuta: git config --global user.name 'Tu Nombre'" -ForegroundColor Cyan
    Write-Host "   Ejecuta: git config --global user.email 'tu-email@ejemplo.com'" -ForegroundColor Cyan
}

if ($remoteUrl) {
    Write-Host "✅ Repositorio remoto: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "❌ No hay repositorio remoto configurado" -ForegroundColor Red
    exit 1
}

# Verificar conexión con GitHub
try {
    $testConnection = git ls-remote origin --heads main
    Write-Host "✅ Conexión con GitHub: OK" -ForegroundColor Green
} catch {
    Write-Host "❌ No se puede conectar con GitHub" -ForegroundColor Red
    Write-Host "   Verifica tu conexión a internet y credenciales" -ForegroundColor Cyan
    exit 1
}

Write-Host "`n📦 Verificando dependencias..." -ForegroundColor Yellow

# Verificar dependencias del proyecto raíz
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias del proyecto raíz..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "✅ Dependencias del proyecto raíz: OK" -ForegroundColor Green
}

# Verificar dependencias del backend
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📦 Instalando dependencias del backend..." -ForegroundColor Cyan
    cd backend
    npm install
    cd ..
} else {
    Write-Host "✅ Dependencias del backend: OK" -ForegroundColor Green
}

# Verificar dependencias del frontend
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Cyan
    cd frontend
    npm install
    cd ..
} else {
    Write-Host "✅ Dependencias del frontend: OK" -ForegroundColor Green
}

Write-Host "`n📁 Verificando estructura de archivos..." -ForegroundColor Yellow

# Verificar carpetas necesarias
$requiredFolders = @(
    "backend/uploads_excel",
    "team-setup",
    "team-setup/scripts",
    "team-setup/docs",
    "team-setup/config",
    "team-setup/templates"
)

foreach ($folder in $requiredFolders) {
    if (-not (Test-Path $folder)) {
        Write-Host "📁 Creando carpeta: $folder" -ForegroundColor Cyan
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    } else {
        Write-Host "✅ Carpeta $folder - OK" -ForegroundColor Green
    }
}

# Verificar archivos de configuración
if (-not (Test-Path ".gitignore")) {
    Write-Host "📄 Copiando .gitignore..." -ForegroundColor Cyan
    Copy-Item "team-setup/config/.gitignore" ".gitignore" -Force
} else {
    Write-Host "✅ .gitignore - OK" -ForegroundColor Green
}

if (-not (Test-Path ".env")) {
    Write-Host "📄 Copiando .env..." -ForegroundColor Cyan
    Copy-Item "team-setup/config/env.example" ".env" -Force
} else {
    Write-Host "✅ .env - OK" -ForegroundColor Green
}

if (-not (Test-Path ".vscode")) {
    Write-Host "📄 Copiando configuración de VS Code..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path ".vscode" -Force | Out-Null
    Copy-Item "team-setup/config/.vscode/settings.json" ".vscode/settings.json" -Force
    Copy-Item "team-setup/config/.vscode/extensions.json" ".vscode/extensions.json" -Force
} else {
    Write-Host "✅ Configuración de VS Code - OK" -ForegroundColor Green
}

Write-Host "`n🔄 Sincronizando con GitHub..." -ForegroundColor Yellow

# Verificar estado del repositorio
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Hay cambios locales sin commitear:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Cyan

    $response = Read-Host "¿Quieres hacer commit de estos cambios? (s/n)"
    if ($response -eq "s" -or $response -eq "S") {
        git add .
        $commitMessage = Read-Host "Mensaje del commit"
        git commit -m $commitMessage
    }
}

# Actualizar desde GitHub
Write-Host "⬇️  Actualizando desde GitHub..." -ForegroundColor Cyan
try {
    git fetch origin
    $currentBranch = git branch --show-current
    git pull origin $currentBranch
    Write-Host "✅ Sincronización completada" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error al sincronizar: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🧪 Verificando que el proyecto funciona..." -ForegroundColor Yellow

# Verificar que los archivos principales existen
$mainFiles = @(
    "package.json",
    "backend/server.js",
    "frontend/src/App.jsx",
    "README.md"
)

foreach ($file in $mainFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - OK" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - FALTANTE" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Verificación de puertos..." -ForegroundColor Yellow

# Verificar si los puertos están disponibles
$ports = @(3000, 4000)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "⚠️  Puerto $port está en uso" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Puerto $port disponible" -ForegroundColor Green
    }
}

Write-Host "`n🎉 ¡Verificación completada!" -ForegroundColor Green
Write-Host "`n📋 Resumen:" -ForegroundColor Yellow
Write-Host "- Herramientas básicas: Verificadas" -ForegroundColor White
Write-Host "- Dependencias: Instaladas" -ForegroundColor White
Write-Host "- Configuración: Copiada" -ForegroundColor White
Write-Host "- Sincronización con GitHub: Completada" -ForegroundColor White

Write-Host "`n🚀 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ejecuta 'npm run dev-team' para iniciar el proyecto" -ForegroundColor White
Write-Host "2. Abre http://localhost:3000 en tu navegador" -ForegroundColor White
Write-Host "3. Crea una rama para trabajar: git checkout -b feature/mi-funcionalidad" -ForegroundColor White

Write-Host "`n✨ ¡Listo para desarrollar!" -ForegroundColor Green
