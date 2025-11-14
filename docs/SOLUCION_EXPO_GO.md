# 🔧 Solución para Expo Go - SportPetMatch

## ❌ Problema

Cuando usas **Expo Go** en un dispositivo móvil, la app no puede conectarse al backend porque está usando `localhost`, y el dispositivo móvil no puede acceder a `localhost` de tu computadora.

## ✅ Solución Implementada

### 1. Backend Configurado ✅

- ✅ El backend ahora escucha en `0.0.0.0` en desarrollo (permite conexiones desde la red local)
- ✅ CORS configurado para permitir todas las conexiones en desarrollo
- ✅ Mensajes de ayuda que muestran la IP local

### 2. Frontend Configurado ✅

- ✅ Configuración centralizada en `frontend/src/utilidades/config.ts`
- ✅ Detección automática de plataforma (móvil vs web)
- ✅ Uso automático de IP local en móvil
- ✅ Uso de localhost en web
- ✅ Logs de debugging para verificar configuración

### 3. IP Local Configurada ✅

- ✅ IP local configurada: `172.20.10.3`
- ✅ Fácil de cambiar en un solo lugar: `frontend/src/utilidades/config.ts`

## 🚀 Pasos para Usar

### Paso 1: Verificar tu IP Local

Abre una terminal y ejecuta:

**Windows:**
```bash
ipconfig | findstr IPv4
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

Deberías ver algo como:
```
Dirección IPv4. . . . . . . . . . . . . : 172.20.10.3
```

### Paso 2: Actualizar la IP en el Frontend

Abre `frontend/src/utilidades/config.ts` y cambia esta línea:

```typescript
export const LOCAL_IP = '172.20.10.3'; // Cambia esto por tu IP local
```

**Reemplaza `172.20.10.3` con tu IP local.**

### Paso 3: Iniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor SportPetMatch iniciado exitosamente!
📍 Servidor corriendo en: http://localhost:3000
📱 Para Expo Go, usa tu IP local: http://172.20.10.3:3000/api
```

### Paso 4: Iniciar el Frontend

```bash
cd frontend
npm start
```

### Paso 5: Conectar con Expo Go

1. Abre Expo Go en tu dispositivo móvil
2. Escanea el QR que aparece en la terminal
3. La app debería conectarse al backend automáticamente

## 🔍 Verificar que Funciona

### 1. Verificar en los Logs de la App

Cuando la app inicie, deberías ver en la consola:

```
🌐 Configuración de API:
  - URL: http://172.20.10.3:3000/api
  - Platform: android (o ios)
  - Is Mobile: true
  - Is Web: false
  - Local IP: 172.20.10.3
  - Port: 3000
```

### 2. Verificar Conexión desde el Dispositivo

En tu dispositivo móvil, abre un navegador y ve a:
```
http://172.20.10.3:3000/api/salud
```

Deberías ver un JSON indicando que el servidor funciona.

### 3. Probar la App

1. Inicia sesión en la app
2. Verifica que puedas conectarte al backend
3. Prueba las funcionalidades (matches, chat, etc.)

## 🐛 Problemas Comunes y Soluciones

### Error: "Network Error" o "Error de conexión"

**Causa:** El dispositivo móvil no puede conectarse al backend.

**Soluciones:**
1. ✅ Verifica que ambos (computadora y dispositivo) estén en la **misma red WiFi**
2. ✅ Verifica que la IP en `frontend/src/utilidades/config.ts` sea correcta
3. ✅ Verifica que el backend esté escuchando en `0.0.0.0` (ver logs)
4. ✅ Verifica que el **firewall de Windows** no esté bloqueando el puerto 3000
5. ✅ Reinicia el servidor backend después de cambiar la IP

### Error: "CORS Error"

**Causa:** El backend no permite conexiones desde Expo Go.

**Solución:** Ya está configurado para permitir todas las conexiones en desarrollo. Si persiste, verifica la configuración de CORS en `backend/src/index.ts`.

### Error: "Connection Refused"

**Causa:** El backend no está escuchando en la red local.

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica que esté escuchando en `0.0.0.0` (ver logs)
3. Reinicia el servidor backend

### La IP Cambia Cada Vez

**Causa:** Tu router asigna IPs dinámicas.

**Soluciones:**
1. Configura una IP estática en tu router
2. O actualiza la IP en `frontend/src/utilidades/config.ts` cada vez que cambie
3. O usa una variable de entorno con tu IP actual

### Error: "Cannot connect to Metro bundler"

**Causa:** El dispositivo móvil no puede conectarse al servidor de desarrollo de Expo.

**Solución:**
1. Verifica que ambos estén en la misma red WiFi
2. Usa `expo start --tunnel` para usar un túnel (más lento pero funciona desde cualquier red)
3. O usa `expo start --lan` para usar la red local

## 🔒 Configurar Firewall de Windows

Si el firewall está bloqueando las conexiones:

1. Abre el **Firewall de Windows Defender**
2. Ve a **Configuración avanzada**
3. Crea una regla de entrada para el puerto 3000
4. O desactiva temporalmente el firewall para desarrollo

### Comando para Permitir Puerto 3000 (PowerShell como Administrador):

```powershell
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

## 📝 Archivos Modificados

### Backend
- ✅ `backend/src/index.ts` - Configurado para escuchar en `0.0.0.0`
- ✅ `backend/src/index.ts` - CORS configurado para desarrollo

### Frontend
- ✅ `frontend/src/utilidades/config.ts` - **NUEVO** - Configuración centralizada
- ✅ `frontend/src/servicios/apiClient.ts` - Actualizado para usar la configuración centralizada

## ✅ Checklist de Verificación

- [ ] IP local encontrada y configurada en `frontend/src/utilidades/config.ts`
- [ ] Backend escuchando en `0.0.0.0` (verificar en logs)
- [ ] CORS configurado para permitir conexiones desde Expo Go
- [ ] Backend corriendo y accesible desde la red local
- [ ] Frontend usando la IP local (verificar en logs)
- [ ] Dispositivo móvil en la misma red WiFi
- [ ] Firewall no bloqueando el puerto 3000
- [ ] App conectándose correctamente al backend

## 🎉 Estado Actual

- ✅ Backend configurado para Expo Go
- ✅ Frontend configurado para usar IP local
- ✅ Configuración centralizada
- ✅ Logs de debugging activados
- ✅ Manejo de errores mejorado
- ✅ Documentación completa

**¡Todo está listo para usar con Expo Go!** 🚀

## 🔄 Si tu IP Cambia

Si tu IP local cambia:

1. Encuentra tu nueva IP: `ipconfig | findstr IPv4`
2. Actualiza `frontend/src/utilidades/config.ts`: `export const LOCAL_IP = 'TU_NUEVA_IP';`
3. Reinicia el servidor frontend: `npm start`
4. La app se conectará automáticamente con la nueva IP

## 💡 Tips

1. **IP Estática:** Configura una IP estática en tu router para que no cambie
2. **Misma Red WiFi:** Asegúrate de que ambos dispositivos estén en la misma red
3. **Firewall:** Configura el firewall para permitir el puerto 3000
4. **Debugging:** Usa los logs en la consola para verificar la configuración
5. **Variables de Entorno:** Puedes usar `.env` para configurar la IP si prefieres

---

**¡Listo para usar con Expo Go!** 📱🚀


