@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

title GENERADOR DE INSTALADOR - Sistema Enviaseo

echo.
echo =======================================================
echo        GENERADOR DE INSTALADOR - SISTEMA ENVIASEO
echo =======================================================
echo.

:: Verificar Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado
    echo Instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar NPM
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: NPM no está instalado
    pause
    exit /b 1
)

echo [1/5] Instalando dependencias del frontend...
call npm --prefix frontend install --silent

echo [2/5] Instalando dependencias de los backends...
call npm --prefix backend install --silent
call npm --prefix backend-alcaldia install --silent
call npm --prefix backend-enviaseo-control-acceso install --silent

echo [3/5] Construyendo frontend...
call npm --prefix frontend run build

echo [4/5] Instalando dependencias de Electron...
call npm --prefix app-electron install --silent

echo [5/5] Generando instalador .exe...
call npm --prefix app-electron run dist

echo.
echo =======================================================
echo           INSTALADOR GENERADO EXITOSAMENTE
echo =======================================================
echo.
echo El instalador .exe se encuentra en: app-electron\dist\
echo.
pause