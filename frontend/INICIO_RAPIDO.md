# 🚀 Inicio Rápido - Expo

## ⚡ Iniciar el Servidor

```powershell
cd C:\Users\leona\Desktop\SportPetMatch\frontend
npm start
```

Esto iniciará el servidor en modo **LAN** (red local), que es más rápido que el modo tunnel.

## 📱 Conectar con Expo Go

1. **Abre Expo Go** en tu iPhone
2. **Escanea el QR code** que aparece en la terminal
3. **Asegúrate de que ambos dispositivos estén en la misma red WiFi**

## 🔧 Opciones Disponibles

### Modo LAN (Recomendado - Más Rápido)
```powershell
npm start
# o
npm run start:lan
```

### Modo Tunnel (Más Lento - Usa ngrok)
```powershell
npm run start:tunnel
```

**Nota**: El modo tunnel puede tardar mucho tiempo en conectarse o fallar. Úsalo solo si el modo LAN no funciona.

### Modo Offline (Solo para desarrollo local)
```powershell
npm run start:offline
```

## ❌ Solución de Problemas

### Error: "ngrok tunnel took too long to connect"
**Solución**: No uses el modo tunnel. Usa el modo LAN:
```powershell
npm start
```

### Error: "Could not connect to development server"
**Solución**:
1. Verifica que ambos dispositivos estén en la misma red WiFi
2. Verifica que el firewall no esté bloqueando el puerto 8081
3. Cierra Expo Go completamente y vuelve a abrirlo
4. Escanea el QR code de nuevo

### Error: URL incluye `/frontend/`
**Solución**:
1. Asegúrate de estar en el directorio `frontend`
2. Ejecuta `npm start` desde el directorio `frontend`
3. Verifica que la URL NO incluya `/frontend/` en la ruta

## 📝 Notas

- **IP Local**: `10.1.227.193`
- **Puerto**: `8081`
- **Modo**: LAN (red local)
- **URL Esperada**: `exp://10.1.227.193:8081` (sin `/frontend/`)

## ✅ Verificación

Si todo está bien, deberías ver:
- Servidor Metro corriendo en `http://10.1.227.193:8081`
- QR code visible en la terminal
- URL correcta: `exp://10.1.227.193:8081` (sin `/frontend/`)
- Conexión exitosa desde Expo Go



