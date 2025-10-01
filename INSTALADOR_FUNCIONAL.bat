@echo off
chcp 65001 >nul
title INSTALADOR FUNCIONAL - Sistema de Gestión de Asistencia
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    🚀 INSTALADOR QUE SÍ FUNCIONA 🚀                       ║
echo ║                    Sistema de Gestión de Asistencia v1.4.0                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Este instalador SÍ funciona correctamente
echo.

:: Verificar archivos
if not exist "index.html" (
    echo ❌ Error: No se encontró index.html
    echo    Asegúrate de ejecutar desde la carpeta correcta
    pause
    exit /b 1
)

echo ✅ Archivos encontrados correctamente
echo.

:: Crear carpeta de instalación
set INSTALL_PATH=C:\SistemaGestionAsistencia
echo 📁 Instalando en: %INSTALL_PATH%

if exist "%INSTALL_PATH%" (
    echo ⚠️  La carpeta ya existe. Sobrescribiendo...
    rmdir /s /q "%INSTALL_PATH%"
)

echo 📁 Creando directorio...
mkdir "%INSTALL_PATH%"

echo 📋 Copiando archivos...
copy "index.html" "%INSTALL_PATH%\"
copy "INICIAR_APLICACION.bat" "%INSTALL_PATH%\"

echo 📝 Creando acceso directo...
echo [InternetShortcut] > "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"
echo URL=file:///%INSTALL_PATH:\=/%/index.html >> "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        ✅ INSTALACIÓN COMPLETADA ✅                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 Sistema instalado correctamente en: %INSTALL_PATH%
echo 🌐 Acceso directo creado en el escritorio
echo.
echo 🚀 Para usar: Hacer clic en "Sistema Gestion Asistencia" del escritorio
echo.

set /p choice="¿Abrir la aplicación ahora? (s/n): "
if /i "%choice%"=="s" (
    start "" "%INSTALL_PATH%\index.html"
)

echo.
pause

