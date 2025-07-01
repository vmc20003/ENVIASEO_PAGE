# Script simple de verificación del proyecto
Write-Host "Verificando proyecto..." -ForegroundColor Green

# Navegar al directorio raíz
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot

Write-Host "Verificando herramientas..." -ForegroundColor Yellow

# Verificar Git
try {
    $gitVersion = git --version
    Write-Host "Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git no esta instalado" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js no esta instalado" -ForegroundColor Red
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm no esta instalado" -ForegroundColor Red
    exit 1
}

Write-Host "Instalando dependencias..." -ForegroundColor Yellow

# Instalar dependencias del proyecto raíz
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias del proyecto..." -ForegroundColor Cyan
    npm install
} else {
    Write-Host "Dependencias del proyecto: OK" -ForegroundColor Green
}

# Instalar dependencias del backend
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Instalando dependencias del backend..." -ForegroundColor Cyan
    cd backend
    npm install
    cd ..
} else {
    Write-Host "Dependencias del backend: OK" -ForegroundColor Green
}

# Instalar dependencias del frontend
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Instalando dependencias del frontend..." -ForegroundColor Cyan
    cd frontend
    npm install
    cd ..
} else {
    Write-Host "Dependencias del frontend: OK" -ForegroundColor Green
}

Write-Host "Verificando archivos..." -ForegroundColor Yellow

# Crear carpetas necesarias
if (-not (Test-Path "backend/uploads_excel")) {
    New-Item -ItemType Directory -Path "backend/uploads_excel" -Force
    Write-Host "Carpeta uploads_excel creada" -ForegroundColor Green
}

# Copiar archivos de configuración
if (-not (Test-Path ".gitignore")) {
    Copy-Item "team-setup/config/.gitignore" ".gitignore" -Force
    Write-Host ".gitignore copiado" -ForegroundColor Green
}

if (-not (Test-Path ".env")) {
    Copy-Item "team-setup/config/env.example" ".env" -Force
    Write-Host ".env copiado" -ForegroundColor Green
}

if (-not (Test-Path ".vscode")) {
    New-Item -ItemType Directory -Path ".vscode" -Force
    Copy-Item "team-setup/config/.vscode/settings.json" ".vscode/settings.json" -Force
    Copy-Item "team-setup/config/.vscode/extensions.json" ".vscode/extensions.json" -Force
    Write-Host "Configuracion de VS Code copiada" -ForegroundColor Green
}

Write-Host "Sincronizando con GitHub..." -ForegroundColor Yellow

# Sincronizar con GitHub
try {
    git fetch origin
    git pull origin main
    Write-Host "Sincronizacion completada" -ForegroundColor Green
} catch {
    Write-Host "Error al sincronizar" -ForegroundColor Yellow
}

Write-Host "Verificando archivos principales..." -ForegroundColor Yellow

# Verificar archivos principales
$files = @("package.json", "backend/server.js", "frontend/src/App.jsx", "README.md")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "$file - OK" -ForegroundColor Green
    } else {
        Write-Host "$file - FALTANTE" -ForegroundColor Red
    }
}

Write-Host "Verificacion completada!" -ForegroundColor Green
Write-Host "Ejecuta 'npm run dev-team' para iniciar el proyecto" -ForegroundColor Yellow
