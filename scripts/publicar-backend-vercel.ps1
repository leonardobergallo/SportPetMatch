# Script PowerShell para publicar el backend en Vercel

Write-Host "🚀 Publicando backend en Vercel..." -ForegroundColor Cyan

Set-Location backend

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio backend." -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

# Hacer build
Write-Host "🔨 Construyendo proyecto..." -ForegroundColor Yellow
npm run build

# Verificar que el build fue exitoso
if (-not (Test-Path "dist")) {
    Write-Host "❌ Error: El build falló. No se encontró el directorio dist." -ForegroundColor Red
    exit 1
}

# Verificar que vercel.json existe
if (-not (Test-Path "vercel.json")) {
    Write-Host "❌ Error: No se encontró vercel.json" -ForegroundColor Red
    exit 1
}

# Publicar en Vercel
Write-Host "🌐 Publicando en Vercel..." -ForegroundColor Yellow
if (Get-Command vercel -ErrorAction SilentlyContinue) {
    vercel --prod
} else {
    Write-Host "⚠️  Vercel CLI no está instalado. Instálalo con: npm install -g vercel" -ForegroundColor Yellow
    Write-Host "📝 O publica manualmente desde https://vercel.com" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Backend publicado exitosamente!" -ForegroundColor Green

