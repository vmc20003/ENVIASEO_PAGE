# Script para copiar configuración del equipo al proyecto
Write-Host "🔧 Copiando configuración del equipo..." -ForegroundColor Green

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot

# Copiar .gitignore si no existe
if (-not (Test-Path ".gitignore")) {
    Write-Host "📄 Copiando .gitignore..." -ForegroundColor Yellow
    Copy-Item "team-setup/config/.gitignore" ".gitignore"
    Write-Host "✅ .gitignore copiado" -ForegroundColor Green
} else {
    Write-Host "✅ .gitignore ya existe" -ForegroundColor Green
}

# Copiar configuración de VS Code si no existe
if (-not (Test-Path ".vscode")) {
    Write-Host "🔧 Copiando configuración de VS Code..." -ForegroundColor Yellow
    Copy-Item "team-setup/config/.vscode" ".vscode" -Recurse
    Write-Host "✅ Configuración de VS Code copiada" -ForegroundColor Green
} else {
    Write-Host "✅ Configuración de VS Code ya existe" -ForegroundColor Green
}

# Copiar archivo .env si no existe
if (-not (Test-Path ".env")) {
    Write-Host "🔧 Copiando archivo .env..." -ForegroundColor Yellow
    Copy-Item "team-setup/config/env.example" ".env"
    Write-Host "✅ Archivo .env copiado (revisa y modifica las variables)" -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

Write-Host "`n🎉 Configuración copiada exitosamente!" -ForegroundColor Green
Write-Host "`n📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Revisa el archivo .env y modifica las variables según sea necesario" -ForegroundColor White
Write-Host "2. Instala las extensiones recomendadas de VS Code" -ForegroundColor White
Write-Host "3. Ejecuta 'npm run dev-team' para iniciar el proyecto" -ForegroundColor White
