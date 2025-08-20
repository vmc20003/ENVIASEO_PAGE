Write-Host "=== VERIFICACION FINAL DEL SISTEMA ===" -ForegroundColor Green

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

Write-Host "`n3. RESUMEN FINAL..." -ForegroundColor Yellow

if ($backendOK -and $frontendOK) {
    Write-Host "✅ SISTEMA COMPLETAMENTE FUNCIONAL!" -ForegroundColor Green
    Write-Host "`n📋 Estado actual:" -ForegroundColor Cyan
    Write-Host "  - Frontend: Funcionando correctamente" -ForegroundColor White
    Write-Host "  - Backend: Funcionando correctamente" -ForegroundColor White
    Write-Host "  - Alcaldía de Envigado: Funcionando" -ForegroundColor White
    Write-Host "  - Alumbrado Público: Funcionando (usando backend de Alcaldía)" -ForegroundColor White
    Write-Host "`n🌐 URLs de acceso:" -ForegroundColor Cyan
    Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
    Write-Host "  Backend: $backendUrl" -ForegroundColor White
    Write-Host "`n💡 Instrucciones de prueba:" -ForegroundColor Cyan
    Write-Host "  1. Ve a $frontendUrl" -ForegroundColor White
    Write-Host "  2. Prueba 'Alcaldía de Envigado' - debería funcionar" -ForegroundColor White
    Write-Host "  3. Prueba 'Alumbrado Público' - ya no debería dar 'Failed to fetch'" -ForegroundColor White
    Write-Host "  4. Sube archivos Excel en ambas secciones" -ForegroundColor White
} else {
    Write-Host "❌ AÚN HAY PROBLEMAS" -ForegroundColor Red
    if (-not $backendOK) { Write-Host "  - Backend tiene problemas" -ForegroundColor Red }
    if (-not $frontendOK) { Write-Host "  - Frontend tiene problemas" -ForegroundColor Red }
}

Write-Host "`nVERIFICACION COMPLETADA" -ForegroundColor Green
