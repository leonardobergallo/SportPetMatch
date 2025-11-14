# 🔧 Solución: Error de Conexión al Servidor de Desarrollo

## ❌ Error Actual
```
Could not connect to development server.
URL: http://10.1.227.193:8081/frontend/index.bundle?...
```

## 🔍 Problema Identificado

El servidor Metro **SÍ está corriendo** (puerto 8081), pero la URL incluye `/frontend/` en la ruta, lo cual sugiere que:

1. **El servidor puede estar corriendo desde el directorio raíz** en lugar del directorio `frontend`
2. **Hay un proceso viejo de Metro** que está usando una configuración incorrecta
3. **La configuración de workspace** puede estar causando problemas

## ✅ Solución Paso a Paso

### Paso 1: Detener todos los procesos de Metro/Expo

```powershell
# Encontrar procesos usando el puerto 8081
netstat -ano | findstr :8081

# Matar el proceso (reemplaza <PID> con el número del proceso)
taskkill /F /PID <PID>
```

### Paso 2: Asegúrate de estar en el directorio correcto

```powershell
cd C:\Users\leona\Desktop\SportPetMatch\frontend
```

### Paso 3: Limpia la cache y reinicia

```powershell
# Limpiar cache de Metro
npx expo start --clear

# O si prefieres usar LAN explícitamente
npm run start:lan
```

### Paso 4: Verifica que el servidor esté corriendo correctamente

Deberías ver algo como:
```
Metro waiting on exp://10.1.227.193:8081
```

**IMPORTANTE**: La URL NO debe incluir `/frontend/` en la ruta.

### Paso 5: En tu iPhone

1. **Cierra Expo Go completamente** (desliza hacia arriba y sácalo)
2. **Abre Expo Go de nuevo**
3. **Escanee el nuevo QR code** que aparece en la terminal
4. **Asegúrate de que ambos dispositivos estén en la misma red WiFi**

## 🚨 Si el problema persiste

### Opción 1: Usar modo Tunnel (más lento pero más confiable)

```powershell
cd frontend
npx expo start --tunnel
```

Esto usa ngrok para crear un túnel, lo cual es más lento pero funciona incluso si hay problemas de red.

### Opción 2: Verificar que el servidor se ejecute desde el directorio correcto

Asegúrate de que cuando ejecutas `npm start`, estás en el directorio `frontend`, no en la raíz del proyecto.

### Opción 3: Eliminar workspace de npm (si es necesario)

Si el problema persiste, puedes eliminar la configuración de workspace del `package.json` raíz:

```json
// En package.json raíz, comentar o eliminar:
// "workspaces": [
//   "backend",
//   "frontend"
// ]
```

Luego reinstala las dependencias:

```powershell
cd frontend
rm -r node_modules
npm install
npm start
```

## 📝 Notas

- El servidor Metro debe ejecutarse desde el directorio `frontend`
- La URL correcta NO debe incluir `/frontend/` en la ruta
- Asegúrate de que ambos dispositivos estén en la misma red WiFi
- El puerto 8081 debe estar libre antes de iniciar el servidor

## ✅ Verificación

Si todo está bien, deberías ver:
- Servidor Metro corriendo en `http://10.1.227.193:8081`
- QR code visible en la terminal
- URL correcta: `exp://10.1.227.193:8081` (sin `/frontend/`)
- Conexión exitosa desde Expo Go



