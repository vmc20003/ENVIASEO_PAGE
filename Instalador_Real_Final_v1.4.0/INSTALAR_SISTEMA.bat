@echo off
chcp 65001 >nul
title Instalador Real - Sistema de Gestión de Asistencia
color 0A

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                    🚀 INSTALADOR REAL DEL SISTEMA 🚀                      ║
echo ║                    Sistema de Gestión de Asistencia v1.4.0                ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Este es un INSTALADOR REAL que funcionará correctamente
echo.

:: Verificar que estamos en la carpeta correcta
if not exist "index.html" (
    echo ❌ Error: No se encontró index.html
    echo    Asegúrate de ejecutar este instalador desde la carpeta del paquete
    pause
    exit /b 1
)

echo 🔍 Verificando archivos necesarios...
if exist "index.html" echo ✅ index.html encontrado
if exist "INICIAR_APLICACION.bat" echo ✅ INICIAR_APLICACION.bat encontrado
if exist "README_SISTEMA_COMPLETO.txt" echo ✅ README encontrado

echo.
echo 📁 Seleccionando ubicación de instalación...
echo Opciones disponibles:
echo 1. C:\SistemaGestionAsistencia (Recomendado)
echo 2. %USERPROFILE%\Desktop\SistemaGestionAsistencia
echo 3. %USERPROFILE%\Downloads\SistemaGestionAsistencia
echo 4. Personalizada
echo.
set /p choice="Selecciona una opción (1-4): "

if "%choice%"=="1" set INSTALL_PATH=C:\SistemaGestionAsistencia
if "%choice%"=="2" set INSTALL_PATH=%USERPROFILE%\Desktop\SistemaGestionAsistencia
if "%choice%"=="3" set INSTALL_PATH=%USERPROFILE%\Downloads\SistemaGestionAsistencia
if "%choice%"=="4" (
    set /p INSTALL_PATH="Ingresa la ruta completa: "
)

echo.
echo 📦 Instalando en: %INSTALL_PATH%
echo.

:: Crear directorio
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
copy "index.html" "%INSTALL_PATH%\"
if %errorlevel% neq 0 (
    echo ❌ Error copiando index.html
    pause
    exit /b 1
)
echo ✅ Archivo principal copiado

if exist "INICIAR_APLICACION.bat" (
    copy "INICIAR_APLICACION.bat" "%INSTALL_PATH%\"
    echo ✅ Script de inicio copiado
)

if exist "README_SISTEMA_COMPLETO.txt" (
    copy "README_SISTEMA_COMPLETO.txt" "%INSTALL_PATH%\"
    echo ✅ Documentación copiada
)

if exist "INSTRUCCIONES_SIMPLES.txt" (
    copy "INSTRUCCIONES_SIMPLES.txt" "%INSTALL_PATH%\"
    echo ✅ Instrucciones copiadas
)

echo.
echo 📝 Creando acceso directo en el escritorio...
echo [InternetShortcut] > "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"
echo URL=file:///%INSTALL_PATH:\=/%/index.html >> "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"
echo IconFile=%INSTALL_PATH%\index.html >> "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"
echo IconIndex=0 >> "%USERPROFILE%\Desktop\Sistema Gestion Asistencia.url"
echo ✅ Acceso directo creado en el escritorio

echo.
echo 📝 Creando acceso directo en el menú inicio...
echo [InternetShortcut] > "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Sistema Gestion Asistencia.url"
echo URL=file:///%INSTALL_PATH:\=/%/index.html >> "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Sistema Gestion Asistencia.url"
echo IconFile=%INSTALL_PATH%\index.html >> "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Sistema Gestion Asistencia.url"
echo IconIndex=0 >> "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Sistema Gestion Asistencia.url"
echo ✅ Acceso directo creado en el menú inicio

echo.
echo 📝 Creando script de inicio silencioso...
echo @echo off > "%INSTALL_PATH%\INICIAR_APLICACION.bat"
echo start "" "%%~dp0index.html" >> "%INSTALL_PATH%\INICIAR_APLICACION.bat"
echo exit >> "%INSTALL_PATH%\INICIAR_APLICACION.bat"
echo ✅ Script de inicio silencioso creado

echo.
echo 📝 Creando script de prueba...
echo @echo off > "%INSTALL_PATH%\PROBAR_APLICACION.bat"
echo echo Probando la aplicación... >> "%INSTALL_PATH%\PROBAR_APLICACION.bat"
echo start "" "%%~dp0index.html" >> "%INSTALL_PATH%\PROBAR_APLICACION.bat"
echo echo ✅ Aplicación iniciada >> "%INSTALL_PATH%\PROBAR_APLICACION.bat"
echo pause >> "%INSTALL_PATH%\PROBAR_APLICACION.bat"
echo ✅ Script de prueba creado

echo.
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                        ✅ INSTALACIÓN COMPLETADA ✅                          ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🎉 El Sistema de Gestión de Asistencia se ha instalado correctamente
echo.
echo 📋 Ubicación de instalación: %INSTALL_PATH%
echo 🌐 Acceso directo creado en el escritorio
echo 🌐 Acceso directo creado en el menú inicio
echo.
echo 🚀 Para iniciar el sistema:
echo    1. Hacer clic en el acceso directo del escritorio
echo    2. O hacer clic en el acceso directo del menú inicio
echo    3. O ejecutar INICIAR_APLICACION.bat desde %INSTALL_PATH%
echo    4. O ejecutar PROBAR_APLICACION.bat para probar
echo    5. O abrir %INSTALL_PATH%\index.html directamente
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
set /p choice="¿Deseas probar la aplicación ahora? (s/n): "
if /i "%choice%"=="s" (
    echo.
    echo 🚀 Iniciando aplicación...
    start "" "%INSTALL_PATH%\index.html"
    echo ✅ Aplicación iniciada
) else (
    echo.
    echo 👋 Instalación completada. Haz clic en el acceso directo del escritorio para iniciar.
)

echo.
echo 📁 Abriendo carpeta de instalación...
start "" "%INSTALL_PATH%"

echo.
pause
