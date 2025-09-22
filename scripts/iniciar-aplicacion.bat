@echo off
echo ===============================================
echo    SISTEMA DE GESTION DE ASISTENCIA
echo    Iniciando Aplicacion - Enviaseo E.S.P.
echo ===============================================
echo.

echo Verificando que la aplicacion este instalada...
if not exist "SistemaGestionAsistencia.exe" (
    echo ERROR: No se encontro SistemaGestionAsistencia.exe
    echo Por favor, ejecuta primero el instalador.
    echo.
    pause
    exit /b 1
)

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor, instala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo Iniciando Sistema de Gestion de Asistencia...
echo.
echo La aplicacion se abrira en una nueva ventana.
echo.
echo Una vez iniciada, estara disponible en:
echo   - Frontend Principal: http://localhost:3000
echo   - Backend Alumbrado: http://localhost:4000
echo   - Backend Alcaldia: http://localhost:4002
echo   - Backend Enviaseo: http://localhost:4001
echo.

start "" "SistemaGestionAsistencia.exe"

echo Aplicacion iniciada. Puedes cerrar esta ventana.
echo.
pause





