@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Crear Paquete de Distribución - Sistema Enviaseo

echo.
echo ================================================================
echo        CREAR PAQUETE DE DISTRIBUCIÓN - SISTEMA ENVIASEO
echo ================================================================
echo.

:: Crear carpeta de distribución
set "DIST_FOLDER=Sistema_Enviaseo_Distribucion"
if exist "%DIST_FOLDER%" (
    echo Eliminando carpeta anterior...
    rmdir /s /q "%DIST_FOLDER%"
)

echo [1/6] Creando estructura del paquete...
mkdir "%DIST_FOLDER%"
mkdir "%DIST_FOLDER%\app"
mkdir "%DIST_FOLDER%\docs"

echo ✅ Estructura creada

echo.
echo [2/6] Copiando archivos de la aplicación...
xcopy "frontend" "%DIST_FOLDER%\app\frontend\" /E /I /Q >nul
xcopy "backend" "%DIST_FOLDER%\app\backend\" /E /I /Q >nul
xcopy "backend-alcaldia" "%DIST_FOLDER%\app\backend-alcaldia\" /E /I /Q >nul
xcopy "backend-enviaseo-control-acceso" "%DIST_FOLDER%\app\backend-enviaseo-control-acceso\" /E /I /Q >nul
xcopy "app-electron" "%DIST_FOLDER%\app\app-electron\" /E /I /Q >nul

:: Copiar archivos de configuración
copy "package.json" "%DIST_FOLDER%\app\" >nul
copy "package-lock.json" "%DIST_FOLDER%\app\" >nul
copy "README.md" "%DIST_FOLDER%\app\" >nul
copy "manual-usuario.md" "%DIST_FOLDER%\app\" >nul

echo ✅ Archivos copiados

echo.
echo [3/6] Creando scripts de instalación...

:: Script de instalación principal
(
echo @echo off
echo chcp 65001 ^>nul
echo setlocal enabledelayedexpansion
echo.
echo title Instalador Sistema Enviaseo
echo.
echo echo.
echo echo ================================================================
echo echo           INSTALADOR SISTEMA DE GESTIÓN ENVIASEO
echo echo ================================================================
echo echo.
echo echo Este instalador configurará el sistema en esta computadora.
echo echo.
echo echo REQUISITOS:
echo echo • Node.js versión 16 o superior
echo echo • Conexión a internet
echo echo • Puertos 3000, 4000, 4001, 4002 disponibles
echo echo.
echo echo ¿Desea continuar con la instalación? ^(S/N^)
echo set /p choice=
echo if /i not "%%choice%%"=="S" ^(
echo     echo Instalación cancelada.
echo     pause
echo     exit /b 0
echo ^)
echo.
echo echo [1/4] Verificando Node.js...
echo where node ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo.
echo     echo ❌ Node.js no está instalado
echo     echo.
echo     echo Para instalar Node.js:
echo     echo 1. Vaya a https://nodejs.org/
echo     echo 2. Descargue la versión LTS
echo     echo 3. Ejecute el instalador
echo     echo 4. Reinicie esta ventana
echo     echo.
echo     echo ¿Desea abrir la página de descarga? ^(S/N^)
echo     set /p download_choice=
echo     if /i "%%download_choice%%"=="S" ^(
echo         start https://nodejs.org/
echo     ^)
echo     pause
echo     exit /b 1
echo ^)
echo.
echo for /f "tokens=*" %%i in ^('node --version'^) do set NODE_VERSION=%%i
echo echo ✅ Node.js instalado: %%NODE_VERSION%%
echo.
echo echo [2/4] Instalando dependencias...
echo echo Esto puede tomar varios minutos...
echo.
echo call npm install --silent --no-audit --no-fund
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error al instalar dependencias principales
echo     pause
echo     exit /b 1
echo ^)
echo.
echo call npm --prefix frontend install --silent --no-audit --no-fund
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error al instalar dependencias del frontend
echo     pause
echo     exit /b 1
echo ^)
echo.
echo call npm --prefix backend install --silent --no-audit --no-fund
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error al instalar dependencias del backend principal
echo     pause
echo     exit /b 1
echo ^)
echo.
echo call npm --prefix backend-alcaldia install --silent --no-audit --no-fund
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error al instalar dependencias del backend alcaldía
echo     pause
echo     exit /b 1
echo ^)
echo.
echo call npm --prefix backend-enviaseo-control-acceso install --silent --no-audit --no-fund
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error al instalar dependencias del backend enviaseo
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo ✅ Dependencias instaladas
echo.
echo echo [3/4] Construyendo aplicación...
echo call npm --prefix frontend run build
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error al construir la aplicación
echo     pause
echo     exit /b 1
echo ^)
echo echo ✅ Aplicación construida
echo.
echo echo [4/4] Creando accesos directos...
echo.
echo ^(
echo echo @echo off
echo echo title Sistema Enviaseo
echo echo echo Iniciando Sistema de Gestión Enviaseo...
echo echo echo.
echo echo echo El sistema se abrirá en: http://localhost:3000
echo echo echo Presione Ctrl+C para detener
echo echo echo.
echo echo cd /d "%%~dp0"
echo echo call npm start
echo echo pause
echo ^) ^> INICIAR_ENVIASEO.bat
echo.
echo ^(
echo echo @echo off
echo echo title Deteniendo Sistema Enviaseo
echo echo echo Deteniendo servidores...
echo echo taskkill /f /im node.exe 2^>nul
echo echo echo Sistema detenido.
echo echo timeout /t 2 /nobreak ^>nul
echo ^) ^> DETENER_ENVIASEO.bat
echo.
echo echo ✅ Instalación completada
echo echo.
echo echo ================================================================
echo echo                    INSTALACIÓN COMPLETADA
echo echo ================================================================
echo echo.
echo echo ✅ El sistema se ha instalado correctamente
echo echo.
echo echo ARCHIVOS CREADOS:
echo echo • INICIAR_ENVIASEO.bat - Para iniciar el sistema
echo echo • DETENER_ENVIASEO.bat - Para detener el sistema
echo echo.
echo echo INSTRUCCIONES:
echo echo 1. Ejecute "INICIAR_ENVIASEO.bat" para iniciar
echo echo 2. Acceda a http://localhost:3000
echo echo 3. Para detener, ejecute "DETENER_ENVIASEO.bat"
echo echo.
echo echo ¿Desea iniciar el sistema ahora? ^(S/N^)
echo set /p start_now=
echo if /i "%%start_now%%"=="S" ^(
echo     echo Iniciando sistema...
echo     start INICIAR_ENVIASEO.bat
echo ^)
echo.
echo echo Instalación completada.
echo pause
) > "%DIST_FOLDER%\INSTALAR.bat"

:: Script de inicio rápido
(
echo @echo off
echo title Sistema Enviaseo - Inicio Rápido
echo echo Iniciando Sistema de Gestión Enviaseo...
echo echo.
echo echo Abriendo en: http://localhost:3000
echo echo Presione Ctrl+C para detener todos los servidores
echo echo.
echo cd /d "%%~dp0\app"
echo call npm start
echo pause
) > "%DIST_FOLDER%\INICIO_RAPIDO.bat"

echo ✅ Scripts creados

echo.
echo [4/6] Creando documentación...

:: Crear README para distribución
(
echo # Sistema de Gestión Enviaseo
echo.
echo ## Instalación
echo.
echo 1. **Ejecute INSTALAR.bat** como administrador
echo 2. Siga las instrucciones en pantalla
echo 3. Ejecute INICIAR_ENVIASEO.bat para iniciar el sistema
echo.
echo ## Requisitos del Sistema
echo.
echo - **Windows 10/11**
echo - **Node.js 16+** ^(se descarga automáticamente^)
echo - **4GB RAM mínimo**
echo - **1GB espacio en disco**
echo - **Puertos disponibles**: 3000, 4000, 4001, 4002
echo.
echo ## Uso
echo.
echo ### Iniciar Sistema
echo - Ejecute `INICIAR_ENVIASEO.bat`
echo - Acceda a http://localhost:3000
echo.
echo ### Detener Sistema
echo - Ejecute `DETENER_ENVIASEO.bat`
echo - O presione Ctrl+C en la ventana del sistema
echo.
echo ## Módulos Disponibles
echo.
echo 1. **Sistema de Asistencia - Alumbrado Público**
echo    - Gestión de horarios y horas extra
echo    - Puerto: 4000
echo.
echo 2. **Sistema de Asistencia - Alcaldía de Envigado**
echo    - Control de asistencia municipal
echo    - Puerto: 4002
echo.
echo 3. **Sistema de Control - Enviaseo**
echo    - Control de acceso
echo    - Puerto: 4001
echo.
echo ## Solución de Problemas
echo.
echo ### Error: "Puerto en uso"
echo - Cierre otras aplicaciones que usen los puertos
echo - O ejecute `DETENER_ENVIASEO.bat` primero
echo.
echo ### Error: "Node.js no encontrado"
echo - Instale Node.js desde https://nodejs.org/
echo - Reinicie la computadora después de instalar
echo.
echo ### Sistema no inicia
echo - Verifique que los puertos estén disponibles
echo - Ejecute como administrador
echo - Verifique la conexión a internet
echo.
echo ## Soporte Técnico
echo.
echo Para soporte técnico, contacte al administrador del sistema.
echo.
echo ---
echo **Versión**: 1.0.0
echo **Fecha**: %DATE%
echo **Desarrollado por**: Enviaseo E.S.P.
) > "%DIST_FOLDER%\README.txt"

:: Crear manual de usuario simplificado
(
echo MANUAL DE USUARIO - SISTEMA ENVIASEO
echo =====================================
echo.
echo INICIO RÁPIDO:
echo 1. Ejecute INSTALAR.bat
echo 2. Ejecute INICIAR_ENVIASEO.bat
echo 3. Abra http://localhost:3000
echo.
echo MÓDULOS DISPONIBLES:
echo.
echo 📊 ALUMBRADO PÚBLICO
echo - Subir archivos Excel de asistencia
echo - Buscar registros por nombre/ID
echo - Generar reportes
echo.
echo 🏛️ ALCALDÍA DE ENVIGADO
echo - Control de asistencia municipal
echo - Verificación de personal
echo - Reportes de asistencia
echo.
echo 🛡️ ENVIASEO CONTROL DE ACCESO
echo - Gestión de acceso
echo - Control de personal
echo - Reportes de acceso
echo.
echo FUNCIONES PRINCIPALES:
echo.
echo 📁 Cargar Archivo Excel
echo 1. Seleccione "Seleccionar archivo Excel"
echo 2. Elija su archivo .xlsx o .xls
echo 3. Haga clic en "Subir Archivo"
echo.
echo 🔍 Buscar Registros
echo 1. Escriba en el campo de búsqueda
echo 2. Puede buscar por nombre, ID o departamento
echo 3. Haga clic en "Buscar"
echo.
echo 📊 Navegar Resultados
echo - Use los botones < y ^> para cambiar páginas
echo - Los números muestran la página actual
echo.
echo ⚠️ NOTAS IMPORTANTES:
echo - No cierre la ventana del sistema mientras lo usa
echo - Mantenga los archivos Excel en formato correcto
echo - Para detener el sistema, use DETENER_ENVIASEO.bat
echo.
echo 📞 SOPORTE:
echo Si tiene problemas, contacte al administrador del sistema.
) > "%DIST_FOLDER%\MANUAL_USUARIO.txt"

echo ✅ Documentación creada

echo.
echo [5/6] Optimizando paquete...

:: Eliminar archivos innecesarios
if exist "%DIST_FOLDER%\app\frontend\node_modules" (
    rmdir /s /q "%DIST_FOLDER%\app\frontend\node_modules"
)
if exist "%DIST_FOLDER%\app\backend\node_modules" (
    rmdir /s /q "%DIST_FOLDER%\app\backend\node_modules"
)
if exist "%DIST_FOLDER%\app\backend-alcaldia\node_modules" (
    rmdir /s /q "%DIST_FOLDER%\app\backend-alcaldia\node_modules"
)
if exist "%DIST_FOLDER%\app\backend-enviaseo-control-acceso\node_modules" (
    rmdir /s /q "%DIST_FOLDER%\app\backend-enviaseo-control-acceso\node_modules"
)
if exist "%DIST_FOLDER%\app\app-electron\node_modules" (
    rmdir /s /q "%DIST_FOLDER%\app\app-electron\node_modules"
)

:: Eliminar archivos de desarrollo
del /q "%DIST_FOLDER%\app\frontend\src\*.js" 2>nul
del /q "%DIST_FOLDER%\app\frontend\src\*.jsx" 2>nul
del /q "%DIST_FOLDER%\app\frontend\src\*.css" 2>nul

echo ✅ Paquete optimizado

echo.
echo [6/6] Creando archivo de información...

:: Crear archivo de información del paquete
(
echo INFORMACIÓN DEL PAQUETE DE DISTRIBUCIÓN
echo =======================================
echo.
echo Nombre: Sistema de Gestión Enviaseo
echo Versión: 1.0.0
echo Fecha de creación: %DATE% %TIME%
echo Tamaño estimado: ~50MB ^(después de instalación^)
echo.
echo CONTENIDO:
echo • Instalador automático
echo • Aplicación completa
echo • Documentación
echo • Scripts de inicio/parada
echo.
echo REQUISITOS DEL SISTEMA:
echo • Windows 10/11
echo • Node.js 16+
echo • 4GB RAM
echo • 1GB espacio en disco
echo • Conexión a internet
echo.
echo INSTRUCCIONES DE INSTALACIÓN:
echo 1. Copie esta carpeta a la computadora destino
echo 2. Ejecute INSTALAR.bat como administrador
echo 3. Siga las instrucciones en pantalla
echo 4. Ejecute INICIAR_ENVIASEO.bat para usar el sistema
echo.
echo PUERTOS UTILIZADOS:
echo • 3000 - Frontend
echo • 4000 - Backend Principal
echo • 4001 - Backend Enviaseo
echo • 4002 - Backend Alcaldía
echo.
echo DESARROLLADO POR: Enviaseo E.S.P.
echo CONTACTO: Administrador del Sistema
) > "%DIST_FOLDER%\INFO_PAQUETE.txt"

echo ✅ Información creada

:: Calcular tamaño del paquete
for /f "tokens=3" %%a in ('dir "%DIST_FOLDER%" /-c ^| find "File(s)"') do set PACKAGE_SIZE=%%a

echo.
echo ================================================================
echo                    PAQUETE CREADO EXITOSAMENTE
echo ================================================================
echo.
echo 📦 Paquete creado en: %DIST_FOLDER%
echo 📊 Tamaño: %PACKAGE_SIZE% bytes
echo.
echo ARCHIVOS INCLUIDOS:
echo • INSTALAR.bat - Instalador principal
echo • INICIO_RAPIDO.bat - Inicio directo
echo • README.txt - Documentación principal
echo • MANUAL_USUARIO.txt - Manual de usuario
echo • INFO_PAQUETE.txt - Información del paquete
echo • app\ - Aplicación completa
echo.
echo INSTRUCCIONES DE DISTRIBUCIÓN:
echo 1. Comprima la carpeta "%DIST_FOLDER%"
echo 2. Distribuya el archivo comprimido
echo 3. Los usuarios ejecutarán INSTALAR.bat
echo.
echo ¿Desea comprimir el paquete ahora? (S/N)
set /p compress=
if /i "%compress%"=="S" (
    echo.
    echo Comprimiendo paquete...
    powershell "Compress-Archive -Path '%DIST_FOLDER%' -DestinationPath '%DIST_FOLDER%.zip' -Force"
    if exist "%DIST_FOLDER%.zip" (
        echo ✅ Paquete comprimido: %DIST_FOLDER%.zip
    ) else (
        echo ❌ Error al comprimir
    )
)

echo.
echo Paquete de distribución creado exitosamente.
pause
