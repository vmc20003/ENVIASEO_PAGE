@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Instalador Sistema Enviaseo - Usuario Final

echo.
echo ================================================================
echo           INSTALADOR SISTEMA DE GESTIÓN ENVIASEO
echo ================================================================
echo.
echo Este instalador configurará el sistema en esta computadora.
echo.
echo REQUISITOS:
echo • Node.js (se verificará automáticamente)
echo • Conexión a internet (para descargar dependencias)
echo • Puertos 3000, 5000, 5001, 5002 disponibles
echo.
echo NOTA: Este es el instalador básico. Para más opciones use:
echo • INSTALADOR_MEJORADO.bat - Instalación con opciones avanzadas
echo • INSTALADOR_RAPIDO.bat - Instalación rápida para expertos
echo • DIAGNOSTICO_SISTEMA.bat - Verificar estado del sistema
echo.
echo ¿Desea continuar con la instalación? (S/N)
set /p choice=
if /i not "%choice%"=="S" (
    echo Instalación cancelada.
    pause
    exit /b 0
)

echo.
echo [1/4] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Node.js no está instalado
    echo.
    echo Para instalar Node.js:
    echo 1. Vaya a https://nodejs.org/
    echo 2. Descargue la versión LTS (recomendada)
    echo 3. Ejecute el instalador
    echo 4. Reinicie esta ventana y ejecute nuevamente
    echo.
    echo ¿Desea abrir la página de descarga ahora? (S/N)
    set /p download_choice=
    if /i "%download_choice%"=="S" (
        start https://nodejs.org/
    )
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js instalado: %NODE_VERSION%

echo.
echo [2/4] Instalando dependencias del sistema...
echo Esto puede tomar varios minutos...

call npm install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias principales
    pause
    exit /b 1
)

call npm --prefix frontend install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del frontend
    pause
    exit /b 1
)

call npm --prefix backend install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del backend principal
    pause
    exit /b 1
)

call npm --prefix backend-alcaldia install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del backend alcaldía
    pause
    exit /b 1
)

call npm --prefix backend-enviaseo-control-acceso install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del backend enviaseo
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas exitosamente

echo.
echo [3/4] Construyendo aplicación...
call npm --prefix frontend run build
if %errorlevel% neq 0 (
    echo ❌ Error al construir la aplicación
    pause
    exit /b 1
)
echo ✅ Aplicación construida exitosamente

echo.
echo [4/4] Creando accesos directos...

:: Crear script de inicio simple
(
echo @echo off
echo title Sistema Enviaseo
echo echo Iniciando Sistema de Gestión Enviaseo...
echo echo.
echo echo El sistema se abrirá automáticamente en el navegador
echo echo Presione Ctrl+C para detener todos los servidores
echo echo.
echo cd /d "%%~dp0"
echo call npm start
echo pause
) > INICIAR_ENVIASEO.bat

:: Crear script de parada
(
echo @echo off
echo title Deteniendo Sistema Enviaseo
echo echo Deteniendo servidores...
echo taskkill /f /im node.exe 2^>nul
echo echo Sistema detenido.
echo timeout /t 2 /nobreak ^>nul
) > DETENER_ENVIASEO.bat

echo ✅ Accesos directos creados

echo.
echo ================================================================
echo                    INSTALACIÓN COMPLETADA
echo ================================================================
echo.
echo ✅ El sistema se ha instalado correctamente
echo.
echo ARCHIVOS CREADOS:
echo • INICIAR_ENVIASEO.bat - Para iniciar el sistema
echo • DETENER_ENVIASEO.bat - Para detener el sistema
echo.
echo INSTRUCCIONES DE USO:
echo 1. Haga doble clic en "INICIAR_ENVIASEO.bat"
echo 2. El sistema se abrirá automáticamente en su navegador
echo 3. Para detener el sistema, cierre la ventana o ejecute "DETENER_ENVIASEO.bat"
echo.
echo ACCESO AL SISTEMA:
echo • URL: http://localhost:3000
echo • No requiere credenciales para el modo de demostración
echo.
echo ¿Desea iniciar el sistema ahora? (S/N)
set /p start_now=
if /i "%start_now%"=="S" (
    echo.
    echo Iniciando sistema...
    start INICIAR_ENVIASEO.bat
) else (
    echo.
    echo Para iniciar el sistema más tarde, ejecute: INICIAR_ENVIASEO.bat
)

echo.
echo Instalación completada. Presione cualquier tecla para salir.
pause >nul
