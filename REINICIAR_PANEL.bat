@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Reiniciar Panel - Sistema Enviaseo

echo.
echo ================================================================
echo              REINICIANDO PANEL - SISTEMA ENVIASEO
echo ================================================================
echo.

echo [1/4] Deteniendo procesos anteriores...
:: Intentar cerrar procesos de Node.js
taskkill /F /IM node.exe /T >nul 2>&1
echo ✅ Procesos detenidos

echo.
echo [2/4] Limpiando archivos temporales...
:: Eliminar archivo .env si existe
if exist "frontend\.env" (
    del "frontend\.env" >nul 2>&1
    echo ✅ Archivo .env eliminado
)

echo.
echo [3/4] Configurando modo demo...
cd frontend
:: Crear archivo .env para modo demo
(
echo REACT_APP_DEMO_MODE=true
echo REACT_APP_MOCK_API=true
echo GENERATE_SOURCEMAP=false
echo PORT=3000
echo BROWSER=none
) > .env
echo ✅ Modo demo configurado

echo.
echo [4/4] Iniciando panel...
echo.
echo ================================================================
echo                    PANEL INICIANDO
echo ================================================================
echo.
echo 🌐 Acceso: http://localhost:3000
echo 🎭 Modo: Demo (sin backends)
echo ⚡ Los módulos aparecerán inmediatamente
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

:: Iniciar el frontend
call npm start

echo.
echo Panel detenido.
cd ..
pause
