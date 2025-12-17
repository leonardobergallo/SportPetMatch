# Script para subir app a Google Play Store usando EAS Submit

Write-Host "📱 Subiendo app a Google Play Store..." -ForegroundColor Cyan

Set-Location frontend

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "app.json")) {
    Write-Host "❌ Error: No se encontró app.json. Asegúrate de estar en el directorio frontend." -ForegroundColor Red
    exit 1
}

# Verificar que EAS CLI está instalado
if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
    Write-Host "❌ EAS CLI no está instalado. Instálalo con: npm install -g eas-cli" -ForegroundColor Red
    exit 1
}

# Verificar que está logueado
Write-Host "🔐 Verificando sesión de EAS..." -ForegroundColor Yellow
$loggedIn = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No estás logueado en EAS. Ejecuta: eas login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "⚠️  IMPORTANTE: Antes de continuar, asegúrate de:" -ForegroundColor Yellow
Write-Host "   1. Tener una cuenta de Google Play Console activa" -ForegroundColor White
Write-Host "   2. Haber creado la app en Google Play Console" -ForegroundColor White
Write-Host "   3. Haber configurado el servicio de cuenta en eas.json" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "¿Continuar? (s/n)"

if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Cancelado" -ForegroundColor Red
    exit 0
}

Write-Host "📤 Subiendo build a Google Play..." -ForegroundColor Yellow
eas submit --platform android

Write-Host ""
Write-Host "✅ Submit completado! Revisa el estado en Google Play Console." -ForegroundColor Green

