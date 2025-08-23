# Script para limpiar servicios redundantes en Render
# Ejecutar este script DESPUES de actualizar render.yaml

Write-Host "LIMPIEZA DE SERVICIOS RENDER - ELIMINANDO REDUNDANCIAS" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "SERVICIOS QUE SE MANTENDRAN:" -ForegroundColor Green
Write-Host "   alcaldia-backend (puerto 4001)" -ForegroundColor Green
Write-Host "   alumbrado-backend (puerto 4000)" -ForegroundColor Green
Write-Host "   alcaldia-frontend (puerto 3000)" -ForegroundColor Green

Write-Host ""
Write-Host "SERVICIOS QUE DEBEN ELIMINARSE MANUALMENTE:" -ForegroundColor Red
Write-Host "   Alcaldia-Frontend (Static - redundante)" -ForegroundColor Red
Write-Host "   Backend Alumbrado (redundante con alumbrado-backend)" -ForegroundColor Red
Write-Host "   Pagina-Valeria-Enviaseo (no necesario)" -ForegroundColor Red

Write-Host ""
Write-Host "PASOS PARA LIMPIAR:" -ForegroundColor Yellow
Write-Host "1. Ve a https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Elimina manualmente los servicios redundantes:" -ForegroundColor White
Write-Host "   - Alcaldia-Frontend (Static)" -ForegroundColor White
Write-Host "   - Backend Alumbrado" -ForegroundColor White
Write-Host "   - Pagina-Valeria-Enviaseo" -ForegroundColor White
Write-Host "3. Manten solo los 3 servicios esenciales" -ForegroundColor White

Write-Host ""
Write-Host "DESPUES DE LIMPIAR:" -ForegroundColor Yellow
Write-Host "1. Haz commit y push de este render.yaml actualizado" -ForegroundColor White
Write-Host "2. Render automaticamente actualizara los servicios restantes" -ForegroundColor White
Write-Host "3. Verifica que los 3 servicios funcionen correctamente" -ForegroundColor White

Write-Host ""
Write-Host "IMPORTANTE: No elimines los servicios hasta que confirmes que los 3 principales funcionan" -ForegroundColor Red
Write-Host ""

# Verificar que los servicios principales esten funcionando
Write-Host "VERIFICANDO SERVICIOS PRINCIPALES..." -ForegroundColor Cyan

$services = @(
    @{Name="alcaldia-backend"; URL="https://alcaldia-backend.onrender.com/health"},
    @{Name="alumbrado-backend"; URL="https://alumbrado-backend.onrender.com/health"},
    @{Name="alcaldia-frontend"; URL="https://alcaldia-frontend.onrender.com"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -Method GET -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "   $($service.Name): FUNCIONANDO" -ForegroundColor Green
        } else {
            Write-Host "   $($service.Name): Status $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   $($service.Name): ERROR - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "RESUMEN:" -ForegroundColor Cyan
Write-Host "   Mantener: 3 servicios esenciales" -ForegroundColor Green
Write-Host "   Eliminar: 3 servicios redundantes" -ForegroundColor Red
Write-Host "   Resultado: Sistema mas limpio y eficiente" -ForegroundColor Green

Write-Host ""
Write-Host "Script completado. Revisa los servicios antes de eliminar redundancias." -ForegroundColor Green
