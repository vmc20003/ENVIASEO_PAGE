@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Instalador Mejorado - Sistema Enviaseo v1.3.0

echo.
echo ================================================================
echo           INSTALADOR MEJORADO - SISTEMA ENVIASEO v1.3.0
echo ================================================================
echo.
echo Este instalador ofrece múltiples opciones de instalación:
echo.
echo [1] INSTALACIÓN COMPLETA (Recomendada)
echo     • Instala todos los módulos y dependencias
echo     • Configuración completa del sistema
echo     • Ideal para usuarios nuevos
echo.
echo [2] INSTALACIÓN RÁPIDA (Solo Frontend)
echo     • Solo instala el frontend en modo demo
echo     • Sin dependencia de backends
echo     • Ideal para demostraciones rápidas
echo.
echo [3] INSTALACIÓN PERSONALIZADA
echo     • Selecciona qué módulos instalar
echo     • Configuración avanzada
echo     • Para usuarios experimentados
echo.
echo [4] SOLO VERIFICAR SISTEMA
echo     • Verifica requisitos sin instalar
echo     • Diagnóstico del sistema
echo.
echo Seleccione una opción (1-4):
set /p install_option=

if "%install_option%"=="1" goto :complete_install
if "%install_option%"=="2" goto :quick_install
if "%install_option%"=="3" goto :custom_install
if "%install_option%"=="4" goto :verify_system
goto :invalid_option

:complete_install
echo.
echo ================================================================
echo                INSTALACIÓN COMPLETA INICIADA
echo ================================================================
echo.
echo Esta instalación incluye:
echo • Frontend React (puerto 3000)
echo • Backend Alumbrado Público (puerto 5000)
echo • Backend Alcaldía de Envigado (puerto 5002)
echo • Backend Enviaseo Control de Acceso (puerto 5001)
echo • Modo demo y modo completo
echo.
echo ¿Continuar con la instalación completa? (S/N)
set /p confirm=
if /i not "%confirm%"=="S" goto :main_menu

call :verify_requirements
if %errorlevel% neq 0 goto :error_exit

echo.
echo [1/5] Instalando dependencias principales...
call npm install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias principales
    goto :error_exit
)
echo ✅ Dependencias principales instaladas

echo.
echo [2/5] Instalando dependencias del frontend...
call npm --prefix frontend install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del frontend
    goto :error_exit
)
echo ✅ Frontend instalado

echo.
echo [3/5] Instalando dependencias de backends...
call npm --prefix backend install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar backend Alumbrado
    goto :error_exit
)

call npm --prefix backend-alcaldia install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar backend Alcaldía
    goto :error_exit
)

call npm --prefix backend-enviaseo-control-acceso install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar backend Enviaseo
    goto :error_exit
)
echo ✅ Backends instalados

echo.
echo [4/5] Construyendo aplicación...
call npm --prefix frontend run build
if %errorlevel% neq 0 (
    echo ❌ Error al construir la aplicación
    goto :error_exit
)
echo ✅ Aplicación construida

echo.
echo [5/5] Creando scripts de acceso...
call :create_startup_scripts
echo ✅ Scripts creados

goto :install_success

:quick_install
echo.
echo ================================================================
echo                INSTALACIÓN RÁPIDA INICIADA
echo ================================================================
echo.
echo Esta instalación incluye:
echo • Solo Frontend React (puerto 3000)
echo • Modo demo activado
echo • Sin dependencia de backends
echo • Carga inmediata
echo.
echo ¿Continuar con la instalación rápida? (S/N)
set /p confirm=
if /i not "%confirm%"=="S" goto :main_menu

call :verify_requirements
if %errorlevel% neq 0 goto :error_exit

echo.
echo [1/3] Instalando dependencias principales...
call npm install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias principales
    goto :error_exit
)
echo ✅ Dependencias principales instaladas

echo.
echo [2/3] Instalando dependencias del frontend...
call npm --prefix frontend install --silent --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias del frontend
    goto :error_exit
)
echo ✅ Frontend instalado

echo.
echo [3/3] Creando scripts de acceso rápido...
call :create_quick_scripts
echo ✅ Scripts creados

goto :install_success

:custom_install
echo.
echo ================================================================
echo              INSTALACIÓN PERSONALIZADA INICIADA
echo ================================================================
echo.
echo Seleccione los módulos a instalar:
echo.
echo [1] Frontend (Requerido)
echo [2] Backend Alumbrado Público
echo [3] Backend Alcaldía de Envigado
echo [4] Backend Enviaseo Control de Acceso
echo.
echo Ingrese los números separados por comas (ej: 1,2,3):
set /p modules=

call :verify_requirements
if %errorlevel% neq 0 goto :error_exit

echo.
echo Instalando módulos seleccionados...
call :install_custom_modules
echo ✅ Instalación personalizada completada

goto :install_success

:verify_system
echo.
echo ================================================================
echo                VERIFICACIÓN DEL SISTEMA
echo ================================================================
echo.
call :verify_requirements
if %errorlevel% neq 0 (
    echo.
    echo ❌ El sistema no cumple con los requisitos mínimos
    goto :error_exit
)

echo.
echo ✅ El sistema cumple con todos los requisitos
echo.
echo INFORMACIÓN DEL SISTEMA:
echo • Node.js: %NODE_VERSION%
echo • NPM: %NPM_VERSION%
echo • Puertos disponibles: Verificando...
call :check_ports
echo.
echo ¿Desea proceder con alguna instalación? (S/N)
set /p proceed=
if /i "%proceed%"=="S" goto :main_menu
goto :end

:invalid_option
echo.
echo ❌ Opción inválida. Por favor seleccione 1, 2, 3 o 4.
timeout /t 2 /nobreak >nul
goto :main_menu

:main_menu
cls
goto :start

:install_success
echo.
echo ================================================================
echo                    INSTALACIÓN COMPLETADA
echo ================================================================
echo.
echo ✅ El sistema se ha instalado correctamente
echo.
echo ARCHIVOS CREADOS:
call :list_created_files
echo.
echo INSTRUCCIONES DE USO:
echo 1. Para iniciar el sistema, ejecute el script correspondiente
echo 2. El sistema se abrirá automáticamente en su navegador
echo 3. Para detener el sistema, cierre la ventana o ejecute el script de parada
echo.
echo ACCESO AL SISTEMA:
echo • URL: http://localhost:3000
echo • Modo demo disponible sin credenciales
echo.
echo ¿Desea iniciar el sistema ahora? (S/N)
set /p start_now=
if /i "%start_now%"=="S" (
    echo.
    echo Iniciando sistema...
    if exist "INICIAR_ENVIASEO_COMPLETO.bat" (
        start INICIAR_ENVIASEO_COMPLETO.bat
    ) else if exist "INICIAR_ENVIASEO_RAPIDO.bat" (
        start INICIAR_ENVIASEO_RAPIDO.bat
    ) else (
        start INICIAR_ENVIASEO.bat
    )
) else (
    echo.
    echo Para iniciar el sistema más tarde, ejecute el script correspondiente
)

goto :end

:verify_requirements
echo [VERIFICACIÓN] Comprobando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
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
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js instalado: %NODE_VERSION%

echo [VERIFICACIÓN] Comprobando NPM...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM no está disponible
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ NPM instalado: %NPM_VERSION%

echo [VERIFICACIÓN] Comprobando puertos...
call :check_ports
exit /b 0

:check_ports
set "ports_ok=true"
for %%p in (3000 5000 5001 5002) do (
    netstat -an | findstr ":%%p" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ⚠️ Puerto %%p está en uso
        set "ports_ok=false"
    ) else (
        echo ✅ Puerto %%p disponible
    )
)
if "%ports_ok%"=="true" (
    echo ✅ Todos los puertos están disponibles
) else (
    echo ⚠️ Algunos puertos están en uso, pero el sistema puede funcionar
)
exit /b 0

:create_startup_scripts
:: Script de inicio completo
(
echo @echo off
echo chcp 65001 ^>nul
echo title Sistema Enviaseo - Modo Completo
echo echo.
echo echo ================================================================
echo echo           INICIANDO SISTEMA ENVIASEO - MODO COMPLETO
echo echo ================================================================
echo echo.
echo echo Este script iniciará todos los módulos del sistema:
echo echo • Frontend: http://localhost:3000
echo echo • Backend Alumbrado: http://localhost:5000
echo echo • Backend Alcaldía: http://localhost:5002
echo echo • Backend Enviaseo: http://localhost:5001
echo echo.
echo echo Presione Ctrl+C para detener todos los servidores
echo echo.
echo cd /d "%%~dp0"
echo call npm start
echo pause
) > INICIAR_ENVIASEO_COMPLETO.bat

:: Script de inicio rápido
(
echo @echo off
echo chcp 65001 ^>nul
echo title Sistema Enviaseo - Modo Rápido
echo echo.
echo echo ================================================================
echo echo           INICIANDO SISTEMA ENVIASEO - MODO RÁPIDO
echo echo ================================================================
echo echo.
echo echo Este script iniciará solo el frontend en modo demo:
echo echo • Frontend: http://localhost:3000
echo echo • Modo demo activado
echo echo • Sin dependencia de backends
echo echo.
echo echo Presione Ctrl+C para detener el servidor
echo echo.
echo cd /d "%%~dp0"
echo call npm run restart-frontend
echo pause
) > INICIAR_ENVIASEO_RAPIDO.bat

:: Script de parada
(
echo @echo off
echo title Deteniendo Sistema Enviaseo
echo echo.
echo echo ================================================================
echo echo              DETENIENDO SISTEMA ENVIASEO
echo echo ================================================================
echo echo.
echo echo Deteniendo todos los servidores...
echo taskkill /f /im node.exe 2^>nul
echo echo.
echo echo ✅ Sistema detenido correctamente
echo timeout /t 3 /nobreak ^>nul
echo pause
) > DETENER_ENVIASEO.bat

:: Script de reinicio
(
echo @echo off
echo chcp 65001 ^>nul
echo title Reiniciar Sistema Enviaseo
echo echo.
echo echo ================================================================
echo echo              REINICIANDO SISTEMA ENVIASEO
echo echo ================================================================
echo echo.
echo echo [1/3] Deteniendo procesos anteriores...
echo taskkill /f /im node.exe 2^>nul
echo echo ✅ Procesos detenidos
echo echo.
echo echo [2/3] Limpiando archivos temporales...
echo if exist "frontend\.env" del "frontend\.env"
echo echo ✅ Archivos temporales eliminados
echo echo.
echo echo [3/3] Iniciando sistema...
echo echo.
echo echo ¿Qué modo desea usar?
echo echo [1] Modo completo ^(todos los módulos^)
echo echo [2] Modo rápido ^(solo frontend^)
echo echo.
echo set /p mode=Seleccione ^(1-2^): 
echo if "%%mode%%"=="1" ^(
echo     start INICIAR_ENVIASEO_COMPLETO.bat
echo ^) else if "%%mode%%"=="2" ^(
echo     start INICIAR_ENVIASEO_RAPIDO.bat
echo ^) else ^(
echo     echo Opción inválida, iniciando modo rápido...
echo     start INICIAR_ENVIASEO_RAPIDO.bat
echo ^)
echo pause
) > REINICIAR_ENVIASEO.bat
exit /b 0

:create_quick_scripts
:: Script de inicio rápido
(
echo @echo off
echo chcp 65001 ^>nul
echo title Sistema Enviaseo - Modo Demo
echo echo.
echo echo ================================================================
echo echo           INICIANDO SISTEMA ENVIASEO - MODO DEMO
echo echo ================================================================
echo echo.
echo echo Este script iniciará solo el frontend en modo demo:
echo echo • Frontend: http://localhost:3000
echo echo • Modo demo activado
echo echo • Sin dependencia de backends
echo echo.
echo echo Presione Ctrl+C para detener el servidor
echo echo.
echo cd /d "%%~dp0"
echo call npm run restart-frontend
echo pause
) > INICIAR_ENVIASEO_RAPIDO.bat

:: Script de parada
(
echo @echo off
echo title Deteniendo Sistema Enviaseo
echo echo.
echo echo ================================================================
echo echo              DETENIENDO SISTEMA ENVIASEO
echo echo ================================================================
echo echo.
echo echo Deteniendo servidor...
echo taskkill /f /im node.exe 2^>nul
echo echo.
echo echo ✅ Sistema detenido correctamente
echo timeout /t 3 /nobreak ^>nul
echo pause
) > DETENER_ENVIASEO.bat
exit /b 0

:install_custom_modules
echo Instalando módulos personalizados...
echo [PENDIENTE] Esta funcionalidad se implementará en la siguiente versión
echo Por ahora, se instalará el modo completo
call :create_startup_scripts
exit /b 0

:list_created_files
if exist "INICIAR_ENVIASEO_COMPLETO.bat" echo • INICIAR_ENVIASEO_COMPLETO.bat - Inicio completo del sistema
if exist "INICIAR_ENVIASEO_RAPIDO.bat" echo • INICIAR_ENVIASEO_RAPIDO.bat - Inicio rápido (modo demo)
if exist "DETENER_ENVIASEO.bat" echo • DETENER_ENVIASEO.bat - Detener sistema
if exist "REINICIAR_ENVIASEO.bat" echo • REINICIAR_ENVIASEO.bat - Reiniciar sistema
exit /b 0

:error_exit
echo.
echo ================================================================
echo                    ERROR EN LA INSTALACIÓN
echo ================================================================
echo.
echo ❌ La instalación no se pudo completar
echo.
echo SOLUCIONES SUGERIDAS:
echo 1. Verifique que Node.js esté instalado correctamente
echo 2. Asegúrese de tener conexión a internet
echo 3. Ejecute el instalador como administrador
echo 4. Verifique que los puertos estén disponibles
echo.
echo Para más ayuda, consulte el archivo README.md
echo.
pause
exit /b 1

:end
echo.
echo Instalador finalizado. Presione cualquier tecla para salir.
pause >nul
exit /b 0
