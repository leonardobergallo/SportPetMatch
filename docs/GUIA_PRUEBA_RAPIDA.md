# 🚀 Guía Rápida para Probar el Sistema de Chat

## ✅ Todo está implementado y listo para probar

## 📋 Pasos Rápidos

### 1. Iniciar el Servidor Backend

Abre una terminal en el directorio del proyecto y ejecuta:

```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor SportPetMatch iniciado exitosamente!
📍 Servidor corriendo en: http://localhost:3000
🌍 Entorno: development
📊 API disponible en: http://localhost:3000/api
❤️  Salud del servidor: http://localhost:3000/api/salud
🐕‍🦺 ¡Listo para conectar personas y mascotas!
```

### 2. Verificar que el Servidor Funciona

Abre tu navegador y ve a:
- http://localhost:3000/api/salud

O usa curl:
```bash
curl http://localhost:3000/api/salud
```

Deberías ver un JSON indicando que el servidor funciona correctamente.

### 3. Verificar Endpoints de Mensajes

Los endpoints de mensajes están disponibles en:
- `GET /api/mensajes/:matchId` - Obtener mensajes
- `POST /api/mensajes` - Enviar mensaje
- `PUT /api/mensajes/leer` - Marcar como leído
- `GET /api/mensajes/no-leidos/cantidad` - Obtener no leídos

**Nota:** Todos requieren autenticación JWT.

### 4. Probar con la Extensión REST Client (VS Code)

1. Abre `backend/test-mensajes.http` en VS Code
2. Instala la extensión REST Client si no la tienes
3. Reemplaza `@token` con un token real después de iniciar sesión
4. Ejecuta las pruebas una por una

### 5. Probar con Postman/Insomnia

#### Paso 1: Registrarse o Iniciar Sesión

**POST** `http://localhost:3000/api/auth/registro`
```json
{
  "email": "test@example.com",
  "password": "password123",
  "nombre": "Usuario Test"
}
```

O iniciar sesión:

**POST** `http://localhost:3000/api/auth/login`
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Guarda el `token` de la respuesta.

#### Paso 2: Obtener Matches

**GET** `http://localhost:3000/api/matches`
Headers:
```
Authorization: Bearer <token>
```

#### Paso 3: Enviar un Mensaje

**POST** `http://localhost:3000/api/mensajes`
Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Body:
```json
{
  "matchId": "match123",
  "contenido": "Hola! ¿Cómo estás?",
  "tipo": "texto"
}
```

#### Paso 4: Obtener Mensajes

**GET** `http://localhost:3000/api/mensajes/:matchId`
Headers:
```
Authorization: Bearer <token>
```

#### Paso 5: Marcar como Leído

**PUT** `http://localhost:3000/api/mensajes/leer`
Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
```

Body:
```json
{
  "matchId": "match123"
}
```

#### Paso 6: Obtener No Leídos

**GET** `http://localhost:3000/api/mensajes/no-leidos/cantidad`
Headers:
```
Authorization: Bearer <token>
```

### 6. Probar con la App Frontend

#### Paso 1: Iniciar la App

En otra terminal:
```bash
cd frontend
npm start
```

O si usas Expo:
```bash
cd frontend
npx expo start
```

#### Paso 2: Probar el Chat

1. Inicia sesión en la app
2. Haz un match con otro usuario
3. Acepta el match (estado "aceptado")
4. Ve a la pantalla de Matches
5. Abre el chat con el match
6. Envía mensajes
7. Verifica que los mensajes se actualizan automáticamente

### 7. Verificar Base de Datos con Prisma Studio

Abre una terminal y ejecuta:

```bash
cd backend
npx prisma studio
```

Esto abrirá Prisma Studio en `http://localhost:5555` donde podrás ver:
- Tabla `mensajes` con los mensajes
- Tabla `matches` con los matches
- Relación entre `mensajes` y `matches`

## 🔍 Verificaciones

### ✅ Verificar que el Servidor Funciona

1. Abre http://localhost:3000/api/salud
2. Deberías ver un JSON con estado del servidor

### ✅ Verificar que los Endpoints Funcionan

1. Inicia sesión y obtén un token
2. Prueba los endpoints de mensajes
3. Verifica que las respuestas sean correctas

### ✅ Verificar que la Base de Datos Funciona

1. Abre Prisma Studio
2. Verifica que las tablas existen
3. Verifica que puedes crear mensajes

### ✅ Verificar que la App Funciona

1. Inicia la app frontend
2. Inicia sesión
3. Haz un match
4. Acepta el match
5. Abre el chat
6. Envía mensajes

## 🐛 Problemas Comunes

### Error: "No autenticado"
- Verifica que estés enviando el token en el header `Authorization: Bearer <token>`
- Verifica que el token no haya expirado

### Error: "Match no encontrado"
- Verifica que el `matchId` existe
- Verifica que el usuario participa en ese match

### Error: "Solo puedes enviar mensajes en matches aceptados"
- El match debe estar en estado "aceptado"
- Acepta el match primero antes de chatear

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` esté correcta en `backend/config.env`
- Verifica que la base de datos esté accesible

### Error: "Token inválido"
- Verifica que `JWT_SECRET` esté configurado en `backend/config.env`
- Reinicia el servidor después de cambiar la configuración

## ✅ Checklist de Verificación

- [ ] Servidor backend iniciado en `http://localhost:3000`
- [ ] Endpoint `/api/salud` responde correctamente
- [ ] Endpoint `/api/mensajes` está disponible (requiere auth)
- [ ] Base de datos conectada y sincronizada
- [ ] Prisma Studio funciona correctamente
- [ ] App frontend iniciada
- [ ] Usuario puede iniciar sesión
- [ ] Usuario puede hacer matches
- [ ] Usuario puede aceptar matches
- [ ] Usuario puede ver lista de matches
- [ ] Usuario puede abrir chat
- [ ] Usuario puede enviar mensajes
- [ ] Usuario puede ver mensajes
- [ ] Mensajes se actualizan automáticamente
- [ ] Mensajes se marcan como leídos automáticamente

## 🎉 Estado Final

- ✅ **Backend:** Completamente implementado y funcionando
- ✅ **Frontend:** Completamente implementado y funcionando
- ✅ **Base de datos:** Actualizada y sincronizada
- ✅ **Documentación:** Completa

**Todo está listo para probar!** 🚀


