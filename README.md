# 🐕‍🦺 SportPetMatch

Una aplicación móvil innovadora que une personas y mascotas en eventos, desafíos y actividades deportivas, fomentando un estilo de vida saludable para ambos.

## 🚀 Características Principales

### 🏃‍♂️ Eventos Deportivos
- Crear y participar en eventos deportivos
- Filtros avanzados por tipo, ubicación y nivel
- Sistema de calificaciones y reseñas
- Eventos pet-friendly especializados

### 🐾 Gestión de Mascotas
- Perfiles detallados de mascotas
- Registro de salud y vacunas
- Intereses y preferencias deportivas
- Galería de fotos

### 💕 Sistema de Matching
- Algoritmo de compatibilidad
- Geolocalización para encuentros cercanos
- Chat integrado
- Sistema de reportes y seguridad

### 🎮 Gamificación
- Desafíos deportivos
- Sistema de logros y badges
- Monedas virtuales
- Rankings y competencias

### 💰 Monetización
- Suscripciones premium
- Compras in-app
- Eventos exclusivos
- Marketplace de productos

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express** - Servidor web
- **PostgreSQL** (Neon) - Base de datos
- **Prisma** - ORM
- **JWT** - Autenticación
- **MercadoPago** - Pagos
- **Resend** - Email
- **WhatsApp API** - Notificaciones

### Frontend Mobile
- **Expo** (React Native) - Framework móvil
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación
- **React Native Paper** - UI Components
- **React Query** - Estado del servidor
- **Zustand** - Estado local
- **Geolocalización** - Ubicación
- **Cámara** - Fotos

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Expo CLI
- PostgreSQL (o cuenta en Neon)

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/sportpetmatch.git
cd sportpetmatch
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# Frontend
cp frontend/.env.example frontend/.env
# Editar frontend/.env con tus configuraciones
```

4. **Configurar base de datos**
```bash
cd backend
npx prisma generate
npx prisma db push
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 📱 Scripts Disponibles

- `npm run dev` - Ejecuta backend y frontend en modo desarrollo
- `npm run dev:backend` - Solo backend
- `npm run dev:frontend` - Solo frontend
- `npm run build` - Construye para producción
- `npm run test` - Ejecuta todos los tests

## 🏗️ Estructura del Proyecto

```
sportpetmatch/
├── backend/                 # API y servidor
│   ├── src/
│   │   ├── controllers/     # Controladores de rutas
│   │   ├── models/          # Modelos de Prisma
│   │   ├── routes/          # Definición de rutas
│   │   ├── middleware/      # Middleware personalizado
│   │   ├── services/        # Lógica de negocio
│   │   └── utils/           # Utilidades
│   ├── prisma/              # Esquemas de base de datos
│   └── tests/               # Tests del backend
├── frontend/                # Aplicación móvil
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── screens/         # Pantallas de la app
│   │   ├── navigation/      # Configuración de navegación
│   │   ├── services/        # Servicios API
│   │   ├── store/           # Estado global (Zustand)
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilidades
│   └── assets/              # Imágenes, fuentes, etc.
└── docs/                    # Documentación
```

## 🔐 Autenticación

- **JWT** para autenticación de sesión
- **Google OAuth** opcional para registro rápido
- **Verificación de email** obligatoria
- **Recuperación de contraseña** por email

## 📍 Geolocalización

- **Eventos cercanos** basados en ubicación
- **Rutas optimizadas** para caminatas/carreras
- **Filtros de distancia** personalizables
- **Mapas integrados** para visualización

## 💳 Pagos

- **MercadoPago** integrado
- **Suscripciones premium** mensuales/anuales
- **Compras in-app** para monedas virtuales
- **Eventos de pago** para actividades especiales

## 🔔 Notificaciones

- **Push notifications** para eventos y matches
- **Email** para confirmaciones y recordatorios
- **WhatsApp** para notificaciones importantes
- **Configuración personalizable** por usuario

## 🧪 Testing

- **Tests unitarios** con Jest
- **Tests E2E** con Detox (futuro)
- **Cobertura de código** configurada
- **CI/CD** con GitHub Actions

## 🚀 Deployment

- **Backend**: Vercel o Railway
- **Frontend**: Expo Application Services (EAS)
- **Base de datos**: Neon (PostgreSQL)
- **CDN**: Cloudinary para imágenes

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🤝 Soporte

- **Email**: soporte@sportpetmatch.com
- **Discord**: [Servidor de la comunidad](https://discord.gg/sportpetmatch)
- **Reporte in-app**: Disponible en la configuración

## 🎯 Roadmap

- [ ] Versión MVP (Q1 2024)
- [ ] Integración completa de pagos
- [ ] Sistema de chat avanzado
- [ ] IA para matching inteligente
- [ ] Versión web complementaria
- [ ] API pública para desarrolladores

---

Hecho con ❤️ para la comunidad de amantes de las mascotas y el deporte.
