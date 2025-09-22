@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo    SISTEMA DE GESTION DE ASISTENCIA
echo    Instalacion Automatica de Dependencias
echo    Enviaseo E.S.P.
echo ===============================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor, instala Node.js desde: https://nodejs.org/
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo Node.js detectado: 
node --version
echo.

echo Verificando NPM...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: NPM no esta disponible
    echo Por favor, reinstala Node.js desde: https://nodejs.org/
    echo.
    echo Presiona cualquier tecla para salir...
    pause >nul
    exit /b 1
)

echo NPM detectado:
npm --version
echo.

echo ===============================================
echo    INSTALANDO DEPENDENCIAS AUTOMATICAMENTE
echo ===============================================
echo.

set "error_count=0"

echo [1/4] Instalando dependencias del Frontend...
cd /d "%~dp0..\frontend"
if exist "package.json" (
    call npm install --silent --no-audit --no-fund
    if !errorlevel! neq 0 (
        echo ERROR: Fallo la instalacion del frontend
        set /a error_count+=1
    ) else (
        echo ✓ Frontend instalado correctamente
    )
) else (
    echo ADVERTENCIA: No se encontro package.json en frontend
)

echo.
echo [2/4] Instalando dependencias del Backend Alumbrado...
cd /d "%~dp0..\backend"
if exist "package.json" (
    call npm install --silent --no-audit --no-fund
    if !errorlevel! neq 0 (
        echo ERROR: Fallo la instalacion del backend
        set /a error_count+=1
    ) else (
        echo ✓ Backend Alumbrado instalado correctamente
    )
) else (
    echo ADVERTENCIA: No se encontro package.json en backend
)

echo.
echo [3/4] Instalando dependencias del Backend Alcaldia...
cd /d "%~dp0..\backend-alcaldia"
if exist "package.json" (
    call npm install --silent --no-audit --no-fund
    if !errorlevel! neq 0 (
        echo ERROR: Fallo la instalacion del backend-alcaldia
        set /a error_count+=1
    ) else (
        echo ✓ Backend Alcaldia instalado correctamente
    )
) else (
    echo ADVERTENCIA: No se encontro package.json en backend-alcaldia
)

echo.
echo [4/4] Instalando dependencias del Backend Enviaseo...
cd /d "%~dp0..\backend-enviaseo-control-acceso"
if exist "package.json" (
    call npm install --silent --no-audit --no-fund
    if !errorlevel! neq 0 (
        echo ERROR: Fallo la instalacion del backend-enviaseo
        set /a error_count+=1
    ) else (
        echo ✓ Backend Enviaseo instalado correctamente
    )
) else (
    echo ADVERTENCIA: No se encontro package.json en backend-enviaseo-control-acceso
)

echo.
echo ===============================================
if %error_count% equ 0 (
    echo    INSTALACION COMPLETADA EXITOSAMENTE
    echo ===============================================
    echo.
    echo ✓ Todas las dependencias se instalaron correctamente
    echo.
    echo La aplicacion esta lista para usar.
    echo.
    echo Para iniciar la aplicacion:
    echo   1. Ejecuta SistemaGestionAsistencia.exe
    echo   2. O usa el acceso directo creado
    echo.
    echo La aplicacion estara disponible en:
    echo   - Frontend: http://localhost:3000
    echo   - Backend Alumbrado: http://localhost:4000
    echo   - Backend Alcaldia: http://localhost:4002
    echo   - Backend Enviaseo: http://localhost:4001
    echo.
    exit /b 0
) else (
    echo    INSTALACION COMPLETADA CON ERRORES
    echo ===============================================
    echo.
    echo ⚠ Se encontraron %error_count% errores durante la instalacion
    echo.
    echo Por favor, verifica que:
    echo   - Node.js este instalado correctamente
    echo   - Tengas conexion a internet
    echo   - Los archivos package.json existan
    echo.
    echo Puedes intentar ejecutar este script nuevamente.
    echo.
    exit /b 1
)

echo.
echo Presiona cualquier tecla para continuar...
pause >nul





