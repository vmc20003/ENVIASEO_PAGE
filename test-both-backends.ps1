# Script para probar ambos backends
Write-Host "=== PRUEBA DE AMBOS BACKENDS ===" -ForegroundColor Green

$alcaldiaBackendUrl = "https://pagina-valeria-enviaseo.onrender.com"
$alumbradoBackendUrl = "https://alumbrado-backend.onrender.com"
$frontendUrl = "https://alcaldia-frontend.onrender.com"

Write-Host "`n1. PROBANDO BACKEND ALCALDIA..." -ForegroundColor Yellow
Write-Host "URL: $alcaldiaBackendUrl" -ForegroundColor Cyan

$alcaldiaEndpoints = @("/", "/health", "/stats")
$alcaldiaOK = $true

foreach ($endpoint in $alcaldiaEndpoints) {
    $fullUrl = $alcaldiaBackendUrl + $endpoint
    Write-Host "`n  Probando: $endpoint" -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -TimeoutSec 10
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $alcaldiaOK = $false
    }
}

Write-Host "`n2. PROBANDO BACKEND ALUMBRADO..." -ForegroundColor Yellow
Write-Host "URL: $alumbradoBackendUrl" -ForegroundColor Cyan

$alumbradoEndpoints = @("/", "/health", "/stats")
$alumbradoOK = $true

foreach ($endpoint in $alumbradoEndpoints) {
    $fullUrl = $alumbradoBackendUrl + $endpoint
    Write-Host "`n  Probando: $endpoint" -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -TimeoutSec 10
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $alumbradoOK = $false
    }
}

Write-Host "`n3. PROBANDO FRONTEND..." -ForegroundColor Yellow
Write-Host "URL: $frontendUrl" -ForegroundColor Cyan

$frontendOK = $true
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
    Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    $frontendOK = $false
}

Write-Host "`n4. RESUMEN FINAL..." -ForegroundColor Yellow

if ($alcaldiaOK -and $alumbradoOK -and $frontendOK) {
    Write-Host "TODOS LOS SERVICIOS FUNCIONANDO CORRECTAMENTE!" -ForegroundColor Green
    Write-Host "`nURLs de acceso:" -ForegroundColor Cyan
    Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
    Write-Host "  Backend Alcaldía: $alcaldiaBackendUrl" -ForegroundColor White
    Write-Host "  Backend Alumbrado: $alumbradoBackendUrl" -ForegroundColor White
} else {
    Write-Host "HAY PROBLEMAS EN ALGUNOS SERVICIOS" -ForegroundColor Red
    if (-not $alcaldiaOK) { Write-Host "  - Backend Alcaldía tiene problemas" -ForegroundColor Red }
    if (-not $alumbradoOK) { Write-Host "  - Backend Alumbrado tiene problemas" -ForegroundColor Red }
    if (-not $frontendOK) { Write-Host "  - Frontend tiene problemas" -ForegroundColor Red }
}

Write-Host "`nPRUEBA COMPLETADA" -ForegroundColor Green
