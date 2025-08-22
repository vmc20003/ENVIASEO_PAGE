# Script para iniciar el servidor principal en background
Write-Host "Iniciando servidor principal..." -ForegroundColor Green

# Iniciar el servidor en background
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden

# Esperar a que el servidor se inicie
Write-Host "Esperando que el servidor se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Probar el servidor
Write-Host "Probando el servidor principal..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET
    Write-Host "Servidor principal funcionando correctamente!" -ForegroundColor Green
    Write-Host "Respuesta: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error conectando al servidor: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "El servidor principal esta ejecutandose en http://localhost:4000" -ForegroundColor Cyan
