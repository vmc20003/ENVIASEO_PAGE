# Script con comandos Git comunes para el equipo
param(
    [Parameter(Mandatory=$false)]
    [string]$Action = "help"
)

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $projectRoot

function Show-Help {
    Write-Host "🔧 Comandos Git para el Equipo" -ForegroundColor Green
    Write-Host "`nUso: .\git-workflow.ps1 -Action <comando>" -ForegroundColor Yellow
    Write-Host "`nComandos disponibles:" -ForegroundColor Cyan

    Write-Host "`n📋 Información:" -ForegroundColor Yellow
    Write-Host "  status     - Ver estado del repositorio" -ForegroundColor White
    Write-Host "  log        - Ver historial de commits" -ForegroundColor White
    Write-Host "  branches   - Ver todas las ramas" -ForegroundColor White

    Write-Host "`n🔄 Sincronización:" -ForegroundColor Yellow
    Write-Host "  pull       - Actualizar desde remoto" -ForegroundColor White
    Write-Host "  push       - Subir cambios al remoto" -ForegroundColor White
    Write-Host "  sync       - Pull + Push" -ForegroundColor White

    Write-Host "`n🌿 Ramas:" -ForegroundColor Yellow
    Write-Host "  new-feature <nombre> - Crear nueva rama de feature" -ForegroundColor White
    Write-Host "  switch <rama>        - Cambiar a una rama" -ForegroundColor White
    Write-Host "  delete-branch <rama> - Eliminar rama local" -ForegroundColor White

    Write-Host "`n💾 Commits:" -ForegroundColor Yellow
    Write-Host "  add-all    - Agregar todos los cambios" -ForegroundColor White
    Write-Host "  commit <mensaje> - Hacer commit con mensaje" -ForegroundColor White
    Write-Host "  quick-commit <mensaje> - Add + Commit" -ForegroundColor White

    Write-Host "`n🔍 Diagnóstico:" -ForegroundColor Yellow
    Write-Host "  check      - Verificar configuración" -ForegroundColor White
    Write-Host "  conflicts  - Verificar conflictos" -ForegroundColor White
}

function Show-Status {
    Write-Host "📋 Estado del Repositorio" -ForegroundColor Green
    git status
}

function Show-Log {
    Write-Host "📜 Historial de Commits" -ForegroundColor Green
    git log --oneline -10
}

function Show-Branches {
    Write-Host "🌿 Ramas Disponibles" -ForegroundColor Green
    git branch -a
}

function Pull-Changes {
    Write-Host "⬇️  Actualizando desde remoto..." -ForegroundColor Yellow
    git pull origin main
}

function Push-Changes {
    Write-Host "⬆️  Subiendo cambios al remoto..." -ForegroundColor Yellow
    git push origin main
}

function Sync-Repository {
    Write-Host "🔄 Sincronizando repositorio..." -ForegroundColor Yellow
    git pull origin main
    git push origin main
}

function New-FeatureBranch {
    param([string]$BranchName)
    if (-not $BranchName) {
        Write-Host "❌ Debes especificar un nombre para la rama" -ForegroundColor Red
        return
    }
    Write-Host "🌿 Creando nueva rama: feature/$BranchName" -ForegroundColor Yellow
    git checkout -b "feature/$BranchName"
}

function Switch-Branch {
    param([string]$BranchName)
    if (-not $BranchName) {
        Write-Host "❌ Debes especificar el nombre de la rama" -ForegroundColor Red
        return
    }
    Write-Host "🔄 Cambiando a rama: $BranchName" -ForegroundColor Yellow
    git checkout $BranchName
}

function Delete-Branch {
    param([string]$BranchName)
    if (-not $BranchName) {
        Write-Host "❌ Debes especificar el nombre de la rama" -ForegroundColor Red
        return
    }
    Write-Host "🗑️  Eliminando rama: $BranchName" -ForegroundColor Yellow
    git branch -d $BranchName
}

function Add-All {
    Write-Host "➕ Agregando todos los cambios..." -ForegroundColor Yellow
    git add .
}

function Commit-Changes {
    param([string]$Message)
    if (-not $Message) {
        Write-Host "❌ Debes especificar un mensaje de commit" -ForegroundColor Red
        return
    }
    Write-Host "💾 Haciendo commit: $Message" -ForegroundColor Yellow
    git commit -m $Message
}

function Quick-Commit {
    param([string]$Message)
    if (-not $Message) {
        Write-Host "❌ Debes especificar un mensaje de commit" -ForegroundColor Red
        return
    }
    Write-Host "⚡ Commit rápido: $Message" -ForegroundColor Yellow
    git add .
    git commit -m $Message
}

function Check-Configuration {
    Write-Host "🔍 Verificando configuración..." -ForegroundColor Green

    $gitUser = git config user.name
    $gitEmail = git config user.email
    $remoteUrl = git config --get remote.origin.url

    Write-Host "Usuario: $gitUser" -ForegroundColor Cyan
    Write-Host "Email: $gitEmail" -ForegroundColor Cyan
    Write-Host "Remoto: $remoteUrl" -ForegroundColor Cyan

    if (-not $gitUser -or -not $gitEmail) {
        Write-Host "⚠️  Git no está configurado completamente" -ForegroundColor Yellow
    }

    if (-not $remoteUrl) {
        Write-Host "⚠️  No hay repositorio remoto configurado" -ForegroundColor Yellow
    }
}

function Check-Conflicts {
    Write-Host "🔍 Verificando conflictos..." -ForegroundColor Green
    $status = git status --porcelain
    if ($status -match "^UU") {
        Write-Host "❌ Hay conflictos de merge sin resolver" -ForegroundColor Red
        git status
    } else {
        Write-Host "✅ No hay conflictos detectados" -ForegroundColor Green
    }
}

# Ejecutar comando según el parámetro
switch ($Action) {
    "help" { Show-Help }
    "status" { Show-Status }
    "log" { Show-Log }
    "branches" { Show-Branches }
    "pull" { Pull-Changes }
    "push" { Push-Changes }
    "sync" { Sync-Repository }
    "new-feature" {
        $branchName = Read-Host "Nombre de la nueva feature"
        New-FeatureBranch $branchName
    }
    "switch" {
        $branchName = Read-Host "Nombre de la rama"
        Switch-Branch $branchName
    }
    "delete-branch" {
        $branchName = Read-Host "Nombre de la rama a eliminar"
        Delete-Branch $branchName
    }
    "add-all" { Add-All }
    "commit" {
        $message = Read-Host "Mensaje del commit"
        Commit-Changes $message
    }
    "quick-commit" {
        $message = Read-Host "Mensaje del commit"
        Quick-Commit $message
    }
    "check" { Check-Configuration }
    "conflicts" { Check-Conflicts }
    default {
        Write-Host "❌ Comando no reconocido: $Action" -ForegroundColor Red
        Show-Help
    }
}
