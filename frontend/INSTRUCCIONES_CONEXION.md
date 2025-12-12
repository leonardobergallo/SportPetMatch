# 🔧 Solución: Error de Conexión al Servidor de Desarrollo

## ❌ Error
```
Could not connect to development server.
URL: http://10.1.227.193:8081/frontend/index.bundle?...
```

## 🔍 Problema Identificado

1. **El servidor de desarrollo no está corriendo** o no está accesible en la red local
2. **La URL incluye `/frontend/`** lo cual sugiere un problema con la configuración de workspace
3. **El script estaba usando `--offline`** lo cual impide conexiones de red

## ✅ Solución

### Paso 1: Asegúrate de estar en el directorio correcto

```powershell
cd C:\Users\leona\Desktop\SportPetMatch\frontend
```

### Paso 2: Inicia el servidor de Expo

```powershell
npm start
```

O si quieres forzar conexión LAN:

```powershell
npm run start:lan
```

### Paso 3: Verifica que el servidor esté corriendo

Deberías ver algo como:
```
Metro waiting on exp://10.1.227.193:8081
Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Paso 4: En tu iPhone

1. **Abre Expo Go**
2. **Escanea el QR code** que aparece en la terminal
3. **Asegúrate de que tu iPhone y tu computadora estén en la misma red WiFi**

## 🔧 Configuración Actualizada

- **Script de inicio**: Cambiado de `--offline` a `--clear` (permite conexiones de red)
- **Metro config**: Configurado para escuchar en puerto 8081
- **Scripts disponibles**:
  - `npm start` - Inicia con cache limpia
  - `npm run start:lan` - Fuerza conexión LAN
  - `npm run start:offline` - Modo offline (no usar para desarrollo)

## 🚨 Troubleshooting

### Si el servidor no inicia:

1. **Verifica que no haya otro proceso usando el puerto 8081**:
   ```powershell
   netstat -ano | findstr :8081
   ```

2. **Mata procesos que estén usando el puerto**:
   ```powershell
   taskkill /F /PID <PID>
   ```

3. **Limpia la cache de Metro**:
   ```powershell
   npx expo start --clear
   ```

### Si no puedes conectarte desde el iPhone:

1. **Verifica que ambos dispositivos estén en la misma red WiFi**
2. **Verifica que el firewall no esté bloqueando el puerto 8081**
3. **Usa el modo LAN explícitamente**:
   ```powershell
   npm run start:lan
   ```

### Si la URL incluye `/frontend/`:

Esto puede ser un problema con la configuración de workspace. Asegúrate de:
1. Ejecutar `npm start` desde el directorio `frontend` (no desde la raíz)
2. Verificar que `app.json` esté en el directorio `frontend`
3. Verificar que `index.js` esté en el directorio `frontend`

## 📝 Notas

- La IP `10.1.227.193` es tu IP local en la red WiFi
- El puerto `8081` es el puerto por defecto de Metro/Expo
- El servidor debe estar corriendo **antes** de escanear el QR code
- Si cambias de red WiFi, necesitarás reiniciar el servidor








