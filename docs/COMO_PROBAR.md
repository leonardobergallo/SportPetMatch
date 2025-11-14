# 🧪 Cómo Probar el Sistema de Chat - SportPetMatch

## ✅ Estado: TODO IMPLEMENTADO Y LISTO PARA PROBAR

## 📋 Resumen de lo Implementado

### Backend ✅
- ✅ API de mensajes completa (4 endpoints)
- ✅ Base de datos actualizada
- ✅ Rutas montadas en el servidor
- ✅ Validaciones de seguridad

### Frontend ✅
- ✅ PantallaChat completa
- ✅ PantallaMatches integrada con API
- ✅ Servicio de mensajes
- ✅ Navegación configurada

## 🚀 Pasos para Probar

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

Abre tu navegador o usa curl:

```bash
curl http://localhost:3000/api/salud
```

Deberías ver:
```json
{
  "mensaje": "¡Servidor SportPetMatch funcionando correctamente! 🐕‍🦺",
  "version": "1.0.0",
  "timestamp": "...",
  "entorno": "development",
  "baseDatos": "Conectada ✅"
}
```

### 3. Verificar Endpoints de Mensajes

Los endpoints de mensajes están disponibles en:
- `GET /api/mensajes/:matchId` - Obtener mensajes
- `POST /api/mensajes` - Enviar mensaje
- `PUT /api/mensajes/leer` - Marcar como leído
- `GET /api/mensajes/no-leidos/cantidad` - Obtener no leídos

**Nota:** Todos requieren autenticación JWT.

### 4. Iniciar la App Frontend

En otra terminal, ejecuta:

```bash
cd frontend
npm start
```

O si usas Expo:
```bash
cd frontend
npx expo start
```

### 5. Probar el Chat en la App

#### Paso 1: Iniciar Sesión
1. Abre la app en tu dispositivo/emulador
2. Inicia sesión con un usuario existente o crea uno nuevo

#### Paso 2: Hacer un Match
1. Ve a la pantalla de Matching
2. Haz un match con otro usuario
3. El otro usuario debe aceptar el match (estado "aceptado")

#### Paso 3: Abrir el Chat
1. Ve a la pantalla de Matches
2. Deberías ver la lista de matches aceptados
3. Toca en un match para abrir el chat

#### Paso 4: Enviar Mensajes
1. Escribe un mensaje en el input
2. Presiona el botón de enviar
3. El mensaje debería aparecer en el chat
4. El chat se actualiza automáticamente cada 5 segundos

## 🧪 Pruebas con Postman/Insomnia

Si quieres probar los endpoints directamente:

### 1. Registrarse o Iniciar Sesión

**POST /api/auth/registro**
```json
{
  "email": "test@example.com",
  "password": "password123",
  "nombre": "Usuario Test"
}
```

**POST /api/auth/login**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Guarda el `token` de la respuesta.

### 2. Obtener Matches

**GET /api/matches**
Headers:
```
Authorization: Bearer <token>
```

### 3. Obtener Mensajes de un Match

**GET /api/mensajes/:matchId**
Headers:
```
Authorization: Bearer <token>
```

### 4. Enviar un Mensaje

**POST /api/mensajes**
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

### 5. Marcar Mensajes como Leídos

**PUT /api/mensajes/leer**
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

### 6. Obtener Mensajes No Leídos

**GET /api/mensajes/no-leidos/cantidad**
Headers:
```
Authorization: Bearer <token>
```

## 🔍 Verificar Base de Datos

Puedes usar Prisma Studio para ver los datos:

```bash
cd backend
npx prisma studio
```

Esto abrirá Prisma Studio en `http://localhost:5555` donde podrás ver:
- Tabla `mensajes` con los mensajes
- Tabla `matches` con los matches
- Relación entre `mensajes` y `matches`

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

## 📊 Estado Final

- ✅ **Backend:** Completamente implementado
- ✅ **Frontend:** Completamente implementado
- ✅ **Base de datos:** Actualizada y sincronizada
- ✅ **Documentación:** Completa

**Todo está listo para probar!** 🎉


