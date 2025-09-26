@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Diagnóstico del Sistema - Enviaseo v1.3.0

echo.
echo ================================================================
echo              DIAGNÓSTICO DEL SISTEMA ENVIASEO v1.3.0
echo ================================================================
echo.
echo Este script verifica el estado del sistema y detecta problemas.
echo.

:: Verificar Node.js
echo [VERIFICACIÓN] Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js NO está instalado
    set "node_ok=false"
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js instalado: %NODE_VERSION%
    set "node_ok=true"
)

:: Verificar NPM
echo [VERIFICACIÓN] NPM...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM NO está disponible
    set "npm_ok=false"
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ NPM instalado: %NPM_VERSION%
    set "npm_ok=true"
)

:: Verificar puertos
echo.
echo [VERIFICACIÓN] Puertos del sistema...
set "ports_available=true"
for %%p in (3000 5000 5001 5002) do (
    netstat -an | findstr ":%%p" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠️ Puerto %%p está en uso
        set "ports_available=false"
    ) else (
        echo ✅ Puerto %%p disponible
    )
)

:: Verificar archivos del proyecto
echo.
echo [VERIFICACIÓN] Archivos del proyecto...
if exist "package.json" (
    echo ✅ package.json encontrado
) else (
    echo ❌ package.json NO encontrado
    set "project_ok=false"
)

if exist "frontend\package.json" (
    echo ✅ Frontend encontrado
) else (
    echo ❌ Frontend NO encontrado
    set "project_ok=false"
)

if exist "backend\package.json" (
    echo ✅ Backend Alumbrado encontrado
) else (
    echo ❌ Backend Alumbrado NO encontrado
    set "project_ok=false"
)

if exist "backend-alcaldia\package.json" (
    echo ✅ Backend Alcaldía encontrado
) else (
    echo ❌ Backend Alcaldía NO encontrado
    set "project_ok=false"
)

if exist "backend-enviaseo-control-acceso\package.json" (
    echo ✅ Backend Enviaseo encontrado
) else (
    echo ❌ Backend Enviaseo NO encontrado
    set "project_ok=false"
)

:: Verificar dependencias instaladas
echo.
echo [VERIFICACIÓN] Dependencias instaladas...
if exist "node_modules" (
    echo ✅ Dependencias principales instaladas
) else (
    echo ❌ Dependencias principales NO instaladas
    set "deps_ok=false"
)

if exist "frontend\node_modules" (
    echo ✅ Dependencias del frontend instaladas
) else (
    echo ❌ Dependencias del frontend NO instaladas
    set "deps_ok=false"
)

if exist "backend\node_modules" (
    echo ✅ Dependencias del backend Alumbrado instaladas
) else (
    echo ❌ Dependencias del backend Alumbrado NO instaladas
    set "deps_ok=false"
)

if exist "backend-alcaldia\node_modules" (
    echo ✅ Dependencias del backend Alcaldía instaladas
) else (
    echo ❌ Dependencias del backend Alcaldía NO instaladas
    set "deps_ok=false"
)

if exist "backend-enviaseo-control-acceso\node_modules" (
    echo ✅ Dependencias del backend Enviaseo instaladas
) else (
    echo ❌ Dependencias del backend Enviaseo NO instaladas
    set "deps_ok=false"
)

:: Verificar scripts de inicio
echo.
echo [VERIFICACIÓN] Scripts de inicio...
if exist "INICIAR_ENVIASEO_COMPLETO.bat" (
    echo ✅ Script de inicio completo encontrado
) else (
    echo ❌ Script de inicio completo NO encontrado
)

if exist "INICIAR_ENVIASEO_RAPIDO.bat" (
    echo ✅ Script de inicio rápido encontrado
) else (
    echo ❌ Script de inicio rápido NO encontrado
)

if exist "DETENER_ENVIASEO.bat" (
    echo ✅ Script de parada encontrado
) else (
    echo ❌ Script de parada NO encontrado
)

if exist "REINICIAR_ENVIASEO.bat" (
    echo ✅ Script de reinicio encontrado
) else (
    echo ❌ Script de reinicio NO encontrado
)

:: Verificar procesos Node.js en ejecución
echo.
echo [VERIFICACIÓN] Procesos Node.js en ejecución...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe" >NUL
if %errorlevel% equ 0 (
    echo ⚠️ Hay procesos de Node.js ejecutándose:
    tasklist /FI "IMAGENAME eq node.exe" /FO TABLE
) else (
    echo ✅ No hay procesos de Node.js ejecutándose
)

:: Resumen del diagnóstico
echo.
echo ================================================================
echo                    RESUMEN DEL DIAGNÓSTICO
echo ================================================================
echo.

if "%node_ok%"=="true" (
    echo ✅ Node.js: OK
) else (
    echo ❌ Node.js: PROBLEMA - Instalar desde https://nodejs.org/
)

if "%npm_ok%"=="true" (
    echo ✅ NPM: OK
) else (
    echo ❌ NPM: PROBLEMA - Reinstalar Node.js
)

if "%ports_available%"=="true" (
    echo ✅ Puertos: OK
) else (
    echo ⚠️ Puertos: ALGUNOS EN USO - El sistema puede funcionar
)

if exist "package.json" (
    echo ✅ Proyecto: OK
) else (
    echo ❌ Proyecto: PROBLEMA - Archivos del proyecto faltantes
)

if exist "node_modules" (
    echo ✅ Dependencias: OK
) else (
    echo ❌ Dependencias: PROBLEMA - Ejecutar instalador
)

echo.
echo ================================================================
echo                    RECOMENDACIONES
echo ================================================================
echo.

if "%node_ok%"=="false" (
    echo 🔧 INSTALAR NODE.JS:
    echo    1. Vaya a https://nodejs.org/
    echo    2. Descargue la versión LTS
    echo    3. Ejecute el instalador
    echo    4. Reinicie el sistema
    echo.
)

if not exist "node_modules" (
    echo 🔧 INSTALAR DEPENDENCIAS:
    echo    1. Ejecute INSTALADOR_MEJORADO.bat
    echo    2. O ejecute INSTALADOR_RAPIDO.bat
    echo    3. O ejecute npm install manualmente
    echo.
)

if not exist "INICIAR_ENVIASEO_COMPLETO.bat" (
    echo 🔧 CREAR SCRIPTS DE INICIO:
    echo    1. Ejecute el instalador
    echo    2. O copie los scripts desde la distribución
    echo.
)

echo 🔧 SOLUCIÓN RÁPIDA:
echo    Si todo está OK, ejecute: INICIAR_ENVIASEO_COMPLETO.bat
echo    Si hay problemas, ejecute: INSTALADOR_MEJORADO.bat
echo.

echo ¿Desea ejecutar alguna acción automática? (S/N)
set /p auto_fix=
if /i "%auto_fix%"=="S" (
    echo.
    echo [1] Ejecutar instalador mejorado
    echo [2] Ejecutar instalador rápido
    echo [3] Solo instalar dependencias
    echo [4] Detener procesos Node.js
    echo.
    set /p action=Seleccione (1-4): 
    
    if "%action%"=="1" (
        echo Ejecutando instalador mejorado...
        start INSTALADOR_MEJORADO.bat
    ) else if "%action%"=="2" (
        echo Ejecutando instalador rápido...
        start INSTALADOR_RAPIDO.bat
    ) else if "%action%"=="3" (
        echo Instalando dependencias...
        call npm install
        call npm --prefix frontend install
        call npm --prefix backend install
        call npm --prefix backend-alcaldia install
        call npm --prefix backend-enviaseo-control-acceso install
        echo ✅ Dependencias instaladas
    ) else if "%action%"=="4" (
        echo Deteniendo procesos Node.js...
        taskkill /f /im node.exe 2>nul
        echo ✅ Procesos detenidos
    ) else (
        echo Opción inválida
    )
)

echo.
echo Diagnóstico completado.
pause
exit /b 0
