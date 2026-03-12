# 🚀 Cómo Ejecutar la App Localmente

## ⚡ Opción Rápida: Todo Junto

Ejecuta backend y frontend al mismo tiempo:

```bash
npm run dev
```

Esto iniciará:
- ✅ Backend en `http://localhost:3000`
- ✅ Frontend (Expo) en el puerto 8081

---

## 📋 Opción Manual: Por Separado

### 1. Iniciar el Backend

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

### 2. Iniciar el Frontend

Abre **otra terminal** y ejecuta:

```bash
cd frontend
npm start
```

O si quieres forzar conexión LAN:

```bash
cd frontend
npm run start:lan
```

### 3. Conectar con la App

**En Web:**
- Presiona `w` en la terminal de Expo
- O abre: `http://localhost:8081`

**En Móvil (Expo Go):**
1. Abre Expo Go en tu teléfono
2. Escanea el QR code que aparece en la terminal
3. Asegúrate de que ambos dispositivos estén en la misma red WiFi

**En Emulador:**
- Android: Presiona `a`
- iOS: Presiona `i`

---

## 🔧 Scripts Disponibles

### Desde la Raíz del Proyecto:

```bash
# Ejecutar ambos (backend + frontend)
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend
```

### Desde el Backend:

```bash
cd backend
npm run dev          # Modo desarrollo
npm run build        # Construir para producción
npm run db:seed      # Poblar base de datos con datos de ejemplo
```

### Desde el Frontend:

```bash
cd frontend
npm start            # Iniciar Expo (LAN)
npm run start:lan    # Forzar conexión LAN
npm run web          # Abrir en navegador web
npm run build        # Construir para web
```

---

## ✅ Verificar que Todo Funciona

### 1. Verificar Backend

Abre en tu navegador:
```
http://localhost:3000/api/salud
```

Deberías ver un JSON con información del servidor.

### 2. Verificar Frontend

- **Web**: Abre `http://localhost:8081` o presiona `w`
- **Móvil**: Escanea el QR code con Expo Go

### 3. Probar Login

Usa estos usuarios de prueba:

**María González**
- Email: `maria.gonzalez@sportpetmatch.com`
- Password: `123456`

**Carlos Rodríguez**
- Email: `carlos.rodriguez@sportpetmatch.com`
- Password: `123456`

---

## 🐛 Solución de Problemas

### Backend no inicia

```bash
# Verificar que el puerto 3000 no esté en uso
netstat -ano | findstr :3000

# Si está en uso, liberar el puerto
cd backend
node scripts/liberar-puerto.js
```

### Frontend no se conecta al backend

1. Verifica que el backend esté corriendo en `http://localhost:3000`
2. Verifica que la IP local esté correcta en `frontend/src/utilidades/config.ts`
3. Si estás en móvil, asegúrate de usar la IP local, no `localhost`

### Error de conexión en Expo Go

1. Verifica que ambos dispositivos estén en la misma red WiFi
2. Verifica que el firewall no esté bloqueando el puerto 8081
3. Intenta usar `npm run start:lan` en lugar de `npm start`

---

## 📝 Notas Importantes

- **Backend**: Corre en `http://localhost:3000`
- **Frontend Web**: Corre en `http://localhost:8081`
- **Frontend Móvil**: Usa la IP local de tu computadora
- **Base de datos**: Asegúrate de tener PostgreSQL configurado y corriendo

---

## 🎉 ¡Listo!

Una vez que ambos estén corriendo, puedes usar la app normalmente. Los cambios se reflejarán automáticamente gracias al hot reload.


