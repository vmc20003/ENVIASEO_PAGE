Write-Host "=== VERIFICANDO BACKEND DE ALUMBRADO ===" -ForegroundColor Green

$alumbradoBackendUrl = "https://alumbrado-backend.onrender.com"

Write-Host "`nProbando: $alumbradoBackendUrl" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$alumbradoBackendUrl/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend de Alumbrado FUNCIONANDO!" -ForegroundColor Green
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)" -ForegroundColor Gray
    
    Write-Host "`n🎉 ¡Backend de Alumbrado listo!" -ForegroundColor Green
    Write-Host "Ahora puedes hacer commit y push para actualizar el frontend." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Backend de Alumbrado aún no está listo" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n💡 Instrucciones:" -ForegroundColor Yellow
    Write-Host "1. Ve a https://dashboard.render.com" -ForegroundColor White
    Write-Host "2. Crea un nuevo Web Service llamado 'alumbrado-backend'" -ForegroundColor White
    Write-Host "3. Configura: Build Command = 'cd backend && npm install'" -ForegroundColor White
    Write-Host "4. Configura: Start Command = 'cd backend && npm start'" -ForegroundColor White
    Write-Host "5. Agrega variables de entorno: NODE_ENV=production, PORT=10000" -ForegroundColor White
}

Write-Host "`nVerificación completada" -ForegroundColor Green
