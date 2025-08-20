# Script para verificar el despliegue completo en Render
Write-Host "=== VERIFICACION COMPLETA DEL DESPLIEGUE ===" -ForegroundColor Green

$backendUrl = "https://pagina-valeria-enviaseo.onrender.com"
$frontendUrl = "https://alcaldia-frontend.onrender.com"

Write-Host "`n1. PROBANDO BACKEND..." -ForegroundColor Yellow
Write-Host "URL: $backendUrl" -ForegroundColor Cyan

# Endpoints del backend
$endpoints = @("/", "/health", "/stats", "/files")
$backendOK = $true

foreach ($endpoint in $endpoints) {
    $fullUrl = $backendUrl + $endpoint
    Write-Host "`n  Probando: $endpoint" -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -TimeoutSec 10
        Write-Host "  Status: $($response.StatusCode)" -ForegroundColor Green
    }
    catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        $backendOK = $false
    }
}

Write-Host "`n2. PROBANDO FRONTEND..." -ForegroundColor Yellow
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

Write-Host "`n3. RESUMEN FINAL..." -ForegroundColor Yellow

if ($backendOK -and $frontendOK) {
    Write-Host "DESPLIEGUE EXITOSO - Todo funcionando correctamente!" -ForegroundColor Green
    Write-Host "`nURLs de acceso:" -ForegroundColor Cyan
    Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
    Write-Host "  Backend API: $backendUrl" -ForegroundColor White
} else {
    Write-Host "HAY PROBLEMAS EN EL DESPLIEGUE" -ForegroundColor Red
}

Write-Host "`nVERIFICACION COMPLETADA" -ForegroundColor Green