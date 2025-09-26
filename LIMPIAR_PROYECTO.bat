@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title Limpiar Proyecto - Sistema Enviaseo v1.3.0

echo.
echo ================================================================
echo              LIMPIEZA DEL PROYECTO ENVIASEO v1.3.0
echo ================================================================
echo.
echo Este script eliminará archivos innecesarios del proyecto.
echo.

echo [1/8] Eliminando archivos de build...
if exist "frontend\build" (
    rmdir /s /q "frontend\build"
    echo ✅ Build del frontend eliminado
) else (
    echo ⚠️ Build del frontend no encontrado
)

if exist "app-electron\dist" (
    rmdir /s /q "app-electron\dist"
    echo ✅ Build de Electron eliminado
) else (
    echo ⚠️ Build de Electron no encontrado
)

echo.
echo [2/8] Eliminando archivos de distribución...
if exist "Sistema_Enviaseo_Distribucion" (
    rmdir /s /q "Sistema_Enviaseo_Distribucion"
    echo ✅ Paquete de distribución eliminado
) else (
    echo ⚠️ Paquete de distribución no encontrado
)

if exist "Sistema_Enviaseo_Compartir.zip" (
    del "Sistema_Enviaseo_Compartir.zip"
    echo ✅ Archivo ZIP eliminado
) else (
    echo ⚠️ Archivo ZIP no encontrado
)

echo.
echo [3/8] Eliminando archivos temporales...
if exist "frontend\.env" (
    del "frontend\.env"
    echo ✅ Archivo .env del frontend eliminado
) else (
    echo ⚠️ Archivo .env del frontend no encontrado
)

if exist "*.tmp" (
    del "*.tmp"
    echo ✅ Archivos temporales eliminados
) else (
    echo ⚠️ Archivos temporales no encontrados
)

if exist "*.log" (
    del "*.log"
    echo ✅ Archivos de log eliminados
) else (
    echo ⚠️ Archivos de log no encontrados
)

echo.
echo [4/8] Eliminando archivos de prueba...
if exist "test-server.js" (
    del "test-server.js"
    echo ✅ Archivo de prueba eliminado
) else (
    echo ⚠️ Archivo de prueba no encontrado
)

if exist "*-test.js" (
    del "*-test.js"
    echo ✅ Archivos de prueba eliminados
) else (
    echo ⚠️ Archivos de prueba no encontrados
)

echo.
echo [5/8] Eliminando archivos de Excel temporales...
for /d %%d in (backend\uploads_excel backend-alcaldia\uploads_excel backend-enviaseo-control-acceso\uploads_excel) do (
    if exist "%%d" (
        rmdir /s /q "%%d"
        echo ✅ Directorio %%d eliminado
    ) else (
        echo ⚠️ Directorio %%d no encontrado
    )
)

echo.
echo [6/8] Eliminando archivos de sistema...
if exist "Thumbs.db" (
    del "Thumbs.db"
    echo ✅ Thumbs.db eliminado
) else (
    echo ⚠️ Thumbs.db no encontrado
)

if exist "*.DS_Store" (
    del "*.DS_Store"
    echo ✅ Archivos .DS_Store eliminados
) else (
    echo ⚠️ Archivos .DS_Store no encontrados
)

echo.
echo [7/8] Eliminando archivos de backup...
if exist "*.bak" (
    del "*.bak"
    echo ✅ Archivos de backup eliminados
) else (
    echo ⚠️ Archivos de backup no encontrados
)

if exist "*~" (
    del "*~"
    echo ✅ Archivos temporales eliminados
) else (
    echo ⚠️ Archivos temporales no encontrados
)

echo.
echo [8/8] Verificando estructura del proyecto...
echo.
echo ARCHIVOS PRINCIPALES DEL PROYECTO:
if exist "package.json" echo ✅ package.json
if exist "README.md" echo ✅ README.md
if exist "CHANGELOG.md" echo ✅ CHANGELOG.md
if exist "GUIA_INSTALADORES.md" echo ✅ GUIA_INSTALADORES.md
if exist "INSTALADOR_MEJORADO.bat" echo ✅ INSTALADOR_MEJORADO.bat
if exist "INSTALADOR_RAPIDO.bat" echo ✅ INSTALADOR_RAPIDO.bat
if exist "DIAGNOSTICO_SISTEMA.bat" echo ✅ DIAGNOSTICO_SISTEMA.bat
if exist "REINICIAR_PANEL.bat" echo ✅ REINICIAR_PANEL.bat
if exist "LIMPIAR_PROYECTO.bat" echo ✅ LIMPIAR_PROYECTO.bat

echo.
echo DIRECTORIOS PRINCIPALES:
if exist "frontend" echo ✅ frontend/
if exist "backend" echo ✅ backend/
if exist "backend-alcaldia" echo ✅ backend-alcaldia/
if exist "backend-enviaseo-control-acceso" echo ✅ backend-enviaseo-control-acceso/
if exist "app-electron" echo ✅ app-electron/

echo.
echo ================================================================
echo                    LIMPIEZA COMPLETADA
echo ================================================================
echo.
echo ✅ El proyecto ha sido limpiado exitosamente
echo.
echo ARCHIVOS ELIMINADOS:
echo • Builds y distribuciones temporales
echo • Archivos de prueba y temporales
echo • Archivos de sistema (Thumbs.db, .DS_Store)
echo • Archivos de backup y temporales
echo • Archivos de Excel temporales
echo.
echo ARCHIVOS CONSERVADOS:
echo • Código fuente del proyecto
echo • Configuraciones principales
echo • Documentación y guías
echo • Instaladores optimizados
echo • Scripts de utilidad
echo.
echo El proyecto está ahora optimizado y listo para:
echo • Desarrollo
echo • Distribución
echo • Instalación
echo • Mantenimiento
echo.
pause
exit /b 0
