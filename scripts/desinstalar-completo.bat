@echo off
echo ===============================================
echo    SISTEMA DE GESTION DE ASISTENCIA
echo    Desinstalacion Completa - Enviaseo E.S.P.
echo ===============================================
echo.

set /p confirm="¿Estás seguro de que quieres desinstalar completamente el sistema? (S/N): "
if /i "%confirm%" neq "S" (
    echo Desinstalacion cancelada.
    echo.
    pause
    exit /b 0
)

echo.
echo Desinstalando Sistema de Gestion de Asistencia...
echo.

echo [1/4] Deteniendo procesos activos...
taskkill /f /im "SistemaGestionAsistencia.exe" >nul 2>&1
taskkill /f /im "node.exe" >nul 2>&1
echo ✓ Procesos detenidos

echo.
echo [2/4] Eliminando dependencias del Frontend...
if exist "frontend\node_modules" (
    rmdir /s /q "frontend\node_modules"
    echo ✓ Frontend desinstalado
) else (
    echo - Frontend ya estaba desinstalado
)

echo.
echo [3/4] Eliminando dependencias del Backend Alumbrado...
if exist "backend\node_modules" (
    rmdir /s /q "backend\node_modules"
    echo ✓ Backend Alumbrado desinstalado
) else (
    echo - Backend Alumbrado ya estaba desinstalado
)

echo.
echo [4/4] Eliminando dependencias del Backend Alcaldia...
if exist "backend-alcaldia\node_modules" (
    rmdir /s /q "backend-alcaldia\node_modules"
    echo ✓ Backend Alcaldia desinstalado
) else (
    echo - Backend Alcaldia ya estaba desinstalado
)

echo.
echo [5/5] Eliminando dependencias del Backend Enviaseo...
if exist "backend-enviaseo-control-acceso\node_modules" (
    rmdir /s /q "backend-enviaseo-control-acceso\node_modules"
    echo ✓ Backend Enviaseo desinstalado
) else (
    echo - Backend Enviaseo ya estaba desinstalado
)

echo.
echo ===============================================
echo    DESINSTALACION COMPLETADA EXITOSAMENTE
echo ===============================================
echo.
echo ✓ Sistema desinstalado correctamente
echo.
echo Los siguientes elementos fueron eliminados:
echo   - Dependencias de Node.js (node_modules)
echo   - Procesos activos de la aplicacion
echo.
echo NOTA: Los archivos de la aplicacion seran eliminados
echo       por el desinstalador de Windows.
echo.
echo Gracias por usar el Sistema de Gestion de Asistencia.
echo.
pause





