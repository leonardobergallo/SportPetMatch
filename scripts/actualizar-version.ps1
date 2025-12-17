# Script para actualizar la versión de la app

param(
    [Parameter(Mandatory=$true)]
    [string]$NuevaVersion,
    
    [Parameter(Mandatory=$false)]
    [int]$BuildNumber = 0
)

Write-Host "📝 Actualizando versión de la app..." -ForegroundColor Cyan

$appJsonPath = "frontend\app.json"

if (-not (Test-Path $appJsonPath)) {
    Write-Host "❌ Error: No se encontró app.json" -ForegroundColor Red
    exit 1
}

# Leer app.json
$appJson = Get-Content $appJsonPath | ConvertFrom-Json

# Actualizar versión
$appJson.expo.version = $NuevaVersion
Write-Host "✅ Versión actualizada a: $NuevaVersion" -ForegroundColor Green

# Actualizar buildNumber de iOS
if ($BuildNumber -gt 0) {
    $appJson.expo.ios.buildNumber = $BuildNumber.ToString()
    Write-Host "✅ iOS buildNumber actualizado a: $BuildNumber" -ForegroundColor Green
} else {
    # Incrementar automáticamente
    $currentBuild = [int]$appJson.expo.ios.buildNumber
    $newBuild = $currentBuild + 1
    $appJson.expo.ios.buildNumber = $newBuild.ToString()
    Write-Host "✅ iOS buildNumber incrementado a: $newBuild" -ForegroundColor Green
}

# Actualizar versionCode de Android
if ($BuildNumber -gt 0) {
    $appJson.expo.android.versionCode = $BuildNumber
    Write-Host "✅ Android versionCode actualizado a: $BuildNumber" -ForegroundColor Green
} else {
    # Incrementar automáticamente
    $currentVersionCode = $appJson.expo.android.versionCode
    $newVersionCode = $currentVersionCode + 1
    $appJson.expo.android.versionCode = $newVersionCode
    Write-Host "✅ Android versionCode incrementado a: $newVersionCode" -ForegroundColor Green
}

# Guardar cambios
$appJson | ConvertTo-Json -Depth 10 | Set-Content $appJsonPath

Write-Host ""
Write-Host "📋 Resumen de cambios:" -ForegroundColor Cyan
Write-Host "   Versión: $($appJson.expo.version)" -ForegroundColor White
Write-Host "   iOS buildNumber: $($appJson.expo.ios.buildNumber)" -ForegroundColor White
Write-Host "   Android versionCode: $($appJson.expo.android.versionCode)" -ForegroundColor White
Write-Host ""
Write-Host "✅ Versión actualizada exitosamente!" -ForegroundColor Green

