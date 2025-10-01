@echo off
chcp 65001 >nul
title Instalador Rápido - Sistema de Gestión de Asistencia
color 0B

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    ⚡ INSTALADOR RÁPIDO ⚡                                  ║
echo ║                    Sistema de Gestión de Asistencia v1.3.0                  ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🚀 Instalación rápida para usuarios experimentados
echo    Este instalador asume que tienes Node.js instalado
echo.

:: Verificación rápida de Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo    Ejecuta INSTALADOR_COMPLETO.bat para una instalación completa
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

:: Limpieza rápida
echo 🧹 Limpieza rápida...
if exist "node_modules" rmdir /s /q "node_modules" 2>nul
if exist "frontend\node_modules" rmdir /s /q "frontend\node_modules" 2>nul
if exist "backend\node_modules" rmdir /s /q "backend\node_modules" 2>nul
if exist "backend-alcaldia\node_modules" rmdir /s /q "backend-alcaldia\node_modules" 2>nul
if exist "backend-enviaseo-control-acceso\node_modules" rmdir /s /q "backend-enviaseo-control-acceso\node_modules" 2>nul

:: Instalación en paralelo (simulada)
echo 📦 Instalando dependencias...
echo    ⏳ Proyecto principal...
call npm install --silent
echo    ⏳ Frontend...
cd frontend && call npm install --silent && cd ..
echo    ⏳ Backend principal...
cd backend && call npm install --silent && cd ..
echo    ⏳ Backend alcaldía...
cd backend-alcaldia && call npm install --silent && cd ..
echo    ⏳ Backend enviaseo...
cd backend-enviaseo-control-acceso && call npm install --silent && cd ..

:: Crear carpetas
if not exist "backend\uploads_excel" mkdir "backend\uploads_excel"
if not exist "backend-alcaldia\uploads_excel" mkdir "backend-alcaldia\uploads_excel"
if not exist "backend-enviaseo-control-acceso\uploads_excel" mkdir "backend-enviaseo-control-acceso\uploads_excel"

echo ✅ Instalación completada
echo.

:: Crear script de inicio rápido
echo @echo off > INICIAR_RAPIDO.bat
echo title Sistema de Gestión de Asistencia >> INICIAR_RAPIDO.bat
echo color 0A >> INICIAR_RAPIDO.bat
echo echo 🚀 Iniciando sistema... >> INICIAR_RAPIDO.bat
echo npm start >> INICIAR_RAPIDO.bat

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        ✅ INSTALACIÓN RÁPIDA COMPLETADA ✅                   ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Acceso: http://localhost:3000
echo 🚀 Inicio: INICIAR_RAPIDO.bat
echo.

set /p choice="¿Iniciar ahora? (s/n): "
if /i "%choice%"=="s" (
    echo 🚀 Iniciando...
    start INICIAR_RAPIDO.bat
) else (
    echo 👋 Listo. Ejecuta INICIAR_RAPIDO.bat cuando quieras iniciar.
)

echo.
pause