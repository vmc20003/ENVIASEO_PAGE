@echo off
chcp 65001 >nul
title Sistema de Gestión de Asistencia - Instalador Completo v1.3.0
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    🚀 SISTEMA DE GESTIÓN DE ASISTENCIA 🚀                    ║
echo ║                           Instalador Completo v1.3.0                        ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Este instalador configurará completamente el sistema de gestión de asistencia
echo    para los módulos: Alumbrado Público, Alcaldía y Enviaseo
echo.

:: Verificar si Node.js está instalado
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo.
    echo 📥 Descargando Node.js...
    echo    Por favor, descarga Node.js desde: https://nodejs.org/
    echo    Versión recomendada: LTS (Long Term Support)
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js detectado: %NODE_VERSION%

:: Verificar si npm está disponible
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

:: Limpiar instalaciones anteriores
echo 🧹 Limpiando instalaciones anteriores...
if exist "node_modules" (
    echo    Eliminando node_modules del directorio raíz...
    rmdir /s /q "node_modules" 2>nul
)
if exist "frontend\node_modules" (
    echo    Eliminando node_modules del frontend...
    rmdir /s /q "frontend\node_modules" 2>nul
)
if exist "backend\node_modules" (
    echo    Eliminando node_modules del backend...
    rmdir /s /q "backend\node_modules" 2>nul
)
if exist "backend-alcaldia\node_modules" (
    echo    Eliminando node_modules del backend-alcaldía...
    rmdir /s /q "backend-alcaldia\node_modules" 2>nul
)
if exist "backend-enviaseo-control-acceso\node_modules" (
    echo    Eliminando node_modules del backend-enviaseo...
    rmdir /s /q "backend-enviaseo-control-acceso\node_modules" 2>nul
)
echo ✅ Limpieza completada
echo.

:: Instalar dependencias del proyecto principal
echo 📦 Instalando dependencias del proyecto principal...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del proyecto principal
    pause
    exit /b 1
)
echo ✅ Dependencias del proyecto principal instaladas
echo.

:: Instalar dependencias del frontend
echo 📦 Instalando dependencias del frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Dependencias del frontend instaladas
echo.

:: Instalar dependencias del backend principal
echo 📦 Instalando dependencias del backend principal...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del backend principal
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Dependencias del backend principal instaladas
echo.

:: Instalar dependencias del backend alcaldía
echo 📦 Instalando dependencias del backend alcaldía...
cd backend-alcaldia
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del backend alcaldía
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Dependencias del backend alcaldía instaladas
echo.

:: Instalar dependencias del backend enviaseo
echo 📦 Instalando dependencias del backend enviaseo...
cd backend-enviaseo-control-acceso
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del backend enviaseo
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Dependencias del backend enviaseo instaladas
echo.

:: Crear carpetas necesarias
echo 📁 Creando carpetas necesarias...
if not exist "backend\uploads_excel" mkdir "backend\uploads_excel"
if not exist "backend-alcaldia\uploads_excel" mkdir "backend-alcaldia\uploads_excel"
if not exist "backend-enviaseo-control-acceso\uploads_excel" mkdir "backend-enviaseo-control-acceso\uploads_excel"
echo ✅ Carpetas creadas
echo.

:: Verificar puertos
echo 🔍 Verificando puertos disponibles...
netstat -an | findstr ":3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 3000 está en uso (Frontend)
)
netstat -an | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 5000 está en uso (Backend Alumbrado)
)
netstat -an | findstr ":5001" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 5001 está en uso (Backend Enviaseo)
)
netstat -an | findstr ":5002" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Puerto 5002 está en uso (Backend Alcaldía)
)
echo.

:: Crear scripts de inicio
echo 📝 Creando scripts de inicio...
echo @echo off > INICIAR_SISTEMA.bat
echo title Sistema de Gestión de Asistencia >> INICIAR_SISTEMA.bat
echo color 0A >> INICIAR_SISTEMA.bat
echo echo Iniciando Sistema de Gestión de Asistencia... >> INICIAR_SISTEMA.bat
echo npm start >> INICIAR_SISTEMA.bat
echo pause >> INICIAR_SISTEMA.bat

echo @echo off > INICIAR_SOLO_FRONTEND.bat
echo title Frontend - Modo Demo >> INICIAR_SOLO_FRONTEND.bat
echo color 0B >> INICIAR_SOLO_FRONTEND.bat
echo echo Iniciando Frontend en Modo Demo... >> INICIAR_SOLO_FRONTEND.bat
echo cd frontend >> INICIAR_SOLO_FRONTEND.bat
echo npm start >> INICIAR_SOLO_FRONTEND.bat
echo pause >> INICIAR_SOLO_FRONTEND.bat

echo @echo off > REINICIAR_SISTEMA.bat
echo title Reiniciando Sistema >> REINICIAR_SISTEMA.bat
echo color 0C >> REINICIAR_SISTEMA.bat
echo echo Deteniendo procesos Node.js... >> REINICIAR_SISTEMA.bat
echo taskkill /f /im node.exe 2^>nul >> REINICIAR_SISTEMA.bat
echo timeout /t 3 /nobreak ^>nul >> REINICIAR_SISTEMA.bat
echo echo Iniciando sistema... >> REINICIAR_SISTEMA.bat
echo npm start >> REINICIAR_SISTEMA.bat
echo pause >> REINICIAR_SISTEMA.bat

echo ✅ Scripts de inicio creados
echo.

:: Mostrar información del sistema
echo 📊 Información del Sistema:
echo    📁 Directorio: %CD%
echo    🖥️  Sistema Operativo: %OS%
echo    👤 Usuario: %USERNAME%
echo    📅 Fecha: %DATE%
echo    🕐 Hora: %TIME%
echo.

:: Mostrar puertos del sistema
echo 🌐 Puertos del Sistema:
echo    🎨 Frontend: http://localhost:3000
echo    🏢 Backend Alumbrado: http://localhost:5000
echo    🏛️  Backend Alcaldía: http://localhost:5002
echo    🌱 Backend Enviaseo: http://localhost:5001
echo.

:: Mostrar opciones de inicio
echo 🚀 Opciones de Inicio:
echo    1. INICIAR_SISTEMA.bat - Inicia todo el sistema completo
echo    2. INICIAR_SOLO_FRONTEND.bat - Solo frontend (modo demo)
echo    3. REINICIAR_SISTEMA.bat - Reinicia todo el sistema
echo.

echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                           ✅ INSTALACIÓN COMPLETADA ✅                      ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 El sistema está listo para usar
echo.
echo 📋 Próximos pasos:
echo    1. Ejecuta INICIAR_SISTEMA.bat para iniciar todo el sistema
echo    2. Abre http://localhost:3000 en tu navegador
echo    3. Selecciona el módulo que deseas usar
echo.
echo 💡 Consejos:
echo    - Si hay problemas con puertos, usa REINICIAR_SISTEMA.bat
echo    - Para demostraciones rápidas, usa INICIAR_SOLO_FRONTEND.bat
echo    - El sistema funciona mejor con Chrome o Edge
echo.

set /p choice="¿Deseas iniciar el sistema ahora? (s/n): "
if /i "%choice%"=="s" (
    echo.
    echo 🚀 Iniciando sistema...
    start INICIAR_SISTEMA.bat
) else (
    echo.
    echo 👋 Instalación completada. Ejecuta INICIAR_SISTEMA.bat cuando estés listo.
)

echo.
pause
