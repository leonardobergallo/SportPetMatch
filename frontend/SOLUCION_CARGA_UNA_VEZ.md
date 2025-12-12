# 🔧 Solución: Expo Solo Carga Una Vez

## ❌ Problema
Expo Go carga la app correctamente la primera vez, pero después de cerrar la app o recargar, ya no funciona más.

## 🔍 Causas Comunes

1. **Caché corrupta** - La caché de Metro/Expo se corrompe después de la primera carga
2. **Conexiones TIME_WAIT** - Las conexiones se quedan en estado TIME_WAIT y bloquean nuevas conexiones
3. **Problemas de red** - La IP cambia o hay problemas de firewall
4. **Bundle cache** - El bundle se queda en un estado inconsistente

## ✅ Solución Rápida

### Opción 1: Reinicio Automático (Recomendado)

```powershell
cd frontend
.\reiniciar-expo.ps1
```

Este script:
- Detiene todos los procesos de Expo/Metro
- Limpia la caché completamente
- Reinicia Expo en una nueva ventana

### Opción 2: Reinicio Manual

```powershell
cd frontend

# 1. Detener procesos
netstat -ano | findstr :8081
# Anota el PID y ejecuta:
taskkill /F /PID <PID>

# 2. Limpiar caché
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .metro -ErrorAction SilentlyContinue

# 3. Reiniciar
npm start
```

### Opción 3: Usar Script con Reset Cache

```powershell
cd frontend
npm run start:fresh
```

Este comando siempre limpia la caché antes de iniciar.

## 📱 En tu iPhone

Después de reiniciar el servidor:

1. **Cierra completamente Expo Go**:
   - Desliza hacia arriba desde la parte inferior
   - Desliza hacia arriba en Expo Go para cerrarlo completamente
   - O presiona el botón home dos veces y desliza Expo Go hacia arriba

2. **Abre Expo Go de nuevo**

3. **Escanea el nuevo QR code** que aparece en la terminal

4. **Espera a que cargue completamente** antes de interactuar con la app

## 🔄 Prevención

Para evitar que esto pase frecuentemente:

1. **Siempre usa `npm start`** (ya incluye `--clear` automáticamente)
2. **No cierres Expo Go abruptamente** - Usa el botón de recargar en lugar de cerrar la app
3. **Si la app se congela**, recarga desde Expo Go (shake device → Reload) en lugar de cerrar

## 🚨 Si el Problema Persiste

### Verificar que el Backend Esté Corriendo

```powershell
cd backend
npm run dev
```

El backend debe estar corriendo en `http://0.0.0.0:3000` para que la app funcione.

### Verificar IP Local

```powershell
ipconfig | findstr IPv4
```

Asegúrate de que la IP en `frontend/src/utilidades/config.ts` coincida con tu IP actual.

### Usar Modo Tunnel (Más Lento pero Más Estable)

```powershell
cd frontend
npm run start:tunnel
```

Esto usa ngrok y puede ser más estable aunque más lento.

## 📝 Notas

- El script `npm start` ahora siempre limpia la caché (`--clear --reset-cache`)
- La configuración de Metro ha sido mejorada para evitar problemas de reconexión
- Si cambias de red WiFi, necesitas actualizar la IP en `config.ts`

