# Script para probar el despliegue en Render
Write-Host "Probando despliegue en Render..." -ForegroundColor Green

$backendUrl = "https://alcaldia-backend.onrender.com"
$frontendUrl = "https://alcaldia-frontend.onrender.com"

Write-Host "`nProbando Backend:" -ForegroundColor Yellow
Write-Host "URL: $backendUrl" -ForegroundColor Cyan

# Probar diferentes endpoints del backend
$endpoints = @("/", "/health", "/test", "/stats")

foreach ($endpoint in $endpoints) {
    $fullUrl = $backendUrl + $endpoint
    Write-Host "`nProbando: $endpoint" -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method GET -TimeoutSec 10
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Gray
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nProbando Frontend:" -ForegroundColor Yellow
Write-Host "URL: $frontendUrl" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 10
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Frontend cargado correctamente" -ForegroundColor Green
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDiagnostico completado" -ForegroundColor Green
