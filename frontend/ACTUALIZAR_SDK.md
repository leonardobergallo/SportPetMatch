# 📱 Actualizar Expo SDK 50 → 54

## ❗ Problema
Tu Expo Go está en SDK 54, pero el proyecto usa SDK 50. Esto causa incompatibilidad.

## ✅ Solución

### Paso 1: Eliminar dependencias antiguas
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
```

### Paso 2: Instalar Expo SDK 54
```powershell
npm install expo@~54.0.0
```

### Paso 3: Actualizar TODAS las dependencias de Expo automáticamente
```powershell
npx expo install --fix
```

Este comando actualiza automáticamente todas las dependencias de `expo-*` a las versiones correctas para SDK 54.

### Paso 4: Reiniciar Expo
```powershell
npm start
```

## 🔍 Verificar
Después de instalar, verifica que Expo esté en SDK 54:
```powershell
npm list expo
```

Deberías ver algo como: `expo@54.x.x`

## ⚠️ Nota
Si aún ves el error, asegúrate de:
1. Cerrar completamente Expo Go en tu iPhone
2. Detener el servidor Expo (`Ctrl+C`)
3. Ejecutar `npm start` de nuevo
4. Escanear el QR nuevamente

## 🚀 Comando rápido (todo en uno)
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install expo@~54.0.0
npx expo install --fix
npm start
```

