@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Instalador Rápido - Sistema Enviaseo v1.3.0

echo.
echo ================================================================
echo           INSTALADOR RÁPIDO - SISTEMA ENVIASEO v1.3.0
echo ================================================================
echo.
echo Este instalador realiza una instalación rápida y automática.
echo Ideal para usuarios experimentados o reinstalaciones.
echo.
echo OPCIONES DISPONIBLES:
echo [1] Instalación completa (todos los módulos)
echo [2] Solo frontend (modo demo)
echo [3] Instalación silenciosa (sin confirmaciones)
echo.
echo Seleccione una opción (1-3):
set /p option=

if "%option%"=="1" goto :complete_silent
if "%option%"=="2" goto :frontend_only
if "%option%"=="3" goto :silent_install
goto :invalid

:complete_silent
echo.
echo ================================================================
echo                INSTALACIÓN COMPLETA INICIADA
echo ================================================================
echo.
echo Instalando todos los módulos del sistema...
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo Descargue desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Instalando dependencias principales...
call npm install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error en dependencias principales
    pause
    exit /b 1
)
echo ✅ Dependencias principales

echo [2/4] Instalando frontend...
call npm --prefix frontend install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error en frontend
    pause
    exit /b 1
)
echo ✅ Frontend instalado

echo [3/4] Instalando backends...
call npm --prefix backend install --silent --no-audit --no-fund
call npm --prefix backend-alcaldia install --silent --no-audit --no-fund
call npm --prefix backend-enviaseo-control-acceso install --silent --no-audit --no-fund
echo ✅ Backends instalados

echo [4/4] Construyendo aplicación...
call npm --prefix frontend run build --silent
if %errorlevel% neq 0 (
    echo ❌ Error al construir
    pause
    exit /b 1
)
echo ✅ Aplicación construida

:: Crear scripts
call :create_scripts_complete
echo ✅ Scripts creados

goto :success

:frontend_only
echo.
echo ================================================================
echo                INSTALACIÓN SOLO FRONTEND
echo ================================================================
echo.
echo Instalando solo el frontend en modo demo...
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo Descargue desde: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/2] Instalando dependencias principales...
call npm install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error en dependencias principales
    pause
    exit /b 1
)
echo ✅ Dependencias principales

echo [2/2] Instalando frontend...
call npm --prefix frontend install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error en frontend
    pause
    exit /b 1
)
echo ✅ Frontend instalado

:: Crear scripts
call :create_scripts_frontend
echo ✅ Scripts creados

goto :success

:silent_install
echo.
echo ================================================================
echo                INSTALACIÓN SILENCIOSA INICIADA
echo ================================================================
echo.
echo Realizando instalación completa sin confirmaciones...
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    exit /b 1
)

echo [1/5] Dependencias principales...
call npm install --silent --no-audit --no-fund >nul 2>&1
if %errorlevel% neq 0 exit /b 1
echo ✅

echo [2/5] Frontend...
call npm --prefix frontend install --silent --no-audit --no-fund >nul 2>&1
if %errorlevel% neq 0 exit /b 1
echo ✅

echo [3/5] Backend Alumbrado...
call npm --prefix backend install --silent --no-audit --no-fund >nul 2>&1
if %errorlevel% neq 0 exit /b 1
echo ✅

echo [4/5] Backend Alcaldía...
call npm --prefix backend-alcaldia install --silent --no-audit --no-fund >nul 2>&1
if %errorlevel% neq 0 exit /b 1
echo ✅

echo [5/5] Backend Enviaseo...
call npm --prefix backend-enviaseo-control-acceso install --silent --no-audit --no-fund >nul 2>&1
if %errorlevel% neq 0 exit /b 1
echo ✅

:: Construir aplicación
call npm --prefix frontend run build --silent >nul 2>&1
if %errorlevel% neq 0 exit /b 1

:: Crear scripts
call :create_scripts_complete >nul 2>&1

echo.
echo ✅ INSTALACIÓN SILENCIOSA COMPLETADA
echo.
echo Scripts creados:
echo • INICIAR_ENVIASEO_COMPLETO.bat
echo • DETENER_ENVIASEO.bat
echo • REINICIAR_ENVIASEO.bat
echo.
echo Para iniciar: INICIAR_ENVIASEO_COMPLETO.bat
echo.
exit /b 0

:create_scripts_complete
:: Script de inicio completo
(
echo @echo off
echo chcp 65001 ^>nul
echo title Sistema Enviaseo - Modo Completo
echo echo Iniciando Sistema Enviaseo - Modo Completo...
echo echo Frontend: http://localhost:3000
echo echo Backends: 5000, 5001, 5002
echo echo.
echo cd /d "%%~dp0"
echo call npm start
echo pause
) > INICIAR_ENVIASEO_COMPLETO.bat

:: Script de parada
(
echo @echo off
echo title Deteniendo Sistema Enviaseo
echo echo Deteniendo servidores...
echo taskkill /f /im node.exe 2^>nul
echo echo Sistema detenido.
echo timeout /t 2 /nobreak ^>nul
) > DETENER_ENVIASEO.bat

:: Script de reinicio
(
echo @echo off
echo chcp 65001 ^>nul
echo title Reiniciar Sistema Enviaseo
echo echo Reiniciando sistema...
echo taskkill /f /im node.exe 2^>nul
echo timeout /t 2 /nobreak ^>nul
echo echo Iniciando...
echo cd /d "%%~dp0"
echo start INICIAR_ENVIASEO_COMPLETO.bat
) > REINICIAR_ENVIASEO.bat
exit /b 0

:create_scripts_frontend
:: Script de inicio frontend
(
echo @echo off
echo chcp 65001 ^>nul
echo title Sistema Enviaseo - Modo Demo
echo echo Iniciando Sistema Enviaseo - Modo Demo...
echo echo Frontend: http://localhost:3000
echo echo Modo demo activado
echo echo.
echo cd /d "%%~dp0"
echo call npm run restart-frontend
echo pause
) > INICIAR_ENVIASEO_RAPIDO.bat

:: Script de parada
(
echo @echo off
echo title Deteniendo Sistema Enviaseo
echo echo Deteniendo servidor...
echo taskkill /f /im node.exe 2^>nul
echo echo Sistema detenido.
echo timeout /t 2 /nobreak ^>nul
) > DETENER_ENVIASEO.bat
exit /b 0

:success
echo.
echo ================================================================
echo                    INSTALACIÓN COMPLETADA
echo ================================================================
echo.
echo ✅ El sistema se ha instalado correctamente
echo.
echo ARCHIVOS CREADOS:
if exist "INICIAR_ENVIASEO_COMPLETO.bat" echo • INICIAR_ENVIASEO_COMPLETO.bat - Inicio completo
if exist "INICIAR_ENVIASEO_RAPIDO.bat" echo • INICIAR_ENVIASEO_RAPIDO.bat - Inicio rápido
if exist "DETENER_ENVIASEO.bat" echo • DETENER_ENVIASEO.bat - Detener sistema
if exist "REINICIAR_ENVIASEO.bat" echo • REINICIAR_ENVIASEO.bat - Reiniciar sistema
echo.
echo ACCESO: http://localhost:3000
echo.
echo ¿Iniciar sistema ahora? (S/N)
set /p start=
if /i "%start%"=="S" (
    if exist "INICIAR_ENVIASEO_COMPLETO.bat" (
        start INICIAR_ENVIASEO_COMPLETO.bat
    ) else if exist "INICIAR_ENVIASEO_RAPIDO.bat" (
        start INICIAR_ENVIASEO_RAPIDO.bat
    )
)
echo.
echo Instalación completada.
pause
exit /b 0

:invalid
echo.
echo ❌ Opción inválida. Seleccione 1, 2 o 3.
timeout /t 2 /nobreak >nul
goto :start

:start
cls
goto :begin

:begin
echo.
echo ================================================================
echo           INSTALADOR RÁPIDO - SISTEMA ENVIASEO v1.3.0
echo ================================================================
echo.
echo Este instalador realiza una instalación rápida y automática.
echo Ideal para usuarios experimentados o reinstalaciones.
echo.
echo OPCIONES DISPONIBLES:
echo [1] Instalación completa (todos los módulos)
echo [2] Solo frontend (modo demo)
echo [3] Instalación silenciosa (sin confirmaciones)
echo.
echo Seleccione una opción (1-3):
set /p option=

if "%option%"=="1" goto :complete_silent
if "%option%"=="2" goto :frontend_only
if "%option%"=="3" goto :silent_install
goto :invalid
