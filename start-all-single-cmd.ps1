# Script para iniciar todos los servidores en un solo CMD
Write-Host "Abriendo CMD único con todos los servidores..." -ForegroundColor Green

# Obtener el directorio actual del proyecto
$projectPath = Get-Location

# Crear el comando que se ejecutará en el CMD
$cmdCommand = @"
@echo off
title Servidores App_Test - Todos en una ventana
echo ========================================
echo    INICIANDO TODOS LOS SERVIDORES
echo ========================================
echo.

echo [1/3] Verificando dependencias del Backend Principal...
cd /d "$projectPath\backend"
if not exist "node_modules" (
    echo Instalando dependencias del Backend Principal...
    npm install
)

echo [2/3] Verificando dependencias del Frontend...
cd /d "$projectPath\frontend"
if not exist "node_modules" (
    echo Instalando dependencias del Frontend...
    npm install
)

echo [3/3] Verificando dependencias del Backend Alcaldia...
cd /d "$projectPath\backend-alcaldia"
if not exist "node_modules" (
    echo Instalando dependencias del Backend Alcaldia...
    npm install
)

echo.
echo ========================================
echo    INICIANDO SERVICIOS EN UNA VENTANA
echo ========================================
echo.

cd /d "$projectPath"

echo Instalando concurrently si no existe...
npm install -g concurrently

echo Iniciando todos los servidores...
concurrently ^
  "cd backend && npm start" ^
  "cd frontend && npm start" ^
  "cd backend-alcaldia && node server-new.js"

echo.
echo ========================================
echo    SERVICIOS INICIADOS
echo ========================================
echo Frontend: http://localhost:3000
echo Backend Principal: http://localhost:4000
echo Backend Alcaldia: http://localhost:4001
echo.
echo Presiona Ctrl+C para detener todos los servicios
pause
"@

# Guardar el comando en un archivo temporal
$tempFile = [System.IO.Path]::GetTempFileName() + ".bat"
$cmdCommand | Out-File -FilePath $tempFile -Encoding ASCII

# Abrir el CMD con el archivo temporal
Start-Process "cmd.exe" -ArgumentList "/k", $tempFile

Write-Host "CMD abierto con todos los servidores iniciándose en una sola ventana..." -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "URLs de los servicios:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend Principal: http://localhost:4000" -ForegroundColor White
Write-Host "  Backend Alcaldia: http://localhost:4001" -ForegroundColor White







