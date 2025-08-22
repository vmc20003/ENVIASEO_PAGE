# Script para limpiar archivos del backend
Write-Host "🧹 Limpiando archivos del backend..." -ForegroundColor Yellow

# Navegar al directorio del backend
Set-Location "backend"

# Verificar si Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar si el archivo de limpieza existe
if (-not (Test-Path "clear-all-files.js")) {
    Write-Host "❌ El archivo clear-all-files.js no existe" -ForegroundColor Red
    exit 1
}

# Ejecutar la limpieza
Write-Host "🚀 Ejecutando limpieza..." -ForegroundColor Green
node clear-all-files.js

# Verificar el resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Limpieza completada exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error durante la limpieza" -ForegroundColor Red
}

# Volver al directorio raíz
Set-Location ".."

Write-Host "💡 Recuerda reiniciar el servidor backend para aplicar los cambios" -ForegroundColor Cyan
