# Script para reiniciar Expo limpiando todo
# Ejecutar: .\reiniciar-expo.ps1

Write-Host "Reiniciando Expo con limpieza completa..." -ForegroundColor Cyan

# Detener procesos en puerto 8081
Write-Host ""
Write-Host "1. Deteniendo procesos en puerto 8081..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "   Deteniendo proceso PID: $pid" -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "   Procesos detenidos" -ForegroundColor Green
} else {
    Write-Host "   No hay procesos corriendo" -ForegroundColor Green
}

# Limpiar cache
Write-Host ""
Write-Host "2. Limpiando cache..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\.expo") {
    Remove-Item -Recurse -Force "$PSScriptRoot\.expo" -ErrorAction SilentlyContinue
}
if (Test-Path "$PSScriptRoot\.metro") {
    Remove-Item -Recurse -Force "$PSScriptRoot\.metro" -ErrorAction SilentlyContinue
}
Write-Host "   Cache limpiada" -ForegroundColor Green

# Iniciar Expo
Write-Host ""
Write-Host "3. Iniciando Expo..." -ForegroundColor Yellow
Write-Host "   Espera a que aparezca el QR code..." -ForegroundColor Gray
Write-Host ""

# Iniciar en background para que el usuario pueda seguir usando la terminal
$command = "cd '$PSScriptRoot'; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $command -WindowStyle Normal

Write-Host "Expo iniciado en una nueva ventana" -ForegroundColor Green
Write-Host ""
Write-Host "Si la app no carga en tu iPhone:" -ForegroundColor Cyan
Write-Host "   1. Cierra completamente Expo Go (desliza hacia arriba)" -ForegroundColor White
Write-Host "   2. Abre Expo Go de nuevo" -ForegroundColor White
Write-Host "   3. Escanea el nuevo QR code" -ForegroundColor White
