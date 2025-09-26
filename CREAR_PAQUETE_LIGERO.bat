@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Crear Paquete Ligero - Sistema Enviaseo

echo.
echo ================================================================
echo           CREAR PAQUETE LIGERO - SISTEMA ENVIASEO
echo ================================================================
echo.

:: Verificar que estamos en el directorio correcto
if not exist "frontend\package.json" (
    echo ❌ No se encontró frontend\package.json
    echo Ejecute este script desde la raíz del proyecto
    pause
    exit /b 1
)

echo [1/5] Eliminando paquete anterior...
if exist "Sistema_Enviaseo_Ligero" (
    rmdir /s /q "Sistema_Enviaseo_Ligero"
)
echo ✅ Paquete anterior eliminado

echo.
echo [2/5] Creando estructura del paquete...
mkdir "Sistema_Enviaseo_Ligero"
mkdir "Sistema_Enviaseo_Ligero\app"
mkdir "Sistema_Enviaseo_Ligero\docs"
echo ✅ Estructura creada

echo.
echo [3/5] Copiando archivos esenciales (sin node_modules)...
echo Copiando frontend...
xcopy "frontend\src" "Sistema_Enviaseo_Ligero\app\frontend\src" /E /I /Q
xcopy "frontend\public" "Sistema_Enviaseo_Ligero\app\frontend\public" /E /I /Q
copy "frontend\package.json" "Sistema_Enviaseo_Ligero\app\frontend\"
copy "frontend\package-lock.json" "Sistema_Enviaseo_Ligero\app\frontend\"

echo Copiando backend...
xcopy "backend\utils" "Sistema_Enviaseo_Ligero\app\backend\utils" /E /I /Q
copy "backend\server.js" "Sistema_Enviaseo_Ligero\app\backend\"
copy "backend\config.js" "Sistema_Enviaseo_Ligero\app\backend\"
copy "backend\package.json" "Sistema_Enviaseo_Ligero\app\backend\"
copy "backend\package-lock.json" "Sistema_Enviaseo_Ligero\app\backend\"

echo Copiando backend-alcaldia...
xcopy "backend-alcaldia\utils" "Sistema_Enviaseo_Ligero\app\backend-alcaldia\utils" /E /I /Q
copy "backend-alcaldia\server-new.js" "Sistema_Enviaseo_Ligero\app\backend-alcaldia\"
copy "backend-alcaldia\config.js" "Sistema_Enviaseo_Ligero\app\backend-alcaldia\"
copy "backend-alcaldia\package.json" "Sistema_Enviaseo_Ligero\app\backend-alcaldia\"
copy "backend-alcaldia\package-lock.json" "Sistema_Enviaseo_Ligero\app\backend-alcaldia\"

echo Copiando backend-enviaseo...
xcopy "backend-enviaseo-control-acceso\utils" "Sistema_Enviaseo_Ligero\app\backend-enviaseo-control-acceso\utils" /E /I /Q
copy "backend-enviaseo-control-acceso\server.js" "Sistema_Enviaseo_Ligero\app\backend-enviaseo-control-acceso\"
copy "backend-enviaseo-control-acceso\config.js" "Sistema_Enviaseo_Ligero\app\backend-enviaseo-control-acceso\"
copy "backend-enviaseo-control-acceso\package.json" "Sistema_Enviaseo_Ligero\app\backend-enviaseo-control-acceso\"
copy "backend-enviaseo-control-acceso\package-lock.json" "Sistema_Enviaseo_Ligero\app\backend-enviaseo-control-acceso\"

echo Copiando archivos raíz...
copy "package.json" "Sistema_Enviaseo_Ligero\app\"
copy "package-lock.json" "Sistema_Enviaseo_Ligero\app\"
copy "README.md" "Sistema_Enviaseo_Ligero\app\"
copy "manual-usuario.md" "Sistema_Enviaseo_Ligero\app\"
echo ✅ Archivos copiados

echo.
echo [4/5] Creando instalador mejorado...
(
echo @echo off
echo chcp 65001 ^>nul
echo setlocal enabledelayedexpansion
echo.
echo title Instalador Sistema Enviaseo - Versión Ligera
echo.
echo echo.
echo echo ================================================================
echo echo           INSTALADOR SISTEMA ENVIASEO - VERSIÓN LIGERA
echo echo ================================================================
echo echo.
echo echo Este instalador configurará el sistema en esta computadora.
echo echo.
echo echo REQUISITOS:
echo echo • Node.js ^(se verificará automáticamente^)
echo echo • Conexión a internet ^(para descargar dependencias^)
echo echo • Puertos 3000, 5000, 5001, 5002 disponibles
echo echo.
echo echo ¿Desea continuar con la instalación? ^(S/N^)
echo set /p continuar=
echo if /i "!continuar!" neq "S" ^(
echo     echo Instalación cancelada.
echo     pause
echo     exit /b 1
echo ^)
echo.
echo echo [1/4] Verificando Node.js...
echo where node ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Node.js no está instalado
echo     echo Instale Node.js desde https://nodejs.org/
echo     pause
echo     exit /b 1
echo ^)
echo.
echo for /f "tokens=*" %%i in ^('node --version'^) do set NODE_VERSION=%%i
echo echo ✅ Node.js instalado: !NODE_VERSION!
echo.
echo echo [2/4] Instalando dependencias del frontend...
echo cd app\frontend
echo call npm install
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error instalando dependencias del frontend
echo     pause
echo     exit /b 1
echo ^)
echo echo ✅ Frontend configurado
echo.
echo echo [3/4] Instalando dependencias de los backends...
echo cd ..\backend
echo call npm install
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error instalando dependencias del backend
echo     pause
echo     exit /b 1
echo ^)
echo.
echo cd ..\backend-alcaldia
echo call npm install
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error instalando dependencias del backend-alcaldia
echo     pause
echo     exit /b 1
echo ^)
echo.
echo cd ..\backend-enviaseo-control-acceso
echo call npm install
echo if %%errorlevel%% neq 0 ^(
echo     echo ❌ Error instalando dependencias del backend-enviaseo
echo     pause
echo     exit /b 1
echo ^)
echo echo ✅ Backends configurados
echo.
echo echo [4/4] Creando scripts de inicio...
echo cd ..
echo.
echo ^(echo @echo off
echo echo chcp 65001 ^>nul
echo echo title Sistema Enviaseo - Iniciando Servidores
echo echo.
echo echo echo ================================================================
echo echo           INICIANDO SISTEMA ENVIASEO
echo echo ================================================================
echo echo.
echo echo Iniciando servidores en segundo plano...
echo echo.
echo echo Frontend: http://localhost:3000
echo echo Backend Alumbrado: http://localhost:5000
echo echo Backend Alcaldía: http://localhost:5002
echo echo Backend Enviaseo: http://localhost:5001
echo echo.
echo echo Presione Ctrl+C para detener todos los servidores
echo echo.
echo start "Backend Alumbrado" cmd /k "cd backend ^&^& npm start"
echo timeout /t 3 /nobreak ^>nul
echo start "Backend Alcaldía" cmd /k "cd backend-alcaldia ^&^& npm start"
echo timeout /t 3 /nobreak ^>nul
echo start "Backend Enviaseo" cmd /k "cd backend-enviaseo-control-acceso ^&^& npm start"
echo timeout /t 3 /nobreak ^>nul
echo start "Frontend" cmd /k "cd frontend ^&^& npm start"
echo echo.
echo echo ✅ Todos los servidores iniciados
echo echo.
echo echo El sistema se abrirá automáticamente en el navegador
echo echo en http://localhost:3000
echo echo.
echo pause^) ^> INICIAR_SISTEMA.bat
echo.
echo echo ✅ Instalación completada exitosamente
echo echo.
echo echo ================================================================
echo echo                    INSTALACIÓN EXITOSA
echo echo ================================================================
echo echo.
echo echo El sistema está listo para usar.
echo echo.
echo echo Para iniciar el sistema:
echo echo 1. Ejecute INICIAR_SISTEMA.bat
echo echo 2. O ejecute manualmente cada servidor
echo echo.
echo echo Acceso: http://localhost:3000
echo echo.
echo pause
) > "Sistema_Enviaseo_Ligero\INSTALAR.bat"

echo ✅ Instalador creado

echo.
echo [5/5] Creando documentación...
(
echo Sistema de Gestión Enviaseo - Versión Ligera
echo =============================================
echo.
echo Este paquete contiene el sistema completo sin los archivos node_modules
echo para reducir el tamaño del archivo.
echo.
echo INSTALACIÓN:
echo 1. Ejecute INSTALAR.bat
echo 2. Espere a que se instalen las dependencias
echo 3. Ejecute INICIAR_SISTEMA.bat
echo.
echo REQUISITOS:
echo - Node.js instalado
echo - Conexión a internet
echo - Puertos 3000, 5000, 5001, 5002 libres
echo.
echo MÓDULOS INCLUIDOS:
echo - Alumbrado Público (puerto 5000)
echo - Alcaldía de Envigado (puerto 5002)
echo - Enviaseo Control de Acceso (puerto 5001)
echo - Frontend React (puerto 3000)
echo.
echo CARACTERÍSTICAS:
echo ✅ Logos grandes y llamativos
echo ✅ Animaciones suaves
echo ✅ Modo demo disponible
echo ✅ Datos de tabla corregidos
echo ✅ Puertos actualizados (sin conflictos)
echo.
echo SOPORTE:
echo Para soporte técnico, contacte al administrador del sistema.
) > "Sistema_Enviaseo_Ligero\LEEME.txt"

echo ✅ Documentación creada

echo.
echo ================================================================
echo                    PAQUETE CREADO EXITOSAMENTE
echo ================================================================
echo.
echo 📦 Paquete creado: Sistema_Enviaseo_Ligero
echo 📁 Tamaño: Sin node_modules (mucho más ligero)
echo 🚀 Instalador: INSTALAR.bat
echo 📖 Documentación: LEEME.txt
echo.
echo Para distribuir:
echo 1. Comprima la carpeta Sistema_Enviaseo_Ligero
echo 2. Comparta el archivo .zip
echo 3. El usuario ejecuta INSTALAR.bat
echo.
pause
