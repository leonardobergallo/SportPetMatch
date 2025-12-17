# Script para inicializar EAS en el proyecto

Write-Host "🚀 Inicializando EAS para SportPetMatch..." -ForegroundColor Cyan

Set-Location frontend

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "app.json")) {
    Write-Host "❌ Error: No se encontró app.json. Asegúrate de estar en el directorio frontend." -ForegroundColor Red
    exit 1
}

# Verificar que EAS CLI está instalado
if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
    Write-Host "📦 EAS CLI no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g eas-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar EAS CLI" -ForegroundColor Red
        exit 1
    }
}

# Verificar que está logueado
Write-Host "🔐 Verificando sesión de EAS..." -ForegroundColor Yellow
$loggedIn = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No estás logueado en EAS." -ForegroundColor Yellow
    Write-Host "📝 Iniciando sesión..." -ForegroundColor Yellow
    eas login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al iniciar sesión" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Ya estás logueado en EAS" -ForegroundColor Green
}

# Inicializar EAS
Write-Host ""
Write-Host "🔧 Inicializando proyecto EAS..." -ForegroundColor Yellow
eas init

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ EAS inicializado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Copia el projectId de app.json" -ForegroundColor White
    Write-Host "   2. Actualiza eas.json si es necesario" -ForegroundColor White
    Write-Host "   3. Ejecuta: .\scripts\build-app-android.ps1 para crear un build" -ForegroundColor White
} else {
    Write-Host "❌ Error al inicializar EAS" -ForegroundColor Red
    exit 1
}

