# 🔧 Solución: Error de Conexión al Backend

## ❌ Error que estás viendo:

```
Error de conexión. Verifica que:
1. El backend esté corriendo en http://localhost:3000/api
2. Tu dispositivo y computadora estén en la misma red WiFi
3. El firewall no esté bloqueando el puerto 3000
4. La IP local (192.168.0.107) sea correcta
```

---

## ✅ Solución Paso a Paso

### 1. Verificar que el Backend esté Corriendo

Abre una terminal y ejecuta:

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor SportPetMatch iniciado exitosamente!
📍 Servidor corriendo en: http://localhost:3000
📊 API disponible en: http://localhost:3000/api
```

**Si no ves esto, el backend no está corriendo.**

### 2. Verificar que el Backend Responda

Abre tu navegador y ve a:
```
http://localhost:3000/api/salud
```

Deberías ver un JSON con información del servidor. Si no ves nada, el backend no está funcionando.

### 3. Verificar tu IP Local

Ejecuta en PowerShell:

```bash
ipconfig | findstr IPv4
```

Deberías ver algo como:
```
Dirección IPv4. . . . . . . . . . . . : 192.168.0.107
```

**Verifica que esta IP coincida con la IP en el error (192.168.0.107).**

Si es diferente, actualiza `frontend/src/utilidades/config.ts`:

```typescript
export const LOCAL_IP = 'TU_IP_AQUI'; // Cambia esto
```

### 4. Verificar que Estés en la Misma Red WiFi

- Tu computadora y tu teléfono deben estar en la **misma red WiFi**
- No uses datos móviles en el teléfono
- No uses un hotspot diferente

### 5. Verificar el Firewall

El firewall de Windows puede estar bloqueando el puerto 3000.

**Solución rápida (temporal para desarrollo):**

1. Abre "Firewall de Windows Defender"
2. Ve a "Configuración avanzada"
3. Crea una regla de entrada para el puerto 3000
4. O desactiva temporalmente el firewall para probar

**O desde PowerShell (como administrador):**

```powershell
New-NetFirewallRule -DisplayName "Backend Port 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### 6. Reiniciar Todo

1. **Cierra el backend** (Ctrl+C en la terminal)
2. **Cierra Expo Go** completamente en tu teléfono
3. **Reinicia el backend:**
   ```bash
   cd backend
   npm run dev
   ```
4. **Reinicia el frontend:**
   ```bash
   cd frontend
   npm start
   ```
5. **Abre Expo Go** y escanea el QR de nuevo

---

## 🔍 Verificación Rápida

### Checklist:

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Backend responde en `http://localhost:3000/api/salud`
- [ ] IP local correcta en `frontend/src/utilidades/config.ts`
- [ ] Dispositivo móvil en la misma red WiFi
- [ ] Firewall no bloquea el puerto 3000
- [ ] Frontend reiniciado después de cambios

---

## 🚨 Soluciones Alternativas

### Si el puerto 3000 está ocupado:

```bash
cd backend
node scripts/liberar-puerto.js
```

### Si necesitas cambiar la IP:

1. Encuentra tu IP:
   ```bash
   ipconfig | findstr IPv4
   ```

2. Actualiza `frontend/src/utilidades/config.ts`:
   ```typescript
   export const LOCAL_IP = 'TU_NUEVA_IP';
   ```

3. Reinicia el frontend

### Si nada funciona:

Prueba usar el modo tunnel (más lento pero más confiable):

```bash
cd frontend
npm run start:tunnel
```

---

## 📝 Notas Importantes

- **En móvil NO puedes usar `localhost`** - siempre usa la IP local
- **El backend debe escuchar en `0.0.0.0`** (ya está configurado)
- **Ambos dispositivos deben estar en la misma red WiFi**
- **El firewall puede bloquear conexiones entrantes**

---

## ✅ Si Todo Está Correcto

Una vez que el backend esté corriendo y el firewall permita conexiones, deberías poder:

1. Ver el backend respondiendo en `http://localhost:3000/api/salud`
2. Conectar desde Expo Go sin errores
3. Hacer login con los usuarios de prueba


