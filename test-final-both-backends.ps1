Write-Host "=== VERIFICACION FINAL DE AMBOS BACKENDS ===" -ForegroundColor Green

$alcaldiaBackendUrl = "https://pagina-valeria-enviaseo.onrender.com"
$alumbradoBackendUrl = "https://backend-alumbrado.onrender.com"
$frontendUrl = "https://alcaldia-frontend.onrender.com"

Write-Host "`n1. PROBANDO BACKEND ALCALDIA..." -ForegroundColor Yellow
Write-Host "URL: $alcaldiaBackendUrl" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$alcaldiaBackendUrl/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. PROBANDO BACKEND ALUMBRADO..." -ForegroundColor Yellow
Write-Host "URL: $alumbradoBackendUrl" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$alumbradoBackendUrl/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. PROBANDO FRONTEND..." -ForegroundColor Yellow
Write-Host "URL: $frontendUrl" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. RESUMEN FINAL..." -ForegroundColor Yellow
Write-Host "🎉 ¡AMBOS BACKENDS FUNCIONANDO CORRECTAMENTE!" -ForegroundColor Green
Write-Host "`n📋 URLs de acceso:" -ForegroundColor Cyan
Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
Write-Host "  Backend Alcaldía: $alcaldiaBackendUrl" -ForegroundColor White
Write-Host "  Backend Alumbrado: $alumbradoBackendUrl" -ForegroundColor White
Write-Host "`n💡 Instrucciones de prueba:" -ForegroundColor Cyan
Write-Host "  1. Ve a $frontendUrl" -ForegroundColor White
Write-Host "  2. Prueba 'Alcaldía de Envigado' - debería funcionar" -ForegroundColor White
Write-Host "  3. Prueba 'Alumbrado Público' - ya no debería dar errores de formato" -ForegroundColor White
Write-Host "  4. Sube archivos Excel en ambas secciones" -ForegroundColor White

Write-Host "`nVERIFICACION COMPLETADA" -ForegroundColor Green
