@echo off
chcp 65001 >nul
title Limpiar Proyecto - Sistema de Gestión de Asistencia
color 0C

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        🧹 LIMPIEZA DEL PROYECTO 🧹                         ║
echo ║                    Sistema de Gestión de Asistencia v1.4.0                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo ⚠️  ADVERTENCIA: Este script eliminará archivos innecesarios del proyecto
echo    Solo se mantendrán los archivos esenciales para el funcionamiento.
echo.

set /p CONFIRM="¿Estás seguro de que quieres continuar? (s/n): "
if /i not "%CONFIRM%"=="s" (
    echo ❌ Limpieza cancelada
    pause
    exit /b 1
)

echo.
echo 🧹 Iniciando limpieza del proyecto...
echo.

echo 📁 Eliminando carpetas de node_modules...
if exist "node_modules" (
    echo   Eliminando node_modules principal...
    rmdir /s /q "node_modules"
)

if exist "frontend\node_modules" (
    echo   Eliminando node_modules del frontend...
    rmdir /s /q "frontend\node_modules"
)

if exist "backend\node_modules" (
    echo   Eliminando node_modules del backend...
    rmdir /s /q "backend\node_modules"
)

if exist "backend-alcaldia\node_modules" (
    echo   Eliminando node_modules del backend-alcaldia...
    rmdir /s /q "backend-alcaldia\node_modules"
)

if exist "backend-enviaseo-control-acceso\node_modules" (
    echo   Eliminando node_modules del backend-enviaseo...
    rmdir /s /q "backend-enviaseo-control-acceso\node_modules"
)

if exist "app-electron\node_modules" (
    echo   Eliminando node_modules del app-electron...
    rmdir /s /q "app-electron\node_modules"
)

echo.
echo 📄 Eliminando archivos de lock...
if exist "package-lock.json" del "package-lock.json"
if exist "frontend\package-lock.json" del "frontend\package-lock.json"
if exist "backend\package-lock.json" del "backend\package-lock.json"
if exist "backend-alcaldia\package-lock.json" del "backend-alcaldia\package-lock.json"
if exist "backend-enviaseo-control-acceso\package-lock.json" del "backend-enviaseo-control-acceso\package-lock.json"
if exist "app-electron\package-lock.json" del "app-electron\package-lock.json"

echo.
echo 📁 Eliminando carpetas de build...
if exist "frontend\build" rmdir /s /q "frontend\build"
if exist "frontend\dist" rmdir /s /q "frontend\dist"

echo.
echo 📄 Eliminando archivos temporales...
if exist "*.log" del "*.log"
if exist "frontend\*.log" del "frontend\*.log"
if exist "backend\*.log" del "backend\*.log"
if exist "backend-alcaldia\*.log" del "backend-alcaldia\*.log"
if exist "backend-enviaseo-control-acceso\*.log" del "backend-enviaseo-control-acceso\*.log"

echo.
echo 📁 Eliminando carpetas de uploads (mantener estructura)...
if exist "backend\uploads_excel\*.xlsx" del "backend\uploads_excel\*.xlsx"
if exist "backend\uploads_excel\*.xls" del "backend\uploads_excel\*.xls"
if exist "backend-alcaldia\uploads_excel\*.xlsx" del "backend-alcaldia\uploads_excel\*.xlsx"
if exist "backend-alcaldia\uploads_excel\*.xls" del "backend-alcaldia\uploads_excel\*.xls"
if exist "backend-enviaseo-control-acceso\uploads_excel\*.xlsx" del "backend-enviaseo-control-acceso\uploads_excel\*.xlsx"
if exist "backend-enviaseo-control-acceso\uploads_excel\*.xls" del "backend-enviaseo-control-acceso\uploads_excel\*.xls"

echo.
echo 📄 Eliminando archivos de base de datos temporales...
if exist "backend\uploads_excel\database.json" del "backend\uploads_excel\database.json"
if exist "backend-alcaldia\uploads_excel\database.json" del "backend-alcaldia\uploads_excel\database.json"
if exist "backend-enviaseo-control-acceso\uploads_excel\database.json" del "backend-enviaseo-control-acceso\uploads_excel\database.json"

echo.
echo 📁 Eliminando carpetas de distribución antiguas...
if exist "Sistema_Gestion_Asistencia_v1.3.0" rmdir /s /q "Sistema_Gestion_Asistencia_v1.3.0"
if exist "Sistema_Gestion_Asistencia_Ligero_v1.3.0" rmdir /s /q "Sistema_Gestion_Asistencia_Ligero_v1.3.0"
if exist "Sistema_Gestion_Asistencia_Sin_Dependencias_v1.3.0" rmdir /s /q "Sistema_Gestion_Asistencia_Sin_Dependencias_v1.3.0"
if exist "Instalador_Ejecutable_v1.3.0" rmdir /s /q "Instalador_Ejecutable_v1.3.0"

echo.
echo 📄 Eliminando archivos de scripts antiguos...
if exist "CREAR_APP_SIN_DEPENDENCIAS.bat" del "CREAR_APP_SIN_DEPENDENCIAS.bat"
if exist "CREAR_INSTALADOR_EJECUTABLE.bat" del "CREAR_INSTALADOR_EJECUTABLE.bat"
if exist "CREAR_PAQUETE_DISTRIBUCION.bat" del "CREAR_PAQUETE_DISTRIBUCION.bat"
if exist "CREAR_PAQUETE_LIGERO.bat" del "CREAR_PAQUETE_LIGERO.bat"

echo.
echo ✅ Limpieza completada
echo.
echo 📋 ARCHIVOS MANTENIDOS:
echo    ✅ Sistema_Completo_Final_v1.4.0\ - Versión final completa
echo    ✅ frontend\ - Código fuente del frontend
echo    ✅ backend\ - Código fuente del backend
echo    ✅ backend-alcaldia\ - Código fuente del backend alcaldía
echo    ✅ backend-enviaseo-control-acceso\ - Código fuente del backend enviaseo
echo    ✅ package.json - Configuración del proyecto
echo    ✅ README.md - Documentación principal
echo    ✅ Archivos de configuración esenciales
echo.
echo 📋 ARCHIVOS ELIMINADOS:
echo    ❌ node_modules\ - Dependencias (se pueden reinstalar)
echo    ❌ package-lock.json - Archivos de lock
echo    ❌ build\ - Carpetas de compilación
echo    ❌ *.log - Archivos de log
echo    ❌ Archivos Excel temporales
echo    ❌ Bases de datos temporales
echo    ❌ Carpetas de distribución antiguas
echo    ❌ Scripts de creación antiguos
echo.
echo 🎯 RESULTADO:
echo    El proyecto ahora está limpio y organizado.
echo    Solo se mantienen los archivos esenciales.
echo    La versión final está en: Sistema_Completo_Final_v1.4.0\
echo.
pause
