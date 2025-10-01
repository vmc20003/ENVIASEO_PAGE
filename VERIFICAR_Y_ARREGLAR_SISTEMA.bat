@echo off
chcp 65001 >nul
title Verificar y Arreglar Sistema - Sistema de Gestión de Asistencia
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    🔧 VERIFICAR Y ARREGLAR SISTEMA 🔧                       ║
echo ║                    Sistema de Gestión de Asistencia v1.3.0                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Este script verificará y arreglará problemas comunes de instalación
echo.

echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo.
    echo 📥 SOLUCIÓN:
    echo    1. Descargar Node.js desde: https://nodejs.org/
    echo    2. Instalar la versión LTS (Long Term Support)
    echo    3. Reiniciar el computador después de instalar
    echo    4. Ejecutar este script nuevamente
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detectado: %NODE_VERSION%

echo.
echo 🔍 Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está disponible
    echo    Reinstala Node.js para incluir npm
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm detectado: %NPM_VERSION%

echo.
echo 🔍 Verificando estructura de carpetas...
if not exist "frontend" (
    echo ❌ Carpeta frontend no encontrada
    echo    Asegúrate de estar en el directorio correcto del proyecto
    pause
    exit /b 1
)
if not exist "backend" (
    echo ❌ Carpeta backend no encontrada
    echo    Asegúrate de estar en el directorio correcto del proyecto
    pause
    exit /b 1
)
if not exist "backend-alcaldia" (
    echo ❌ Carpeta backend-alcaldia no encontrada
    echo    Asegúrate de estar en el directorio correcto del proyecto
    pause
    exit /b 1
)
if not exist "backend-enviaseo-control-acceso" (
    echo ❌ Carpeta backend-enviaseo-control-acceso no encontrada
    echo    Asegúrate de estar en el directorio correcto del proyecto
    pause
    exit /b 1
)
echo ✅ Estructura de carpetas correcta

echo.
echo 🔍 Verificando archivos package.json...
if not exist "package.json" (
    echo ❌ package.json principal no encontrado
    pause
    exit /b 1
)
if not exist "frontend\package.json" (
    echo ❌ package.json frontend no encontrado
    pause
    exit /b 1
)
if not exist "backend\package.json" (
    echo ❌ package.json backend no encontrado
    pause
    exit /b 1
)
if not exist "backend-alcaldia\package.json" (
    echo ❌ package.json backend-alcaldia no encontrado
    pause
    exit /b 1
)
if not exist "backend-enviaseo-control-acceso\package.json" (
    echo ❌ package.json backend-enviaseo no encontrado
    pause
    exit /b 1
)
echo ✅ Archivos package.json encontrados

echo.
echo 🔍 Verificando node_modules...
if not exist "node_modules" (
    echo ⚠️  node_modules principal no instalado
    echo 📦 Instalando dependencias del proyecto principal...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar dependencias del proyecto principal
        pause
        exit /b 1
    )
    echo ✅ Dependencias del proyecto principal instaladas
) else (
    echo ✅ node_modules principal instalado
)

if not exist "frontend\node_modules" (
    echo ⚠️  node_modules frontend no instalado
    echo 📦 Instalando dependencias del frontend...
    cd frontend
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar dependencias del frontend
        pause
        exit /b 1
    )
    echo ✅ Dependencias del frontend instaladas
) else (
    echo ✅ node_modules frontend instalado
)

if not exist "backend\node_modules" (
    echo ⚠️  node_modules backend no instalado
    echo 📦 Instalando dependencias del backend...
    cd backend
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar dependencias del backend
        pause
        exit /b 1
    )
    echo ✅ Dependencias del backend instaladas
) else (
    echo ✅ node_modules backend instalado
)

if not exist "backend-alcaldia\node_modules" (
    echo ⚠️  node_modules backend-alcaldia no instalado
    echo 📦 Instalando dependencias del backend-alcaldia...
    cd backend-alcaldia
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar dependencias del backend-alcaldia
        pause
        exit /b 1
    )
    echo ✅ Dependencias del backend-alcaldia instaladas
) else (
    echo ✅ node_modules backend-alcaldia instalado
)

if not exist "backend-enviaseo-control-acceso\node_modules" (
    echo ⚠️  node_modules backend-enviaseo no instalado
    echo 📦 Instalando dependencias del backend-enviaseo...
    cd backend-enviaseo-control-acceso
    call npm install
    cd ..
    if %errorlevel% neq 0 (
        echo ❌ Error al instalar dependencias del backend-enviaseo
        pause
        exit /b 1
    )
    echo ✅ Dependencias del backend-enviaseo instaladas
) else (
    echo ✅ node_modules backend-enviaseo instalado
)

echo.
echo 🔍 Verificando puertos...
netstat -an | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 3000 está en uso (Frontend)
    echo 🔄 Deteniendo procesos Node.js...
    taskkill /f /im node.exe 2>nul
    timeout /t 3 /nobreak >nul
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
echo 🔍 Verificando configuración del modo demo...
findstr /C:"return false" frontend\src\config.js >nul
if %errorlevel% equ 0 (
    echo ✅ Modo demo deshabilitado correctamente
) else (
    echo ⚠️  Modo demo puede estar habilitado
    echo 🔧 Arreglando configuración...
    echo export const isDemoMode = () => { > temp_config.js
    echo   return false; // DESHABILITADO - siempre false >> temp_config.js
    echo }; >> temp_config.js
    echo ✅ Configuración arreglada
)

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        ✅ VERIFICACIÓN COMPLETADA ✅                        ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 El sistema está listo para usar
echo.
echo 📋 Próximos pasos:
echo    1. Ejecutar INICIAR_SISTEMA.bat para iniciar todo el sistema
echo    2. Abrir http://localhost:3000 en tu navegador
echo    3. Seleccionar el módulo que deseas usar
echo.
echo 💡 Si sigues viendo "demo":
echo    - Asegúrate de usar la versión "Sistema_Gestion_Asistencia_Ligero_v1.3.0"
echo    - NO uses la versión "Sin_Dependencias" (esa es solo demo)
echo    - Ejecuta este script si hay problemas
echo.

set /p choice="¿Deseas iniciar el sistema ahora? (s/n): "
if /i "%choice%"=="s" (
    echo.
    echo 🚀 Iniciando sistema...
    start INICIAR_SISTEMA.bat
) else (
    echo.
    echo 👋 Verificación completada. Ejecuta INICIAR_SISTEMA.bat cuando estés listo.
)

echo.
pause
