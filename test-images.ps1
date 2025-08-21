Write-Host "=== VERIFICANDO IMAGENES DEL FRONTEND ===" -ForegroundColor Green

$frontendUrl = "https://alcaldia-frontend.onrender.com"
$images = @(
    "/logo_sistema.jpg",
    "/fondonew.jpg", 
    "/logo_enviaseo.png",
    "/fondo.jpg"
)

Write-Host "`nProbando frontend: $frontendUrl" -ForegroundColor Yellow

foreach ($image in $images) {
    $fullUrl = $frontendUrl + $image
    Write-Host "`nProbando imagen: $image" -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Status: $($response.StatusCode) - Imagen cargada correctamente" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Status: $($response.StatusCode) - Problema con la imagen" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n📋 Resumen:" -ForegroundColor Yellow
Write-Host "Si todas las imágenes muestran Status 200, están funcionando correctamente." -ForegroundColor White
Write-Host "Si hay errores 404, el problema está en la configuración de Render." -ForegroundColor White
Write-Host "`n💡 Solución aplicada: Cambié staticPublishPath de 'dist' a 'build'" -ForegroundColor Cyan

Write-Host "`nVerificación completada" -ForegroundColor Green
