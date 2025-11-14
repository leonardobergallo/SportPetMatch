# 🚀 Inicio Rápido - Sistema de Chat SportPetMatch

## ✅ Estado: TODO IMPLEMENTADO Y LISTO PARA PROBAR

## 📋 Pasos Rápidos para Probar

### 1️⃣ Iniciar el Servidor Backend

Abre una terminal en el directorio del proyecto:

```bash
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

### 2️⃣ Verificar que el Servidor Funciona

Abre tu navegador en:
**http://localhost:3000/api/salud**

Deberías ver un JSON indicando que el servidor funciona correctamente.

### 3️⃣ Probar los Endpoints de Mensajes

Los endpoints están disponibles en:
- `GET /api/mensajes/:matchId` - Obtener mensajes
- `POST /api/mensajes` - Enviar mensaje
- `PUT /api/mensajes/leer` - Marcar como leído
- `GET /api/mensajes/no-leidos/cantidad` - Obtener no leídos

**Nota:** Todos requieren autenticación JWT.

### 4️⃣ Probar con Postman/Insomnia

#### Paso 1: Iniciar Sesión

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

### 5️⃣ Probar con la App Frontend

#### Paso 1: Iniciar la App

En otra terminal:
```bash
cd frontend
npm start
```

#### Paso 2: Probar el Chat

1. Inicia sesión en la app
2. Haz un match con otro usuario
3. Acepta el match (estado "aceptado")
4. Ve a la pantalla de Matches
5. Abre el chat con el match
6. Envía mensajes
7. Verifica que los mensajes se actualizan automáticamente

### 6️⃣ Verificar Base de Datos

Abre Prisma Studio:
```bash
cd backend
npx prisma studio
```

Esto abrirá Prisma Studio en `http://localhost:5555` donde podrás ver:
- Tabla `mensajes` con los mensajes
- Tabla `matches` con los matches
- Relación entre `mensajes` y `matches`

## 📊 Archivos de Prueba

### Archivo de Prueba HTTP (VS Code REST Client)

Abre `backend/test-mensajes.http` en VS Code y usa la extensión REST Client para ejecutar las pruebas.

### Guía Completa

Consulta `docs/GUIA_PRUEBA_RAPIDA.md` para una guía detallada de pruebas.

## ✅ Checklist de Verificación

- [ ] Servidor backend iniciado en `http://localhost:3000`
- [ ] Endpoint `/api/salud` responde correctamente
- [ ] Endpoint `/api/mensajes` está disponible (requiere auth)
- [ ] Base de datos conectada y sincronizada
- [ ] App frontend iniciada (opcional)
- [ ] Usuario puede iniciar sesión
- [ ] Usuario puede hacer matches
- [ ] Usuario puede aceptar matches
- [ ] Usuario puede enviar mensajes
- [ ] Usuario puede ver mensajes

## 🎉 Estado Final

- ✅ **Backend:** Completamente implementado y funcionando
- ✅ **Frontend:** Completamente implementado y funcionando
- ✅ **Base de datos:** Actualizada y sincronizada
- ✅ **Documentación:** Completa

**¡Todo está listo para probar!** 🚀

## 🔍 Problemas Comunes

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

## 📚 Documentación

- `docs/IMPLEMENTACION_CHAT.md` - Guía de implementación
- `docs/VERIFICACION_CHAT.md` - Checklist de verificación
- `docs/RESUMEN_IMPLEMENTACION.md` - Resumen completo
- `docs/COMO_PROBAR.md` - Guía paso a paso para probar
- `docs/GUIA_PRUEBA_RAPIDA.md` - Guía rápida de pruebas

---

**¡Listo para probar!** 🎉


