# Script de PowerShell para probar subida de archivos
Write-Host "🧪 PRUEBAS DE SUBIDA DE ARCHIVOS" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Verificar que el archivo existe
if (-not (Test-Path "test_data.xlsx")) {
    Write-Host "❌ Error: Archivo test_data.xlsx no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivo test_data.xlsx encontrado" -ForegroundColor Green

# Backends a probar
$backends = @(
    @{
        name = "Backend Principal (Alumbrado)"
        url = "http://localhost:4000"
        uploadEndpoint = "/upload"
        healthEndpoint = "/health"
    },
    @{
        name = "Backend Enviaseo"
        url = "http://localhost:4001"
        uploadEndpoint = "/api/upload"
        healthEndpoint = "/api/health"
    },
    @{
        name = "Backend Alcaldía"
        url = "http://localhost:4002"
        uploadEndpoint = "/api/upload"
        healthEndpoint = "/health"
    }
)

# Función para probar salud del servidor
function Test-ServerHealth {
    param($backend)
    
    try {
        $response = Invoke-WebRequest -Uri "$($backend.url)$($backend.healthEndpoint)" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($backend.name): Salud OK" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $($backend.name): Error de salud $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $($backend.name): No disponible - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Función para probar subida de archivos
function Test-FileUpload {
    param($backend)
    
    try {
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $fileBytes = [System.IO.File]::ReadAllBytes("test_data.xlsx")
        $fileEnc = [System.Text.Encoding]::GetEncoding('UTF-8').GetString($fileBytes)
        
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"test_data.xlsx`"",
            "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "",
            $fileEnc,
            "--$boundary--$LF"
        ) -join $LF
        
        $response = Invoke-WebRequest -Uri "$($backend.url)$($backend.uploadEndpoint)" -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary" -TimeoutSec 30
        
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "✅ $($backend.name): Subida exitosa" -ForegroundColor Green
            Write-Host "   📊 Registros procesados: $($result.recordsProcessed)" -ForegroundColor White
            Write-Host "   📁 Total en BD: $($result.totalRecords)" -ForegroundColor White
            return $true
        } else {
            Write-Host "❌ $($backend.name): Error $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $($backend.name): Error de subida - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Ejecutar pruebas
$totalTests = 0
$passedTests = 0

Write-Host "`n📋 FASE 1: Verificación de Salud de Servidores" -ForegroundColor Yellow
foreach ($backend in $backends) {
    $totalTests++
    if (Test-ServerHealth $backend) {
        $passedTests++
    }
}

Write-Host "`n📋 FASE 2: Prueba de Subida de Archivos" -ForegroundColor Yellow
foreach ($backend in $backends) {
    $totalTests++
    if (Test-FileUpload $backend) {
        $passedTests++
    }
}

# Resumen final
Write-Host "`n📊 RESUMEN FINAL" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "✅ Pruebas exitosas: $passedTests/$totalTests" -ForegroundColor White
Write-Host "📈 Porcentaje de éxito: $([math]::Round(($passedTests/$totalTests)*100, 1))%" -ForegroundColor White

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Algunas pruebas fallaron. Revisar los errores arriba." -ForegroundColor Yellow
}


