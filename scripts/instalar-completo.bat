@echo off
echo ========================================
echo    SISTEMA DE GESTION DE ASISTENCIA
echo    Instalacion Completa
echo ========================================
echo.

echo [1/5] Instalando dependencias del proyecto principal...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias principales
    pause
    exit /b 1
)

echo.
echo [2/5] Instalando dependencias del frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del frontend
    pause
    exit /b 1
)
cd ..

echo.
echo [3/5] Instalando dependencias del backend Alumbrado Publico...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del backend Alumbrado
    pause
    exit /b 1
)
cd ..

echo.
echo [4/5] Instalando dependencias del backend Alcaldia...
cd backend-alcaldia
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del backend Alcaldia
    pause
    exit /b 1
)
cd ..

echo.
echo [5/5] Instalando dependencias del backend Enviaseo...
cd backend-enviaseo-control-acceso
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Fallo al instalar dependencias del backend Enviaseo
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    INSTALACION COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo Para iniciar la aplicacion, ejecuta:
echo   npm start
echo.
echo O ejecuta el script: iniciar-aplicacion.bat
echo.
pause

