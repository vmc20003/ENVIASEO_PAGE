# Stop all servers
Write-Host "Deteniendo todos los servidores..." -ForegroundColor Red

# Detener todos los jobs de PowerShell
$jobs = Get-Job
if ($jobs) {
    Write-Host "Deteniendo $($jobs.Count) servidores..." -ForegroundColor Yellow
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "Todos los servidores han sido detenidos." -ForegroundColor Green
} else {
    Write-Host "No hay servidores ejecutándose." -ForegroundColor Yellow
}

# También intentar matar procesos de Node.js si quedan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Deteniendo procesos de Node.js restantes..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force
    Write-Host "Procesos de Node.js detenidos." -ForegroundColor Green
}

Write-Host "Limpieza completada." -ForegroundColor Green
