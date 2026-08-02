# INDIO — Flujo de App y Usuarios QA

**Fecha:** 5 Julio 2026

---

## 🔑 USUARIOS (contraseña: `123456` para todos)

| Email | Nombre | Mascota | Perfil |
|-------|--------|---------|--------|
| `maria@sportpetmatch.com` | María González | Max (Golden) | **Recomendado para QA** |
| `leonardobergallo@gmail.com` | Leonardo Bergallo | Indio (Mestizo) | Owner |
| `carlos@sportpetmatch.com` | Carlos Rodríguez | — | Ciclista |
| `ana@sportpetmatch.com` | Ana Martínez | Luna (Labrador) | Veterinaria |
| `diego@sportpetmatch.com` | Diego Fernández | — | Entrenador Premium |
| `laura@sportpetmatch.com` | Laura Sánchez | Milo (Siamés) | Principiante |
| `pedro@sportpetmatch.com` | Pedro López | Rocco (Border Collie) | Paraná |
| `sofia@sportpetmatch.com` | Sofía Benítez | Alaska (Husky) | Runner |
| `martin@sportpetmatch.com` | Martín Díaz | Thor (Labrador) | Runner |
| `julieta@sportpetmatch.com` | Julieta Ríos | — | Yoga |
| `facundo@sportpetmatch.com` | Facundo Torres | Lola (Rescatada) | Crossfit |
| `natalia@sportpetmatch.com` | Natalia Gómez | Coco (Caniche) | Paseos |
| `tomas@sportpetmatch.com` | Tomás Ferrari | Uma (Weimaraner) | Paraná runner |

---

## 📱 FLUJO DE LA APP

### 1. LOGIN
```
Landing → Login → Token guardado → App
```
- URL Expo Go: `exp://192.168.1.3:8081`
- URL Web: `http://localhost:4000/app?app=1`
- Si no tenés cuenta → Registro → Onboarding → App

### 2. TABS PRINCIPALES (7 tabs inferiores)

| Tab | Qué hace |
|-----|----------|
| **Inicio** | Feed con actividad reciente |
| **Matching** | Descubrí personas → ❤️ o ✖ → Si ambos ❤️ = Match |
| **Mapa** | Usuarios y eventos cercanos en el mapa |
| **Eventos** | Lista de eventos → tocá uno → **Unirse al Evento** |
| **Mascotas** | Tus mascotas → Agregar / Editar |
| **Chats** | Conversaciones con tus matches |
| **Perfil** | Tus datos → Editar / Cerrar sesión |

### 3. FLUJO COMPLETO DE PRUEBA (15 min)

```
1. Login con maria@sportpetmatch.com / 123456
2. Tab Inicio → ver feed de actividad
3. Tab Matching → ver perfiles, dar ❤️ a algunos
4. Tab Mapa → ver usuarios y eventos en el mapa
5. Tab Eventos → elegir "Playdate en el Parque del Sur" → Unirse
6. Tab Mascotas → ver a Max (Golden Retriever)
7. Tab Chats → ver conversaciones con Ana y Sofía
8. Tab Perfil → ver datos, cerrar sesión
```

### 4. EVENTOS DISPONIBLES (10)

| Evento | Organizador | Participantes |
|--------|-------------|---------------|
| Running matutino Costanera | María | 4 |
| Café con mascotas en Candioti | Leonardo | 3 |
| Playdate en el Parque del Sur | Ana | 4 |
| Entrenamiento funcional | Diego | 3 |
| Bicicleteada a Rincón | Carlos | 2 |
| Yoga entre árboles | Laura | 2 |
| Senderismo Puente Colgante | Pedro | 2 |
| Running nocturno Costanera | María | 0 |
| Ciclismo ruta 168 | Carlos | 0 |
| Picnic pet-friendly Parque Federal | Ana | 0 |

### 5. MATCHES DE MARÍA

| Match | Estado | Tiene chat |
|-------|--------|------------|
| Sofía Benítez | aceptado | ✅ |
| Ana Martínez | aceptado | ✅ |
| Pedro López | aceptado | ❌ |

---

## 🔧 SOLUCIÓN ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| "Failed to fetch" | API caída | Reiniciar backend: `npm run --prefix backend dev` |
| "Could not connect to dev server" | Metro caído o IP incorrecta | Reiniciar Expo: `npx expo start --lan` |
| "Usuario no encontrado" | Email viejo | Usar `maria@sportpetmatch.com` (sin "gonzalez") |
| Mapa no carga en celu | Solo funciona en web | En móvil abre Google Maps con el botón |

---

## 🌐 URLs

| Entorno | URL |
|---------|-----|
| Web local | `http://localhost:4000/` |
| API local | `http://localhost:3000/api` |
| Expo Go | `exp://192.168.1.3:8081` |
| Producción | `https://indio.com.ar` |
