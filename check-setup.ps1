# Script para verificar la configuración del proyecto
Write-Host "Verificando configuración del proyecto..." -ForegroundColor Green

$errors = @()

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js: NO INSTALADO" -ForegroundColor Red
    $errors += "Node.js no está instalado"
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm: NO INSTALADO" -ForegroundColor Red
    $errors += "npm no está instalado"
}

# Verificar estructura del proyecto
Write-Host "`nVerificando estructura del proyecto..." -ForegroundColor Yellow

if (Test-Path "backend") {
    Write-Host "✅ Carpeta backend encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Carpeta backend NO encontrada" -ForegroundColor Red
    $errors += "Carpeta backend no encontrada"
}

if (Test-Path "frontend") {
    Write-Host "✅ Carpeta frontend encontrada" -ForegroundColor Green
} else {
    Write-Host "❌ Carpeta frontend NO encontrada" -ForegroundColor Red
    $errors += "Carpeta frontend no encontrada"
}

if (Test-Path "backend/package.json") {
    Write-Host "✅ package.json del backend encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json del backend NO encontrado" -ForegroundColor Red
    $errors += "package.json del backend no encontrado"
}

if (Test-Path "frontend/package.json") {
    Write-Host "✅ package.json del frontend encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json del frontend NO encontrado" -ForegroundColor Red
    $errors += "package.json del frontend no encontrado"
}

# Verificar dependencias instaladas
Write-Host "`nVerificando dependencias..." -ForegroundColor Yellow

if (Test-Path "backend/node_modules") {
    Write-Host "✅ Dependencias del backend instaladas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependencias del backend NO instaladas" -ForegroundColor Yellow
    Write-Host "   Ejecuta: cd backend && npm install" -ForegroundColor Gray
}

if (Test-Path "frontend/node_modules") {
    Write-Host "✅ Dependencias del frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Dependencias del frontend NO instaladas" -ForegroundColor Yellow
    Write-Host "   Ejecuta: cd frontend && npm install" -ForegroundColor Gray
}

# Verificar puertos disponibles
Write-Host "`nVerificando puertos..." -ForegroundColor Yellow

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "⚠️  Puerto 3000 está en uso" -ForegroundColor Yellow
} else {
    Write-Host "✅ Puerto 3000 disponible" -ForegroundColor Green
}

$port4000 = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
if ($port4000) {
    Write-Host "⚠️  Puerto 4000 está en uso" -ForegroundColor Yellow
} else {
    Write-Host "✅ Puerto 4000 disponible" -ForegroundColor Green
}

# Resumen
Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "✅ Todo está configurado correctamente!" -ForegroundColor Green
    Write-Host "Puedes ejecutar el proyecto con: .\start-project.ps1" -ForegroundColor Cyan
} else {
    Write-Host "❌ Se encontraron los siguientes problemas:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   - $error" -ForegroundColor Red
    }
    Write-Host "`nPor favor soluciona estos problemas antes de continuar." -ForegroundColor Yellow
}

Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 