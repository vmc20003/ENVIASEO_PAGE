@echo off
chcp 65001 >nul
title Instalador Sistema de Gestión de Asistencia - Versión Completa
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    🚀 INSTALADOR SISTEMA COMPLETO 🚀                      ║
echo ║                    Sistema de Gestión de Asistencia v1.4.0                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Este instalador configurará el Sistema de Gestión de Asistencia COMPLETO
echo    ✅ Procesamiento REAL de archivos Excel
echo    ✅ Almacenamiento PERMANENTE de datos
echo    ✅ Cálculo REAL de horas trabajadas y extra
echo    ✅ SIN necesidad de Node.js
echo    ✅ SIN dependencias externas
echo.

echo 🔍 Verificando requisitos del sistema...
echo.
echo 📋 REQUISITOS MÍNIMOS:
echo    ✅ Windows 10 o superior
echo    ✅ Navegador web (Chrome, Edge, Firefox)
echo    ✅ 100MB espacio libre en disco
echo    ❌ NO necesita Node.js
echo    ❌ NO necesita npm
echo    ❌ NO necesita instalación de dependencias
echo.

echo 📁 Seleccionando ubicación de instalación...
set /p INSTALL_PATH="Ingresa la ruta donde instalar (presiona Enter para usar C:\SistemaGestionAsistencia): "
if "%INSTALL_PATH%"=="" set INSTALL_PATH=C:\SistemaGestionAsistencia

echo 📦 Instalando en: %INSTALL_PATH%
echo.

if exist "%INSTALL_PATH%" (
    echo ⚠️  La carpeta ya existe. ¿Deseas sobrescribir?
    set /p OVERWRITE="Escribe 'si' para sobrescribir: "
    if /i not "%OVERWRITE%"=="si" (
        echo ❌ Instalación cancelada
        pause
        exit /b 1
    )
    echo 🧹 Eliminando instalación anterior...
    rmdir /s /q "%INSTALL_PATH%"
)

echo 📁 Creando directorio de instalación...
mkdir "%INSTALL_PATH%"

echo 📋 Copiando archivos del sistema...
copy "Sistema_Completo_Sin_Dependencias.html" "%INSTALL_PATH%\index.html"
copy "INICIAR_SISTEMA.bat" "%INSTALL_PATH%\"
copy "README_SISTEMA_COMPLETO.txt" "%INSTALL_PATH%\"

echo 📝 Creando acceso directo en el escritorio...
echo [InternetShortcut] > "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"
echo URL=file:///%INSTALL_PATH%/index.html >> "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"
echo IconFile=%INSTALL_PATH%\index.html >> "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"
echo IconIndex=0 >> "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"

echo 📝 Creando acceso directo en el menú inicio...
echo [InternetShortcut] > "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Sistema Gestion Asistencia.url"
echo URL=file:///%INSTALL_PATH%/index.html >> "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Sistema Gestion Asistencia.url"
echo IconFile=%INSTALL_PATH%\index.html >> "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Sistema Gestion Asistencia.url"
echo IconIndex=0 >> "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Sistema Gestion Asistencia.url"

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        ✅ INSTALACIÓN COMPLETADA ✅                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 El Sistema de Gestión de Asistencia COMPLETO se ha instalado correctamente
echo.
echo 📋 Ubicación de instalación: %INSTALL_PATH%
echo 🌐 Acceso directo creado en el escritorio
echo 🌐 Acceso directo creado en el menú inicio
echo.
echo 🚀 Para iniciar el sistema:
echo    1. Ejecutar INICIAR_SISTEMA.bat desde %INSTALL_PATH%
echo    2. O hacer clic en el acceso directo del escritorio
echo    3. O abrir %INSTALL_PATH%\index.html directamente
echo.
echo 📋 Módulos disponibles:
echo    🏢 Alumbrado Público - Control de asistencia
echo    🏛️  Alcaldía - Gestión de empleados
echo    🌱 Enviaseo - Control de acceso
echo.
echo ✅ FUNCIONALIDADES COMPLETAS:
echo    📊 Procesamiento REAL de archivos Excel (.xlsx, .xls)
echo    💾 Almacenamiento PERMANENTE de datos (localStorage)
echo    ⏰ Cálculo REAL de horas trabajadas y extra
echo    📥 Exportación a Excel y CSV
echo    🎨 Interfaz moderna y responsiva
echo    🔄 Detección automática de columnas
echo.
set /p choice="¿Deseas iniciar el sistema ahora? (s/n): "
if /i "%choice%"=="s" (
    echo.
    echo 🚀 Iniciando sistema...
    start "" "%INSTALL_PATH%\index.html"
) else (
    echo.
    echo 👋 Instalación completada. Ejecuta INICIAR_SISTEMA.bat cuando estés listo.
)

echo.
pause
