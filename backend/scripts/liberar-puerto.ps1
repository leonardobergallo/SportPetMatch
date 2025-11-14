# Script PowerShell para liberar el puerto 3000
# Ejecuta: .\scripts\liberar-puerto.ps1

param(
    [int]$Puerto = 3000
)

Write-Host "🔍 Buscando procesos usando el puerto $Puerto..." -ForegroundColor Cyan

# Buscar procesos usando el puerto
$procesos = Get-NetTCPConnection -LocalPort $Puerto -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($null -eq $procesos -or $procesos.Count -eq 0) {
    Write-Host "✅ El puerto $Puerto está libre." -ForegroundColor Green
    exit 0
}

Write-Host "🔴 Encontrados $($procesos.Count) proceso(s) usando el puerto $Puerto:" -ForegroundColor Red

foreach ($pid in $procesos) {
    $proceso = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($proceso) {
        Write-Host "   - PID: $pid ($($proceso.ProcessName))" -ForegroundColor Yellow
    } else {
        Write-Host "   - PID: $pid" -ForegroundColor Yellow
    }
}

# Preguntar confirmación
$confirmacion = Read-Host "¿Deseas terminar estos procesos? (S/N)"

if ($confirmacion -eq "S" -or $confirmacion -eq "s") {
    foreach ($pid in $procesos) {
        try {
            Write-Host "🛑 Terminando proceso $pid..." -ForegroundColor Yellow
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "✅ Proceso $pid terminado." -ForegroundColor Green
        } catch {
            Write-Host "⚠️  No se pudo terminar el proceso $pid: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 1
    
    # Verificar que el puerto esté libre
    $verificacion = Get-NetTCPConnection -LocalPort $Puerto -ErrorAction SilentlyContinue
    if ($null -eq $verificacion) {
        Write-Host "✅ El puerto $Puerto está ahora libre." -ForegroundColor Green
    } else {
        Write-Host "⚠️  El puerto $Puerto todavía está en uso." -ForegroundColor Red
    }
} else {
    Write-Host "❌ Operación cancelada." -ForegroundColor Red
}


