@echo off
chcp 65001 >nul
title Diagnóstico del Sistema - Sistema de Gestión de Asistencia
color 0E

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    🔍 DIAGNÓSTICO DEL SISTEMA 🔍                             ║
echo ║                    Sistema de Gestión de Asistencia v1.3.0                  ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Este diagnóstico verificará el estado del sistema y detectará problemas
echo.

:: Información del sistema
echo ═══════════════════════════════════════════════════════════════════════════════
echo 📊 INFORMACIÓN DEL SISTEMA
echo ═══════════════════════════════════════════════════════════════════════════════
echo 🖥️  Sistema Operativo: %OS%
echo 👤 Usuario: %USERNAME%
echo 📁 Directorio: %CD%
echo 📅 Fecha: %DATE%
echo 🕐 Hora: %TIME%
echo.

:: Verificar Node.js
echo ═══════════════════════════════════════════════════════════════════════════════
echo 🔍 VERIFICACIÓN DE NODE.JS
echo ═══════════════════════════════════════════════════════════════════════════════
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js instalado: %NODE_VERSION%
) else (
    echo ❌ Node.js NO está instalado
    echo    Solución: Descarga Node.js desde https://nodejs.org/
)
echo.

:: Verificar npm
echo ═══════════════════════════════════════════════════════════════════════════════
echo 🔍 VERIFICACIÓN DE NPM
echo ═══════════════════════════════════════════════════════════════════════════════
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm disponible: %NPM_VERSION%
) else (
    echo ❌ npm NO está disponible
    echo    Solución: Reinstala Node.js
)
echo.

:: Verificar estructura de carpetas
echo ═══════════════════════════════════════════════════════════════════════════════
echo 📁 VERIFICACIÓN DE ESTRUCTURA DE CARPETAS
echo ═══════════════════════════════════════════════════════════════════════════════
if exist "frontend" (
    echo ✅ Carpeta frontend existe
) else (
    echo ❌ Carpeta frontend NO existe
)

if exist "backend" (
    echo ✅ Carpeta backend existe
) else (
    echo ❌ Carpeta backend NO existe
)

if exist "backend-alcaldia" (
    echo ✅ Carpeta backend-alcaldia existe
) else (
    echo ❌ Carpeta backend-alcaldia NO existe
)

if exist "backend-enviaseo-control-acceso" (
    echo ✅ Carpeta backend-enviaseo-control-acceso existe
) else (
    echo ❌ Carpeta backend-enviaseo-control-acceso NO existe
)
echo.

:: Verificar archivos package.json
echo ═══════════════════════════════════════════════════════════════════════════════
echo 📦 VERIFICACIÓN DE ARCHIVOS PACKAGE.JSON
echo ═══════════════════════════════════════════════════════════════════════════════
if exist "package.json" (
    echo ✅ package.json principal existe
) else (
    echo ❌ package.json principal NO existe
)

if exist "frontend\package.json" (
    echo ✅ package.json frontend existe
) else (
    echo ❌ package.json frontend NO existe
)

if exist "backend\package.json" (
    echo ✅ package.json backend existe
) else (
    echo ❌ package.json backend NO existe
)

if exist "backend-alcaldia\package.json" (
    echo ✅ package.json backend-alcaldia existe
) else (
    echo ❌ package.json backend-alcaldia NO existe
)

if exist "backend-enviaseo-control-acceso\package.json" (
    echo ✅ package.json backend-enviaseo existe
) else (
    echo ❌ package.json backend-enviaseo NO existe
)
echo.

:: Verificar node_modules
echo ═══════════════════════════════════════════════════════════════════════════════
echo 📦 VERIFICACIÓN DE NODE_MODULES
echo ═══════════════════════════════════════════════════════════════════════════════
if exist "node_modules" (
    echo ✅ node_modules principal instalado
) else (
    echo ⚠️  node_modules principal NO instalado
)

if exist "frontend\node_modules" (
    echo ✅ node_modules frontend instalado
) else (
    echo ⚠️  node_modules frontend NO instalado
)

if exist "backend\node_modules" (
    echo ✅ node_modules backend instalado
) else (
    echo ⚠️  node_modules backend NO instalado
)

if exist "backend-alcaldia\node_modules" (
    echo ✅ node_modules backend-alcaldia instalado
) else (
    echo ⚠️  node_modules backend-alcaldia NO instalado
)

if exist "backend-enviaseo-control-acceso\node_modules" (
    echo ✅ node_modules backend-enviaseo instalado
) else (
    echo ⚠️  node_modules backend-enviaseo NO instalado
)
echo.

:: Verificar puertos
echo ═══════════════════════════════════════════════════════════════════════════════
echo 🌐 VERIFICACIÓN DE PUERTOS
echo ═══════════════════════════════════════════════════════════════════════════════
netstat -an | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 3000 está en uso (Frontend)
) else (
    echo ✅ Puerto 3000 disponible (Frontend)
)

netstat -an | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 5000 está en uso (Backend Alumbrado)
) else (
    echo ✅ Puerto 5000 disponible (Backend Alumbrado)
)

netstat -an | findstr ":5001" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 5001 está en uso (Backend Enviaseo)
) else (
    echo ✅ Puerto 5001 disponible (Backend Enviaseo)
)

netstat -an | findstr ":5002" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 5002 está en uso (Backend Alcaldía)
) else (
    echo ✅ Puerto 5002 disponible (Backend Alcaldía)
)
echo.

:: Verificar procesos Node.js
echo ═══════════════════════════════════════════════════════════════════════════════
echo 🔄 VERIFICACIÓN DE PROCESOS NODE.JS
echo ═══════════════════════════════════════════════════════════════════════════════
tasklist | findstr "node.exe" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Hay procesos Node.js ejecutándose:
    tasklist | findstr "node.exe"
) else (
    echo ✅ No hay procesos Node.js ejecutándose
)
echo.

:: Verificar carpetas de uploads
echo ═══════════════════════════════════════════════════════════════════════════════
echo 📁 VERIFICACIÓN DE CARPETAS DE UPLOADS
echo ═══════════════════════════════════════════════════════════════════════════════
if exist "backend\uploads_excel" (
    echo ✅ Carpeta uploads backend existe
) else (
    echo ⚠️  Carpeta uploads backend NO existe
)

if exist "backend-alcaldia\uploads_excel" (
    echo ✅ Carpeta uploads backend-alcaldia existe
) else (
    echo ⚠️  Carpeta uploads backend-alcaldia NO existe
)

if exist "backend-enviaseo-control-acceso\uploads_excel" (
    echo ✅ Carpeta uploads backend-enviaseo existe
) else (
    echo ⚠️  Carpeta uploads backend-enviaseo NO existe
)
echo.

:: Resumen y recomendaciones
echo ═══════════════════════════════════════════════════════════════════════════════
echo 📋 RESUMEN Y RECOMENDACIONES
echo ═══════════════════════════════════════════════════════════════════════════════
echo.

:: Contar problemas
set PROBLEMAS=0
node --version >nul 2>&1 || set /a PROBLEMAS+=1
npm --version >nul 2>&1 || set /a PROBLEMAS+=1
if not exist "frontend" set /a PROBLEMAS+=1
if not exist "backend" set /a PROBLEMAS+=1
if not exist "backend-alcaldia" set /a PROBLEMAS+=1
if not exist "backend-enviaseo-control-acceso" set /a PROBLEMAS+=1

if %PROBLEMAS% equ 0 (
    echo ✅ Sistema en buen estado
    echo.
    echo 🚀 Recomendaciones:
    echo    - Ejecuta INSTALADOR_RAPIDO.bat para instalación rápida
    echo    - O ejecuta INSTALADOR_COMPLETO.bat para instalación completa
    echo    - Usa INICIAR_SISTEMA.bat para iniciar el sistema
) else (
    echo ⚠️  Se detectaron %PROBLEMAS% problemas
    echo.
    echo 🔧 Soluciones recomendadas:
    echo    - Ejecuta INSTALADOR_COMPLETO.bat para instalación completa
    echo    - Verifica que Node.js esté instalado correctamente
    echo    - Asegúrate de estar en el directorio correcto del proyecto
)

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        🔍 DIAGNÓSTICO COMPLETADO 🔍                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.

set /p choice="¿Deseas ejecutar una instalación automática? (s/n): "
if /i "%choice%"=="s" (
    echo.
    echo 🔧 Ejecutando instalación automática...
    if exist "INSTALADOR_COMPLETO.bat" (
        start INSTALADOR_COMPLETO.bat
    ) else (
        echo ❌ INSTALADOR_COMPLETO.bat no encontrado
        echo    Ejecuta manualmente: npm install
    )
) else (
    echo.
    echo 👋 Diagnóstico completado. Revisa las recomendaciones arriba.
)

echo.
pause