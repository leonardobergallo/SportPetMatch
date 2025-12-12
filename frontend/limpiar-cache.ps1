# Script para limpiar completamente la caché de Expo y Metro
# Ejecutar: .\limpiar-cache.ps1

Write-Host "🧹 Limpiando caché de Expo y Metro..." -ForegroundColor Cyan

# Detener procesos de Node/Expo en el puerto 8081
Write-Host "`n1️⃣ Deteniendo procesos en puerto 8081..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($pid in $processes) {
        Write-Host "   Deteniendo proceso PID: $pid" -ForegroundColor Gray
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "   ✓ No hay procesos corriendo en el puerto 8081" -ForegroundColor Green
}

# Limpiar caché de Metro
Write-Host "`n2️⃣ Limpiando caché de Metro..." -ForegroundColor Yellow
if (Test-Path "$PSScriptRoot\.expo") {
    Remove-Item -Recurse -Force "$PSScriptRoot\.expo" -ErrorAction SilentlyContinue
    Write-Host "   ✓ Caché de .expo eliminada" -ForegroundColor Green
}

if (Test-Path "$PSScriptRoot\.metro") {
    Remove-Item -Recurse -Force "$PSScriptRoot\.metro" -ErrorAction SilentlyContinue
    Write-Host "   ✓ Caché de .metro eliminada" -ForegroundColor Green
}

# Limpiar node_modules/.cache si existe
if (Test-Path "$PSScriptRoot\node_modules\.cache") {
    Remove-Item -Recurse -Force "$PSScriptRoot\node_modules\.cache" -ErrorAction SilentlyContinue
    Write-Host "   ✓ Caché de node_modules eliminada" -ForegroundColor Green
}

# Limpiar watchman (si está instalado)
Write-Host "`n3️⃣ Limpiando Watchman (si está instalado)..." -ForegroundColor Yellow
$watchman = Get-Command watchman -ErrorAction SilentlyContinue
if ($watchman) {
    watchman watch-del-all 2>$null
    Write-Host "   ✓ Watchman limpiado" -ForegroundColor Green
} else {
    Write-Host "   ℹ Watchman no está instalado (opcional)" -ForegroundColor Gray
}

Write-Host "`n✅ Limpieza completada!" -ForegroundColor Green
Write-Host "`n🚀 Ahora puedes iniciar Expo con:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host "   o" -ForegroundColor Gray
Write-Host "   npx expo start --clear" -ForegroundColor White

