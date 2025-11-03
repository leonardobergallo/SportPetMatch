# 📊 Estado de la API - SportPetMatch

## ✅ Backend API Completado

### **Archivos Creados**

#### Servicios y Utilidades
- ✅ `backend/src/utilidades/prisma.ts` - Cliente Prisma singleton
- ✅ `backend/src/servicios/jwtService.ts` - Servicio JWT completo

#### Middleware
- ✅ `backend/src/middleware/autenticacion.ts` - Middleware de autenticación JWT

#### Controladores
- ✅ `backend/src/controllers/authController.ts` - Autenticación completa
- ✅ `backend/src/controllers/usuarioController.ts` - CRUD usuarios
- ✅ `backend/src/controllers/mascotaController.ts` - CRUD mascotas
- ✅ `backend/src/controllers/eventoController.ts` - CRUD eventos + participación

#### Rutas
- ✅ `backend/src/rutas/auth.ts` - Rutas de autenticación
- ✅ `backend/src/rutas/usuarios.ts` - Rutas de usuarios
- ✅ `backend/src/rutas/mascotas.ts` - Rutas de mascotas
- ✅ `backend/src/rutas/eventos.ts` - Rutas de eventos

---

## 🔗 Endpoints Disponibles

### **Autenticación**
```
POST   /api/auth/registro         - Registro de nuevo usuario
POST   /api/auth/login            - Login de usuario
GET    /api/auth/dashboard        - Dashboard (requiere auth)
```

### **Usuarios**
```
GET    /api/usuarios/mi-perfil                 - Mi perfil (requiere auth)
PUT    /api/usuarios/mi-perfil                 - Actualizar perfil (requiere auth)
PUT    /api/usuarios/mi-perfil/cambiar-contraseña - Cambiar contraseña (requiere auth)
GET    /api/usuarios/:id                       - Ver usuario público
```

### **Mascotas** (todos requieren auth)
```
GET    /api/mascotas              - Listar mis mascotas
GET    /api/mascotas/:id          - Ver mascota
POST   /api/mascotas              - Crear mascota
PUT    /api/mascotas/:id          - Actualizar mascota
DELETE /api/mascotas/:id          - Eliminar mascota
```

### **Eventos**
```
GET    /api/eventos                - Listar eventos (público)
GET    /api/eventos/:id            - Ver evento (público)
POST   /api/eventos                - Crear evento (requiere auth)
PUT    /api/eventos/:id            - Actualizar evento (requiere auth)
DELETE /api/eventos/:id            - Eliminar evento (requiere auth)
POST   /api/eventos/:id/participar - Unirse a evento (requiere auth)
DELETE /api/eventos/:id/participar - Salir de evento (requiere auth)
```

---

## 🧪 Cómo Probar la API

### **1. Verificar que el servidor esté corriendo**
```bash
# El servidor debería estar en: http://localhost:3000
curl http://localhost:3000/api/salud
```

### **2. Registrar un nuevo usuario**
```bash
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nombre": "Usuario Prueba"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "usuario": {
      "id": "...",
      "email": "test@example.com",
      "nombre": "Usuario Prueba",
      ...
    },
    "token": "...",
    "refreshToken": "..."
  }
}
```

### **3. Hacer Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "usuario": { ... },
    "token": "...",
    "refreshToken": "..."
  }
}
```

### **4. Usar el token para endpoints protegidos**
```bash
# Guarda el token de la respuesta anterior
TOKEN="tu_token_aqui"

# Obtener dashboard
curl http://localhost:3000/api/auth/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Obtener mi perfil
curl http://localhost:3000/api/usuarios/mi-perfil \
  -H "Authorization: Bearer $TOKEN"

# Crear una mascota
curl -X POST http://localhost:3000/api/mascotas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Max",
    "tipo": "Perro",
    "raza": "Golden Retriever",
    "edad": 3
  }'

# Listar eventos
curl http://localhost:3000/api/eventos

# Crear un evento
curl -X POST http://localhost:3000/api/eventos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Carrera Matutina",
    "descripcion": "Carrera de 5km en el parque",
    "tipo": "carrera",
    "fechaInicio": "2025-11-15T08:00:00Z",
    "maxParticipantes": 20,
    "esPetFriendly": true
  }'
```

---

## ⚠️ Nota Importante

**Si la base de datos no está conectada**, los endpoints que usen Prisma fallarán. Para que todo funcione necesitas:

1. **Configurar la base de datos correctamente** en `backend/config.env`
2. **Ejecutar las migraciones**:
   ```bash
   cd backend
   npx prisma db push
   ```

O usar un servicio como Neon PostgreSQL y actualizar la `DATABASE_URL` en `config.env`.

---

## 📝 Archivo de Prueba

He creado `backend/test-api.http` con ejemplos de todas las peticiones que puedes usar con la extensión REST Client de VS Code.

---

## ✅ Estado Actual

- ✅ **Backend API Base**: COMPLETO
- ✅ **Autenticación**: COMPLETA
- ✅ **CRUD Usuarios**: COMPLETO
- ✅ **CRUD Mascotas**: COMPLETO
- ✅ **CRUD Eventos**: COMPLETO
- ⚠️ **Base de Datos**: Requiere configuración

**Próximo paso**: Configurar la base de datos o comenzar con el frontend que use estas APIs.

