# Script para crear build de Android con EAS

Write-Host "🤖 Creando build de Android..." -ForegroundColor Cyan

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

# Preguntar tipo de build
Write-Host ""
Write-Host "¿Qué tipo de build quieres crear?" -ForegroundColor Cyan
Write-Host "1. Preview (APK - para probar)" -ForegroundColor White
Write-Host "2. Production (AAB - para Google Play)" -ForegroundColor White
$choice = Read-Host "Selecciona (1 o 2)"

if ($choice -eq "1") {
    Write-Host "📱 Creando build Preview (APK)..." -ForegroundColor Yellow
    eas build --platform android --profile preview
} elseif ($choice -eq "2") {
    Write-Host "📱 Creando build Production (AAB)..." -ForegroundColor Yellow
    eas build --platform android --profile production
} else {
    Write-Host "❌ Opción inválida" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build iniciado! Revisa el progreso en: https://expo.dev" -ForegroundColor Green
Write-Host "📧 Recibirás un email cuando el build esté listo." -ForegroundColor Green

