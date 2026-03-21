<p align="center">
  <img src="frontend/assets/icon.png" alt="Indio" width="100" />
</p>

<h1 align="center">Indio</h1>
<p align="center"><strong>mi mejor amigo</strong></p>
<p align="center">
App gratis que conecta personas y mascotas en eventos, actividades y salidas pet-friendly.
</p>

---

## Funcionalidades

| Modulo | Que hace |
|--------|----------|
| **Eventos** | Crear y unirse a actividades deportivas pet-friendly con filtros por tipo, ubicacion y nivel. |
| **Matching** | Descubrir personas y mascotas compatibles con swipe, geolocalización y algoritmo de afinidad. |
| **Chat** | Coordinar salidas y encuentros directamente con tus matches. |
| **Mapa** | Visualizar eventos y usuarios cercanos en mapa interactivo. |
| **Mascotas** | Perfil detallado de cada mascota: datos, intereses y galeria de fotos. |
| **Perfil** | Gestionar tu cuenta, preferencias y ver estadisticas. |

---

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | Expo (React Native) · TypeScript · React Navigation · React Native Paper |
| Backend | Node.js · Express · Prisma · JWT |
| Base de datos | PostgreSQL (Neon) |
| Deploy | Vercel (monorepo: frontend + backend serverless) |
| PWA | Service Worker · manifest.json · instalable desde web |

---

## Inicio rapido

```bash
git clone https://github.com/leonardobergallo/SportPetMatch.git
cd SportPetMatch
npm install
```

Configurar variables de entorno:

```bash
cp backend/config.env.example backend/config.env   # editar con tus credenciales
cp frontend/.env.example frontend/.env               # editar si es necesario
```

Base de datos:

```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed          # crea usuario de prueba
cd ..
```

Ejecutar:

```bash
npm start                   # arranca el frontend (web)
npm run dev:backend         # en otra terminal, arranca el backend
```

---

## Scripts principales

| Comando | Que hace |
|---------|----------|
| `npm start` | Inicia el frontend (Expo web) |
| `npm run dev:backend` | Inicia el backend en desarrollo |
| `npm run dev:frontend` | Inicia el frontend en desarrollo |
| `npm run vercel-build` | Build completo para Vercel (backend + frontend + copia) |
| `npm run build:all` | Compila backend, frontend y copia archivos |

---

## Estructura del proyecto

```
SportPetMatch/
├── backend/
│   ├── src/              # Controladores, rutas, middleware
│   ├── prisma/           # Schema y seed
│   └── api/index.js      # Handler serverless para Vercel
├── frontend/
│   ├── src/
│   │   ├── pantallas/    # Pantallas de la app
│   │   ├── componentes/  # Componentes reutilizables
│   │   ├── servicios/    # Clientes API
│   │   ├── contextos/    # Auth, ubicacion
│   │   └── constantes/   # Tema y marca
│   └── web/              # index.html, manifest, landing, sw.js
├── docs/                 # Guias de deploy, PWA, AdMob, etc.
├── scripts/              # Scripts de build y publicacion
└── vercel.json           # Rewrites y config Vercel
```

---

## Deploy en Vercel

Es un **monorepo**: un solo proyecto en Vercel sirve frontend (estaticos) y backend (funcion serverless en `api/index.js`).

```bash
npm run vercel-build       # compilar todo localmente
git push origin main       # Vercel despliega automaticamente
```

Variables de entorno obligatorias en Vercel:

- `DATABASE_URL` — conexion PostgreSQL
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — secretos para tokens
- `NODE_ENV=production`
- `CORS_ORIGIN=https://tu-dominio.vercel.app`

Guia completa: [docs/PUBLICAR_VERCEL.md](docs/PUBLICAR_VERCEL.md)

---

## Instalar en celular (sin tiendas)

**PWA (recomendada):** abre la URL en Chrome (Android) o Safari (iPhone), menu > "Agregar a pantalla de inicio". Se instala como app nativa.

**APK Android:** genera un APK con EAS Build (`scripts/build-app-android.ps1`).

Guia: [docs/INSTALAR_SIN_TIENDAS.md](docs/INSTALAR_SIN_TIENDAS.md)

---

## Documentacion

| Guia | Archivo |
|------|---------|
| Deploy Vercel | [docs/PUBLICAR_VERCEL.md](docs/PUBLICAR_VERCEL.md) |
| Instalar sin tiendas | [docs/INSTALAR_SIN_TIENDAS.md](docs/INSTALAR_SIN_TIENDAS.md) |
| Copy de venta | [docs/COPY_VENTA_INDIO.md](docs/COPY_VENTA_INDIO.md) |
| AdMob (publicidad) | [docs/ADMOB.md](docs/ADMOB.md) |
| PWA | [docs/GUIA_PWA.md](docs/GUIA_PWA.md) |
| Estado de la API | [docs/ESTADO_API.md](docs/ESTADO_API.md) |
| Monorepo Vercel | [docs/DEPLOY_MONOREPO_VERCEL.md](docs/DEPLOY_MONOREPO_VERCEL.md) |

---

## Licencia

MIT
