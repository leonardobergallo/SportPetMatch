# SportPetMatch / Indio — Accesos QA

**Fecha:** 25 de Junio 2026  
**Rama:** `main` → `marketsantafe`  
**Git:** https://github.com/marketsantafeoficial-a11y/SportPetMatch2

---

## URLs

| Entorno | URL |
|---------|-----|
| Producción | `https://indio.com.ar` |
| Producción (www) | `https://www.indio.com.ar` |
| QA Local Web | `http://localhost:4000/` |
| QA Local App | `http://localhost:4000/app?app=1` |
| QA Local API | `http://localhost:3000/api` |
| QA Local Metro | `http://192.168.1.3:8081` (Expo Go) |

---

## Servidores

| Componente | Comando |
|------------|---------|
| Backend | `npm run --prefix backend dev` |
| Frontend build | `npm run --prefix frontend build` |
| Frontend static | `npx http-server frontend/dist -p 4000 -c-1` |
| Expo Go metro | `npx expo start --lan` (desde `frontend/`) |
| Seed DB | `npx prisma db seed` (desde `backend/`) |
| VPS Build | `npm run vps-build` |

---

## Usuarios

**Contraseña para todos: `123456`**

| Email | Nombre | Mascota | Perfil |
|-------|--------|---------|--------|
| `leonardobergallo@gmail.com` | Leonardo Bergallo | Indio | Fundador |
| `maria@sportpetmatch.com` | María González | Max (Golden) | Runner |
| `carlos@sportpetmatch.com` | Carlos Rodríguez | — | Ciclista |
| `ana@sportpetmatch.com` | Ana Martínez | Luna (Labrador) | Veterinaria |
| `diego@sportpetmatch.com` | Diego Fernández | — | Entrenador Premium |
| `laura@sportpetmatch.com` | Laura Sánchez | Milo (Siamés) | Yoga |
| `pedro@sportpetmatch.com` | Pedro López | Rocco (Border Collie) | Paraná runner |
| `sofia@sportpetmatch.com` | Sofía Benítez | Alaska (Husky) | Runner |
| `martin@sportpetmatch.com` | Martín Díaz | Thor (Labrador) | Runner |
| `julieta@sportpetmatch.com` | Julieta Ríos | — | Yoga |
| `facundo@sportpetmatch.com` | Facundo Torres | Lola (Rescatada) | Crossfit |
| `natalia@sportpetmatch.com` | Natalia Gómez | Coco (Caniche) | Paseos |
| `tomas@sportpetmatch.com` | Tomás Ferrari | Uma (Weimaraner) | Paraná runner |

---

## Eventos activos (10)

1. Running matutino Costanera — María
2. Café con mascotas en Candioti — Leonardo
3. Playdate en el Parque del Sur — Ana
4. Entrenamiento funcional al aire libre — Diego
5. Bicicleteada a Rincón — Carlos
6. Yoga entre árboles — Laura
7. Senderismo Puente Colgante — Pedro
8. Running nocturno Costanera — María
9. Ciclismo ruta 168 — Carlos
10. Picnic pet-friendly Parque Federal — Ana

---

## Matches activos (María)

- Sofía Benítez (aceptado)
- Ana Martínez (aceptado)
- Pedro López (aceptado)

---

## VPS / Coolify

| Config | Valor |
|--------|-------|
| IP | `69.62.64.252` |
| Puerto interno | `3016` |
| Ports Exposes | `3016` |
| PORT env | `3016` |
| Build Pack | Nixpacks |
| Git Source | `github.com/marketsantafeoficial-a11y/SportPetMatch2` |
| Ramas | `main` |

---

## Flujo de la app

1. Landing → Login → `/app?app=1` (React App)
2. Inicio → Mapa → Eventos → Matching → Chat → Perfil
3. Eventos → Tocar card → Detalle → "Unirse al Evento"
4. Mapa → Marcadores → Modal → "Ver evento"

---

## Endpoints Backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/registro` | Registro |
| POST | `/api/auth/recuperar-password` | Recuperar contraseña |
| POST | `/api/auth/reset-password` | Reset contraseña |
| GET | `/api/eventos` | Listar eventos |
| GET | `/api/eventos/:id` | Detalle evento |
| POST | `/api/eventos/:id/participar` | Unirse a evento |
| DELETE | `/api/eventos/:id/participar` | Salir de evento |
| GET | `/api/matches` | Listar matches |
| GET | `/api/mascotas` | Listar mascotas |
| GET | `/api/salud` | Health check |
