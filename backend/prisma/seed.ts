// Seeder para SportPetMatch - Usuarios de Ejemplo Documentados
// Basado en los perfiles de FLUJO_APLICACION.md y EJEMPLOS_USUARIOS.md

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de SportPetMatch con usuarios de ejemplo...');

  // Limpiar datos existentes
  await prisma.mensaje.deleteMany();
  await prisma.eventoParticipante.deleteMany();
  await prisma.match.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.mascota.deleteMany();
  await prisma.ubicacion.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🧹 Datos anteriores limpiados');

  // Hash para contraseñas (todas usan "123456" para pruebas)
  const passwordHash = await bcrypt.hash('123456', 10);

  // Coordenadas de ciudades argentinas
  const ciudades = {
    santaFe: { lat: -31.6333, lng: -60.7000, ciudad: 'Santa Fe Capital', pais: 'Argentina' },
    rosario: { lat: -32.9442, lng: -60.6505, ciudad: 'Rosario', pais: 'Argentina' },
    cordoba: { lat: -31.4201, lng: -64.1888, ciudad: 'Córdoba', pais: 'Argentina' },
    buenosAires: { lat: -34.6037, lng: -58.3816, ciudad: 'Buenos Aires', pais: 'Argentina' },
    mendoza: { lat: -32.8895, lng: -68.8458, ciudad: 'Mendoza', pais: 'Argentina' },
  };

  // ============================================
  // USUARIO 1: María - Corredora con Perro
  // ============================================
  const maria = await prisma.usuario.create({
    data: {
      email: 'maria.gonzalez@sportpetmatch.com',
      password: passwordHash,
      nombre: 'María González',
      fechaNacimiento: new Date(1996, 2, 15), // 28 años
      telefono: '+5493415123456',
      avatar: 'https://i.pravatar.cc/300?img=47',
      biografia: 'Diseñadora gráfica que ama correr con su perro Max todas las mañanas. Siempre buscando nuevas rutas y compañía para hacer ejercicio.',
      ubicacionLat: ciudades.santaFe.lat,
      ubicacionLng: ciudades.santaFe.lng,
      ubicacionCiudad: ciudades.santaFe.ciudad,
      ubicacionPais: ciudades.santaFe.pais,
      nivelDeporte: 3, // Intermedio
      intereses: ['correr', 'caminar'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  // Mascota de María: Max (Golden Retriever)
  await prisma.mascota.create({
    data: {
      usuarioId: maria.id,
      nombre: 'Max',
      tipo: 'Perro',
      raza: 'Golden Retriever',
      edad: 3,
      peso: 32.5,
      altura: 58,
      color: 'Dorado',
      genero: 'Macho',
      esterilizado: true,
      nivelActividad: 4, // Alto
      personalidad: ['juguetón', 'sociable', 'energético'],
      intereses: ['correr', 'jugar en el parque', 'nadar'],
      vacunas: ['Rabia', 'Moquillo', 'Parvovirus'],
      fotos: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400'],
    },
  });

  console.log('✅ Usuario 1 creado: María González con Max');

  // ============================================
  // USUARIO 2: Carlos - Ciclista Solitario
  // ============================================
  const carlos = await prisma.usuario.create({
    data: {
      email: 'carlos.rodriguez@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Carlos Rodríguez',
      fechaNacimiento: new Date(1989, 5, 20), // 35 años
      telefono: '+5493415234567',
      avatar: 'https://i.pravatar.cc/300?img=12',
      biografia: 'Ingeniero apasionado por el ciclismo. Organizo salidas grupales los fines de semana y busco explorar nuevas rutas.',
      ubicacionLat: ciudades.rosario.lat,
      ubicacionLng: ciudades.rosario.lng,
      ubicacionCiudad: ciudades.rosario.ciudad,
      ubicacionPais: ciudades.rosario.pais,
      nivelDeporte: 5, // Avanzado
      intereses: ['ciclismo', 'senderismo'],
      tipoUsuario: 'solo',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  console.log('✅ Usuario 2 creado: Carlos Rodríguez (sin mascota)');

  // ============================================
  // USUARIO 3: Ana - Dueña de Múltiples Mascotas
  // ============================================
  const ana = await prisma.usuario.create({
    data: {
      email: 'ana.martinez@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Ana Martínez',
      fechaNacimiento: new Date(1992, 8, 10), // 32 años
      telefono: '+5493512345678',
      avatar: 'https://i.pravatar.cc/300?img=32',
      biografia: 'Veterinaria que ama hacer ejercicio con sus mascotas. Organizo playdates para que mis perros socialicen mientras hacemos ejercicio.',
      ubicacionLat: ciudades.cordoba.lat,
      ubicacionLng: ciudades.cordoba.lng,
      ubicacionCiudad: ciudades.cordoba.ciudad,
      ubicacionPais: ciudades.cordoba.pais,
      nivelDeporte: 2, // Principiante-Intermedio
      intereses: ['yoga', 'caminar', 'senderismo'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  // Mascota 1 de Ana: Luna (Labrador)
  await prisma.mascota.create({
    data: {
      usuarioId: ana.id,
      nombre: 'Luna',
      tipo: 'Perro',
      raza: 'Labrador',
      edad: 4,
      peso: 28.0,
      altura: 55,
      color: 'Negro',
      genero: 'Hembra',
      esterilizado: true,
      nivelActividad: 5, // Muy activa
      personalidad: ['juguetón', 'sociable', 'energético'],
      intereses: ['correr', 'jugar', 'nadar'],
      vacunas: ['Rabia', 'Moquillo', 'Parvovirus', 'Hepatitis'],
      fotos: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'],
    },
  });

  // Mascota 2 de Ana: Rocky (Beagle)
  await prisma.mascota.create({
    data: {
      usuarioId: ana.id,
      nombre: 'Rocky',
      tipo: 'Perro',
      raza: 'Beagle',
      edad: 2,
      peso: 12.0,
      altura: 38,
      color: 'Tricolor',
      genero: 'Macho',
      esterilizado: false,
      nivelActividad: 4, // Alto
      personalidad: ['juguetón', 'curioso', 'sociable'],
      intereses: ['jugar', 'explorar', 'correr'],
      vacunas: ['Rabia', 'Moquillo', 'Parvovirus'],
      fotos: ['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400'],
    },
  });

  // Mascota 3 de Ana: Mimi (Gato)
  await prisma.mascota.create({
    data: {
      usuarioId: ana.id,
      nombre: 'Mimi',
      tipo: 'Gato',
      raza: 'Doméstico',
      edad: 5,
      peso: 4.5,
      altura: 25,
      color: 'Atigrado',
      genero: 'Hembra',
      esterilizado: true,
      nivelActividad: 1, // Bajo (gato tranquilo)
      personalidad: ['tranquilo', 'cariñoso', 'independiente'],
      intereses: ['dormir', 'jugar suave'],
      vacunas: ['Rabia', 'Triple felina'],
      fotos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'],
    },
  });

  console.log('✅ Usuario 3 creado: Ana Martínez con Luna, Rocky y Mimi');

  // ============================================
  // USUARIO 4: Diego - Entrenador Personal
  // ============================================
  const diego = await prisma.usuario.create({
    data: {
      email: 'diego.fernandez@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Diego Fernández',
      fechaNacimiento: new Date(1994, 3, 5), // 30 años
      telefono: '+5491123456789',
      avatar: 'https://i.pravatar.cc/300?img=15',
      biografia: 'Entrenador personal especializado en actividades grupales. Organizo eventos de entrenamiento y busco clientes que quieran mejorar su condición física.',
      ubicacionLat: ciudades.buenosAires.lat,
      ubicacionLng: ciudades.buenosAires.lng,
      ubicacionCiudad: ciudades.buenosAires.ciudad,
      ubicacionPais: ciudades.buenosAires.pais,
      nivelDeporte: 5, // Avanzado
      intereses: ['crossfit', 'correr', 'ciclismo'],
      tipoUsuario: 'ambos',
      esPremium: true, // Entrenador premium
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  console.log('✅ Usuario 4 creado: Diego Fernández (Entrenador)');

  // ============================================
  // USUARIO 5: Laura - Principiante con Gato
  // ============================================
  const laura = await prisma.usuario.create({
    data: {
      email: 'laura.sanchez@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Laura Sánchez',
      fechaNacimiento: new Date(1999, 11, 18), // 25 años
      telefono: '+5492612345678',
      avatar: 'https://i.pravatar.cc/300?img=45',
      biografia: 'Estudiante universitaria que está empezando a hacer ejercicio. Busco eventos para principiantes y personas que me puedan guiar.',
      ubicacionLat: ciudades.mendoza.lat,
      ubicacionLng: ciudades.mendoza.lng,
      ubicacionCiudad: ciudades.mendoza.ciudad,
      ubicacionPais: ciudades.mendoza.pais,
      nivelDeporte: 1, // Principiante
      intereses: ['yoga', 'caminar'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  // Mascota de Laura: Luna (Gato)
  await prisma.mascota.create({
    data: {
      usuarioId: laura.id,
      nombre: 'Luna',
      tipo: 'Gato',
      raza: 'Doméstico',
      edad: 2,
      peso: 3.8,
      altura: 23,
      color: 'Blanco y negro',
      genero: 'Hembra',
      esterilizado: true,
      nivelActividad: 1, // Bajo
      personalidad: ['tranquilo', 'cariñoso'],
      intereses: ['dormir', 'jugar suave'],
      vacunas: ['Rabia', 'Triple felina'],
      fotos: ['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400'],
    },
  });

  console.log('✅ Usuario 5 creado: Laura Sánchez con Luna (gato)');

  // ============================================
  // CREAR EVENTOS DE EJEMPLO
  // ============================================

  // Evento 1: María organiza running matutino
  const evento1 = await prisma.evento.create({
    data: {
      organizadorId: maria.id,
      titulo: 'Running matutino en el parque - Sábado',
      descripcion: 'Salida grupal de running por el parque. Perfecto para principiantes e intermedios. ¡Mascotas bienvenidas!',
      tipo: 'correr',
      nivelDificultad: 2,
      fechaInicio: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días desde ahora
      fechaFin: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hora después
      maxParticipantes: 15,
      esPetFriendly: true,
    },
  });

  // Evento 2: Carlos organiza ruta ciclística
  const evento2 = await prisma.evento.create({
    data: {
      organizadorId: carlos.id,
      titulo: 'Ruta ciclística por la costa - Domingo',
      descripcion: 'Salida grupal de 40km por la costa. Nivel intermedio-avanzado. Parada para desayuno.',
      tipo: 'ciclismo',
      nivelDificultad: 4,
      fechaInicio: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días desde ahora
      fechaFin: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 horas después
      maxParticipantes: 15,
      esPetFriendly: false,
    },
  });

  // Evento 3: Ana organiza playdate
  const evento3 = await prisma.evento.create({
    data: {
      organizadorId: ana.id,
      titulo: 'Playdate en el parque - Perros y dueños',
      descripcion: 'Encuentro para que nuestros perros jueguen mientras hacemos ejercicio ligero. Caminata relajada.',
      tipo: 'caminar',
      nivelDificultad: 1,
      fechaInicio: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 días desde ahora
      fechaFin: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 horas después
      maxParticipantes: 20,
      esPetFriendly: true,
    },
  });

  // Evento 4: Diego organiza entrenamiento grupal
  const evento4 = await prisma.evento.create({
    data: {
      organizadorId: diego.id,
      titulo: 'Entrenamiento grupal de running - Principiantes',
      descripcion: 'Sesión de entrenamiento para principiantes. Técnica de carrera, ejercicios funcionales y estiramientos.',
      tipo: 'correr',
      nivelDificultad: 1,
      fechaInicio: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días desde ahora
      fechaFin: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 90 minutos después
      maxParticipantes: 10,
      esPetFriendly: false,
      esPremium: true,
    },
  });

  // Evento 5: Laura organiza yoga suave
  const evento5 = await prisma.evento.create({
    data: {
      organizadorId: laura.id,
      titulo: 'Yoga en el parque - Principiantes',
      descripcion: 'Sesión de yoga suave al aire libre. Perfecto para principiantes. Trae tu mat y agua.',
      tipo: 'yoga',
      nivelDificultad: 1,
      fechaInicio: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 días desde ahora
      fechaFin: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hora después
      maxParticipantes: 12,
      esPetFriendly: true,
    },
  });

  console.log('✅ 5 eventos creados');

  // ============================================
  // CREAR MATCHES DE EJEMPLO
  // ============================================

  // Match entre María y Carlos (pendiente)
  await prisma.match.create({
    data: {
      usuarioId: maria.id,
      usuarioMatchId: carlos.id,
      estado: 'pendiente',
    },
  });

  // Match entre María y Ana (aceptado - pueden chatear)
  const matchMaríaAna = await prisma.match.create({
    data: {
      usuarioId: maria.id,
      usuarioMatchId: ana.id,
      estado: 'aceptado',
    },
  });

  // Mensaje de ejemplo en el match María-Ana
  await prisma.mensaje.create({
    data: {
      matchId: matchMaríaAna.id,
      usuarioId: maria.id,
      contenido: '¡Hola Ana! Vi que también tienes perros. ¿Te gustaría hacer una carrera juntos algún día?',
      tipo: 'texto',
    },
  });

  await prisma.mensaje.create({
    data: {
      matchId: matchMaríaAna.id,
      usuarioId: ana.id,
      contenido: '¡Hola María! Sí, me encantaría. Mis perros Luna y Rocky adoran correr. ¿Qué tal el sábado por la mañana?',
      tipo: 'texto',
      isLeido: true,
    },
  });

  // Match entre Diego y Laura (aceptado)
  const matchDiegoLaura = await prisma.match.create({
    data: {
      usuarioId: diego.id,
      usuarioMatchId: laura.id,
      estado: 'aceptado',
    },
  });

  // Mensaje de ejemplo en el match Diego-Laura
  await prisma.mensaje.create({
    data: {
      matchId: matchDiegoLaura.id,
      usuarioId: diego.id,
      contenido: 'Hola Laura! Vi que empezaste con yoga. Soy entrenador personal y organizo sesiones grupales. ¿Te interesaría unirte?',
      tipo: 'texto',
    },
  });

  console.log('✅ Matches y mensajes de ejemplo creados');

  // ============================================
  // CREAR PARTICIPANTES EN EVENTOS
  // ============================================

  // Varios usuarios se unen a eventos
  await prisma.eventoParticipante.create({
    data: {
      usuarioId: ana.id,
      eventoId: evento1.id, // Ana se une al running de María
      estado: 'confirmado',
    },
  });

  await prisma.eventoParticipante.create({
    data: {
      usuarioId: laura.id,
      eventoId: evento1.id, // Laura se une al running de María
      estado: 'confirmado',
    },
  });

  await prisma.eventoParticipante.create({
    data: {
      usuarioId: maria.id,
      eventoId: evento3.id, // María se une al playdate de Ana
      estado: 'confirmado',
    },
  });

  console.log('✅ Participantes en eventos creados');

  console.log(`
  🌱 Seed completado exitosamente!
  
  📊 Resumen de datos creados:
  - 5 usuarios de ejemplo con perfiles detallados
  - 5 mascotas (Max, Luna, Rocky, Mimi, Luna)
  - 5 eventos deportivos
  - 3 matches (2 aceptados con mensajes)
  - 3 participantes en eventos
  
  🔑 Usuarios de prueba (todos con password: 123456):
  
  1. María González (Corredora con Perro)
     Email: maria.gonzalez@sportpetmatch.com
     Ubicación: Santa Fe Capital
     Mascota: Max (Golden Retriever)
  
  2. Carlos Rodríguez (Ciclista)
     Email: carlos.rodriguez@sportpetmatch.com
     Ubicación: Rosario
     Sin mascota
  
  3. Ana Martínez (Veterinaria con múltiples mascotas)
     Email: ana.martinez@sportpetmatch.com
     Ubicación: Córdoba
     Mascotas: Luna (Labrador), Rocky (Beagle), Mimi (Gato)
  
  4. Diego Fernández (Entrenador Personal)
     Email: diego.fernandez@sportpetmatch.com
     Ubicación: Buenos Aires
     Premium: Sí
  
  5. Laura Sánchez (Principiante)
     Email: laura.sanchez@sportpetmatch.com
     Ubicación: Mendoza
     Mascota: Luna (Gato)
  
  💡 Puedes iniciar sesión con cualquiera de estos usuarios para probar la app.
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
