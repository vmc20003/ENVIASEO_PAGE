# Script de inicio rápido para el equipo
Write-Host "🚀 Inicio Rápido - Sistema de Gestión de Asistencia" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

Write-Host "`n📋 Opciones disponibles:" -ForegroundColor Yellow
Write-Host "1. Configurar proyecto para nuevo miembro" -ForegroundColor White
Write-Host "2. Iniciar proyecto en modo desarrollo" -ForegroundColor White
Write-Host "3. Ver comandos Git útiles" -ForegroundColor White
Write-Host "4. Copiar configuración del equipo" -ForegroundColor White
Write-Host "5. Ver documentación" -ForegroundColor White

$opcion = Read-Host "`nSelecciona una opción (1-5)"

switch ($opcion) {
    "1" {
        Write-Host "`n🔧 Configurando proyecto para nuevo miembro..." -ForegroundColor Yellow
        & "$PSScriptRoot\scripts\setup-team.ps1"
    }
    "2" {
        Write-Host "`n🎯 Iniciando proyecto en modo desarrollo..." -ForegroundColor Yellow
        & "$PSScriptRoot\scripts\dev-team.ps1"
    }
    "3" {
        Write-Host "`n🔧 Mostrando comandos Git útiles..." -ForegroundColor Yellow
        & "$PSScriptRoot\scripts\git-workflow.ps1" -Action "help"
    }
    "4" {
        Write-Host "`n📄 Copiando configuración del equipo..." -ForegroundColor Yellow
        & "$PSScriptRoot\scripts\copy-config.ps1"
    }
    "5" {
        Write-Host "`n📚 Documentación disponible:" -ForegroundColor Yellow
        Write-Host "- team-setup/README.md: Guía principal" -ForegroundColor Cyan
        Write-Host "- team-setup/docs/CONTRIBUTING.md: Guía de contribución" -ForegroundColor Cyan
        Write-Host "- team-setup/docs/ONBOARDING.md: Checklist para nuevos miembros" -ForegroundColor Cyan
        Write-Host "- team-setup/docs/REMOTE-WORK.md: Guía para trabajo remoto" -ForegroundColor Cyan
        Write-Host "- team-setup/templates/: Plantillas para commits y PRs" -ForegroundColor Cyan
    }
    default {
        Write-Host "`n❌ Opción no válida. Ejecuta el script nuevamente." -ForegroundColor Red
    }
}

Write-Host "`n✨ ¡Listo!" -ForegroundColor Green
