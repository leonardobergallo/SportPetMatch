# 🧪 Guía Completa para Probar SportPetMatch

## 📋 Índice
1. [Ver Usuarios Registrados](#ver-usuarios-registrados)
2. [Ver Matches](#ver-matches)
3. [Iniciar la Aplicación](#iniciar-la-aplicación)
4. [Probar Funcionalidades](#probar-funcionalidades)

---

## 👥 Ver Usuarios Registrados

### Opción 1: Usando el Script (Recomendado)

Ejecuta el script desde la raíz del proyecto:

```powershell
cd backend
npm run db:listar-usuarios
```

Este script mostrará:
- ✅ Lista completa de usuarios con sus datos
- ✅ Estadísticas de cada usuario (mascotas, eventos, matches)
- ✅ Lista de todos los matches existentes
- ✅ Estado de cada match (pendiente, aceptado, rechazado)

### Opción 2: Usando Prisma Studio (Interfaz Visual)

```powershell
cd backend
npm run db:studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde puedes:
- Ver todas las tablas
- Editar datos directamente
- Explorar relaciones entre usuarios, matches, eventos, etc.

### Opción 3: Usando la API (Requiere Autenticación)

Si quieres obtener usuarios a través de la API, necesitarás:
1. Iniciar sesión para obtener un token JWT
2. Usar el token para hacer requests autenticados

---

## 💕 Ver Matches

### Usando el Script

El script `listar-usuarios` también muestra todos los matches:

```powershell
cd backend
npm run db:listar-usuarios
```

Verás:
- ✅ Todos los matches entre usuarios
- ✅ Estado de cada match (pendiente, aceptado, rechazado)
- ✅ Mensajes iniciales si los hay
- ✅ Eventos propuestos en los matches

### Usuarios de Ejemplo con Matches

Según `USUARIOS_EJEMPLO.md`, hay 3 matches creados:

1. **María ↔ Carlos** (pendiente)
   - María inició el match con Carlos
   - Estado: pendiente (Carlos aún no ha respondido)

2. **María ↔ Ana** (aceptado, con mensajes)
   - Match mutuo aceptado
   - Tienen conversación activa

3. **Diego ↔ Laura** (aceptado, con mensajes)
   - Match mutuo aceptado
   - Tienen conversación activa

---

## 🚀 Iniciar la Aplicación

### Paso 1: Iniciar el Backend

Abre una terminal y ejecuta:

```powershell
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor SportPetMatch iniciado exitosamente!
📍 Servidor corriendo en: http://localhost:3000
📊 API disponible en: http://localhost:3000/api
❤️  Salud del servidor: http://localhost:3000/api/salud
```

### Paso 2: Verificar que el Backend Funciona

Abre tu navegador en:
**http://localhost:3000/api/salud**

Deberías ver un JSON indicando que el servidor funciona.

### Paso 3: Iniciar el Frontend

Abre **otra terminal** y ejecuta:

```powershell
cd frontend
npm start
```

Esto iniciará Expo. Verás un QR code que puedes escanear con Expo Go.

**Opciones:**
- Presiona `w` para abrir en navegador web
- Presiona `a` para abrir en Android emulator
- Presiona `i` para abrir en iOS simulator
- Escanea el QR con Expo Go en tu teléfono

---

## 🧪 Probar Funcionalidades

### 1. Probar el Sistema de Matching

#### Iniciar Sesión
1. Abre la app
2. Inicia sesión con uno de estos usuarios:

**Usuario 1: María González**
- Email: `maria.gonzalez@sportpetmatch.com`
- Password: `123456`
- Tiene: 1 match pendiente (con Carlos), 1 match aceptado (con Ana)

**Usuario 2: Carlos Rodríguez**
- Email: `carlos.rodriguez@sportpetmatch.com`
- Password: `123456`
- Tiene: 1 match pendiente (recibido de María)

**Usuario 3: Ana Martínez**
- Email: `ana.martinez@sportpetmatch.com`
- Password: `123456`
- Tiene: 1 match aceptado (con María, con mensajes)

#### Probar Matching
1. Ve a la pantalla **"Matching"** o **"Descubrir"**
2. Deberías ver usuarios recomendados
3. Haz swipe derecho en un usuario para crear un match
4. O toca el botón de "Me gusta" / "Match"

#### Ver Matches
1. Ve a la pantalla **"Matches"** o **"Conexiones"**
2. Deberías ver tus matches:
   - Matches pendientes (esperando respuesta)
   - Matches aceptados (conversaciones activas)

### 2. Probar el Chat

#### Acceder al Chat
1. Inicia sesión con **María** o **Ana**
2. Ve a **"Matches"**
3. Toca el match con **Ana** (si eres María) o con **María** (si eres Ana)
4. Deberías ver los mensajes existentes

#### Enviar Mensaje
1. Escribe un mensaje en el campo de texto
2. Presiona enviar
3. El mensaje debería aparecer en la conversación

#### Probar con Múltiples Usuarios
1. Abre la app en dos dispositivos/navegadores diferentes
2. Inicia sesión con **María** en uno y **Ana** en el otro
3. Envía mensajes entre ambos
4. Deberías ver los mensajes en tiempo real (si está configurado WebSocket)

### 3. Probar Eventos

#### Ver Eventos
1. Inicia sesión con cualquier usuario
2. Ve a **"Eventos"**
3. Deberías ver:
   - Eventos creados por ti
   - Eventos disponibles para unirse

#### Crear Evento
1. Ve a **"Crear Evento"**
2. Completa el formulario:
   - Título
   - Descripción
   - Tipo de evento
   - Fecha y hora
   - Ubicación
   - Máximo de participantes
   - Precio (opcional)
   - Pet-friendly (sí/no)
   - Premium (sí/no)
3. Presiona "Crear Evento"
4. El evento debería aparecer en la lista

#### Unirse a un Evento
1. Ve a **"Eventos"**
2. Toca un evento disponible
3. Presiona "Unirse" o "Inscribirse"
4. Deberías aparecer en la lista de participantes

### 4. Probar Mascotas

#### Ver Mascotas
1. Inicia sesión con **Ana** (tiene 3 mascotas)
2. Ve a **"Mascotas"**
3. Deberías ver: Luna, Rocky, Mimi

#### Agregar Mascota
1. Presiona el botón "+" o "Agregar Mascota"
2. Completa el formulario:
   - Nombre
   - Tipo (perro, gato, etc.)
   - Raza
   - Edad
   - Fotos
   - Intereses deportivos
3. Guarda la mascota

### 5. Probar Perfil

#### Ver Perfil
1. Ve a **"Perfil"** o toca tu avatar
2. Deberías ver tu información completa

#### Editar Perfil
1. Presiona "Editar Perfil"
2. Actualiza:
   - Biografía
   - Intereses
   - Ubicación
   - Nivel deportivo
   - Avatar
3. Guarda los cambios

### 6. Probar Mapa

#### Ver Mapa
1. Ve a **"Mapa"**
2. Deberías ver:
   - Marcadores de usuarios cercanos
   - Marcadores de eventos
3. Toca un marcador para ver detalles

---

## 🔑 Credenciales de Usuarios de Ejemplo

Todos los usuarios tienen la misma contraseña: **`123456`**

| Usuario | Email | Tipo | Mascotas | Matches |
|---------|-------|------|----------|---------|
| María González | maria.gonzalez@sportpetmatch.com | Con Mascota | 1 (Max) | 2 (1 pendiente, 1 aceptado) |
| Carlos Rodríguez | carlos.rodriguez@sportpetmatch.com | Solo | 0 | 1 (pendiente) |
| Ana Martínez | ana.martinez@sportpetmatch.com | Con Mascota | 3 (Luna, Rocky, Mimi) | 1 (aceptado) |
| Diego Fernández | diego.fernandez@sportpetmatch.com | Ambos | 0 | 1 (aceptado) |
| Laura Sánchez | laura.sanchez@sportpetmatch.com | Con Mascota | 1 (Luna) | 1 (aceptado) |

---

## 🔄 Recrear Datos de Ejemplo

Si necesitas recrear los datos de ejemplo (esto eliminará todos los datos existentes):

```powershell
cd backend
npm run db:seed
```

Esto creará:
- ✅ 5 usuarios con perfiles completos
- ✅ 5 mascotas
- ✅ 5 eventos
- ✅ 3 matches
- ✅ Participaciones en eventos
- ✅ Mensajes de ejemplo en los chats

---

## 🐛 Solución de Problemas

### El backend no inicia
- Verifica que el puerto 3000 no esté en uso
- Verifica que las variables de entorno estén configuradas
- Revisa los logs de error

### El frontend no se conecta al backend
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Verifica que la URL de la API en `.env` del frontend sea correcta
- Verifica que CORS esté configurado correctamente

### No veo usuarios en la app
- Ejecuta `npm run db:seed` para crear usuarios de ejemplo
- Verifica que los usuarios tengan `onboardingCompletado: true`

### No puedo hacer match
- Verifica que ambos usuarios tengan `onboardingCompletado: true`
- Verifica que los usuarios sean compatibles (tipo de usuario, intereses)

---

## 📊 Endpoints Útiles de la API

### Autenticación
- `POST /api/auth/registro` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/usuarios/mi-perfil` - Obtener mi perfil (requiere auth)
- `PUT /api/usuarios/mi-perfil` - Actualizar mi perfil (requiere auth)
- `GET /api/usuarios/:id` - Obtener usuario público

### Matches
- `GET /api/matches/recomendaciones` - Obtener recomendaciones (requiere auth)
- `GET /api/matches` - Obtener mis matches (requiere auth)
- `POST /api/matches` - Crear match (requiere auth)
- `PUT /api/matches/:id/respuesta` - Responder match (requiere auth)

### Mensajes
- `GET /api/mensajes/:matchId` - Obtener mensajes (requiere auth)
- `POST /api/mensajes` - Enviar mensaje (requiere auth)

### Eventos
- `GET /api/eventos` - Listar eventos
- `POST /api/eventos` - Crear evento (requiere auth)
- `GET /api/eventos/:id` - Obtener evento

---

## ✅ Checklist de Pruebas

- [ ] Backend inicia correctamente
- [ ] Frontend se conecta al backend
- [ ] Puedo iniciar sesión con usuarios de ejemplo
- [ ] Veo usuarios recomendados en Matching
- [ ] Puedo crear un match
- [ ] Veo mis matches en la pantalla de Matches
- [ ] Puedo abrir un chat y ver mensajes
- [ ] Puedo enviar mensajes en el chat
- [ ] Veo eventos en la lista
- [ ] Puedo crear un evento
- [ ] Puedo unirme a un evento
- [ ] Veo mis mascotas (si tengo)
- [ ] Puedo agregar una mascota
- [ ] Puedo editar mi perfil
- [ ] Veo el mapa con marcadores

---

¡Disfruta probando SportPetMatch! 🐕‍🦺🏃‍♀️

