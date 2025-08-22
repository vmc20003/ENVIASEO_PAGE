# Script para iniciar el servidor en background
Write-Host "Iniciando servidor de prueba..." -ForegroundColor Green

# Iniciar el servidor en background
Start-Process -FilePath "node" -ArgumentList "test-server.js" -WindowStyle Hidden

# Esperar a que el servidor se inicie
Write-Host "Esperando que el servidor se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Probar el servidor
Write-Host "Probando el servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET
    Write-Host "Servidor funcionando correctamente!" -ForegroundColor Green
    Write-Host "Respuesta: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Error conectando al servidor: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "El servidor esta ejecutandose en http://localhost:3001" -ForegroundColor Cyan
