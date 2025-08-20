# Check status of all servers
Write-Host "Estado de los servidores:" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Magenta

# Verificar jobs de PowerShell
$jobs = Get-Job
if ($jobs) {
    Write-Host "Jobs de PowerShell:" -ForegroundColor Yellow
    $jobs | Format-Table -AutoSize
    Write-Host ""
} else {
    Write-Host "No hay jobs de PowerShell ejecutándose." -ForegroundColor Yellow
    Write-Host ""
}

# Verificar procesos de Node.js
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Procesos de Node.js:" -ForegroundColor Yellow
    $nodeProcesses | Select-Object Id, ProcessName, StartTime | Format-Table -AutoSize
    Write-Host ""
} else {
    Write-Host "No hay procesos de Node.js ejecutándose." -ForegroundColor Yellow
    Write-Host ""
}

# Verificar puertos
Write-Host "Verificando puertos:" -ForegroundColor Yellow

$ports = @(3000, 4000, 4001)
foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "Puerto ${port}: OCUPADO" -ForegroundColor Green
    } else {
        Write-Host "Puerto ${port}: LIBRE" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "URLs de los servidores:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "Backend Principal: http://localhost:4000" -ForegroundColor White
Write-Host "Backend Alcaldia: http://localhost:4001" -ForegroundColor White
