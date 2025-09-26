@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Sistema Enviaseo - Solo Frontend (Modo Demo)

echo.
echo ================================================================
echo           INICIANDO SOLO FRONTEND - MODO DEMO
echo ================================================================
echo.
echo Este script iniciará solo el frontend en modo demo.
echo Los módulos aparecerán inmediatamente con datos de ejemplo.
echo.
echo Acceso: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor.
echo.

:: Crear archivo .env para modo demo
cd frontend
(
echo REACT_APP_DEMO_MODE=true
echo REACT_APP_MOCK_API=true
echo GENERATE_SOURCEMAP=false
echo PORT=3000
) > .env

echo ✅ Modo demo configurado
echo ✅ Iniciando frontend...
echo.

:: Iniciar el frontend
call npm start

echo.
echo Frontend detenido.
cd ..
pause
