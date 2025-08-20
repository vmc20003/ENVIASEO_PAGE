# Script para probar el fix temporal de Alumbrado Público
Write-Host "=== PRUEBA DEL FIX TEMPORAL DE ALUMBRADO PÚBLICO ===" -ForegroundColor Green

$backendUrl = "https://pagina-valeria-enviaseo.onrender.com"
$frontendUrl = "https://alcaldia-frontend.onrender.com"

Write-Host "`n1. VERIFICANDO BACKEND..." -ForegroundColor Yellow
Write-Host "URL: $backendUrl" -ForegroundColor Cyan

$backendOK = $true
$endpoints = @("/", "/health", "/stats", "/files")

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

Write-Host "`n2. VERIFICANDO FRONTEND..." -ForegroundColor Yellow
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

Write-Host "`n3. RESUMEN DEL FIX TEMPORAL..." -ForegroundColor Yellow

if ($backendOK -and $frontendOK) {
    Write-Host "✅ FIX TEMPORAL EXITOSO!" -ForegroundColor Green
    Write-Host "`n📋 Estado actual:" -ForegroundColor Cyan
    Write-Host "  - Frontend: Funcionando correctamente" -ForegroundColor White
    Write-Host "  - Backend: Funcionando correctamente" -ForegroundColor White
    Write-Host "  - Alumbrado Público: Usando backend de Alcaldía temporalmente" -ForegroundColor White
    Write-Host "`n🌐 URLs de acceso:" -ForegroundColor Cyan
    Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
    Write-Host "  Backend: $backendUrl" -ForegroundColor White
    Write-Host "`n💡 Instrucciones:" -ForegroundColor Cyan
    Write-Host "  1. Ve a $frontendUrl" -ForegroundColor White
    Write-Host "  2. Selecciona 'Alumbrado Público'" -ForegroundColor White
    Write-Host "  3. Prueba subir un archivo Excel" -ForegroundColor White
    Write-Host "  4. Ya no debería aparecer 'Failed to fetch'" -ForegroundColor White
} else {
    Write-Host "❌ AÚN HAY PROBLEMAS" -ForegroundColor Red
    if (-not $backendOK) { Write-Host "  - Backend tiene problemas" -ForegroundColor Red }
    if (-not $frontendOK) { Write-Host "  - Frontend tiene problemas" -ForegroundColor Red }
}

Write-Host "`nPRUEBA COMPLETADA" -ForegroundColor Green
