# 📱 Configuración para Expo Go - SportPetMatch

## ⚠️ Problema Común

Cuando usas Expo Go en un dispositivo móvil, **no puedes usar `localhost`** porque el dispositivo móvil no puede acceder a `localhost` de tu computadora. Necesitas usar la **IP local de tu computadora**.

## ✅ Solución Implementada

### 1. Backend Configurado

- ✅ El backend ahora escucha en `0.0.0.0` en desarrollo (permite conexiones desde la red local)
- ✅ CORS configurado para permitir conexiones desde Expo Go
- ✅ Mensajes de ayuda que muestran la IP local a usar

### 2. Frontend Configurado

- ✅ El frontend detecta automáticamente si está en móvil (Expo Go)
- ✅ Usa la IP local (`172.20.10.3`) cuando está en móvil
- ✅ Usa `localhost` cuando está en web
- ✅ Logs de debugging para verificar la configuración

## 🔧 Configuración Paso a Paso

### Paso 1: Encontrar tu IP Local

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

Abre `frontend/src/servicios/apiClient.ts` y cambia esta línea:

```typescript
const LOCAL_IP = '172.20.10.3'; // Cambia esto por tu IP local
```

**Reemplaza `172.20.10.3` con tu IP local.**

### Paso 3: Configurar Variables de Entorno (Opcional)

Crea un archivo `.env` en `frontend/`:

```env
EXPO_PUBLIC_API_URL=http://172.20.10.3:3000/api
```

**Reemplaza `172.20.10.3` con tu IP local.**

### Paso 4: Iniciar el Backend

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

### Paso 5: Iniciar el Frontend

```bash
cd frontend
npm start
```

### Paso 6: Conectar con Expo Go

1. Abre Expo Go en tu dispositivo móvil
2. Escanea el QR que aparece en la terminal
3. La app debería conectarse al backend usando tu IP local

## 🔍 Verificar que Funciona

### 1. Verificar la URL en la App

Abre la consola de Expo (en la terminal o en Expo DevTools) y deberías ver:

```
🌐 API Base URL: http://172.20.10.3:3000/api
📱 Platform: android (o ios)
🔧 Is Mobile: true
```

### 2. Verificar que el Backend Responde

En tu dispositivo móvil, abre un navegador y ve a:
```
http://172.20.10.3:3000/api/salud
```

Deberías ver un JSON indicando que el servidor funciona.

### 3. Probar la Conexión desde la App

1. Inicia sesión en la app
2. Verifica que puedas conectarte al backend
3. Si hay errores, revisa los logs en la consola

## 🐛 Problemas Comunes

### Error: "Network Error" o "Error de conexión"

**Causa:** El dispositivo móvil no puede conectarse al backend.

**Soluciones:**
1. Verifica que ambos (computadora y dispositivo) estén en la misma red WiFi
2. Verifica que la IP en `apiClient.ts` sea correcta
3. Verifica que el backend esté escuchando en `0.0.0.0` (no en `localhost`)
4. Verifica que el firewall de Windows no esté bloqueando el puerto 3000

### Error: "CORS Error"

**Causa:** El backend no permite conexiones desde Expo Go.

**Solución:** Ya está configurado para permitir todas las conexiones en desarrollo. Si persiste, verifica la configuración de CORS en `backend/src/index.ts`.

### Error: "Connection Refused"

**Causa:** El backend no está escuchando en la red local.

**Solución:** 
1. Verifica que el backend esté corriendo
2. Verifica que esté escuchando en `0.0.0.0` (no en `localhost`)
3. Reinicia el servidor backend

### La IP Cambia Cada Vez

**Causa:** Tu router asigna IPs dinámicas.

**Solución:**
1. Configura una IP estática en tu router
2. O actualiza la IP en `apiClient.ts` cada vez que cambie
3. O usa una variable de entorno con tu IP actual

## 🔒 Firewall de Windows

Si el firewall está bloqueando las conexiones:

1. Abre el Firewall de Windows
2. Permite conexiones entrantes en el puerto 3000
3. O desactiva temporalmente el firewall para desarrollo

## ✅ Checklist de Verificación

- [ ] IP local encontrada y configurada en `apiClient.ts`
- [ ] Backend escuchando en `0.0.0.0` (verificar en logs)
- [ ] CORS configurado para permitir conexiones desde Expo Go
- [ ] Backend corriendo y accesible desde la red local
- [ ] Frontend usando la IP local (verificar en logs)
- [ ] Dispositivo móvil en la misma red WiFi
- [ ] Firewall no bloqueando el puerto 3000
- [ ] App conectándose correctamente al backend

## 📝 Notas Importantes

1. **IP Local vs Localhost:**
   - `localhost` solo funciona en la misma máquina
   - IP local (`172.20.10.3`) funciona desde cualquier dispositivo en la misma red

2. **Misma Red WiFi:**
   - El dispositivo móvil y la computadora deben estar en la misma red WiFi
   - Si usas datos móviles, no funcionará

3. **IP Dinámica:**
   - Si tu IP cambia, actualiza `apiClient.ts` con la nueva IP
   - O configura una IP estática en tu router

4. **Seguridad:**
   - En desarrollo, está bien permitir todas las conexiones
   - En producción, configura CORS correctamente

## 🎉 Estado Actual

- ✅ Backend configurado para Expo Go
- ✅ Frontend configurado para usar IP local
- ✅ CORS configurado correctamente
- ✅ Logs de debugging activados
- ✅ Documentación completa

**¡Todo está listo para usar con Expo Go!** 🚀


