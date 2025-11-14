# Script para actualizar Expo SDK de 50 a 54
Write-Host "🔄 Actualizando Expo SDK de 50 a 54..." -ForegroundColor Cyan

# Paso 1: Eliminar node_modules y package-lock.json
Write-Host "`n1️⃣ Eliminando node_modules y package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "   ✓ node_modules eliminado" -ForegroundColor Green
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "   ✓ package-lock.json eliminado" -ForegroundColor Green
}

# Paso 2: Instalar Expo SDK 54
Write-Host "`n2️⃣ Instalando Expo SDK 54..." -ForegroundColor Yellow
npm install expo@~54.0.0

# Paso 3: Actualizar todas las dependencias de Expo
Write-Host "`n3️⃣ Actualizando todas las dependencias de Expo a SDK 54..." -ForegroundColor Yellow
npx expo install --fix

Write-Host "`n✅ ¡Actualización completada!" -ForegroundColor Green
Write-Host "`n📱 Ahora puedes ejecutar: npm start" -ForegroundColor Cyan

