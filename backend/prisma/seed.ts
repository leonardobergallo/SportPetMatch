// Seeder PRODUCCION para SportPetMatch
// Datos realistas para la beta regional: Santa Fe, Parana y alrededores

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Fechas base para eventos futuros
const AHORA = new Date();
const sumarDias = (dias: number, horas = 0) => {
  const d = new Date(AHORA);
  d.setDate(d.getDate() + dias);
  d.setHours(horas, 0, 0, 0);
  return d;
};

async function main() {
  console.log('🌱 Iniciando seed PRODUCCION SportPetMatch...');

  // Limpiar datos existentes
  await prisma.mensaje.deleteMany();
  await prisma.eventoParticipante.deleteMany();
  await prisma.match.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.mascota.deleteMany();
  await prisma.ubicacion.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🧹 Datos anteriores limpiados');

  const passwordHash = await bcrypt.hash('123456', 10);

  // ============================================
  // USUARIOS - Todos en zona Santa Fe / Parana
  // ============================================

  // Leo (usuario real, owner)
  const leo = await prisma.usuario.create({
    data: {
      email: 'leonardobergallo@gmail.com',
      password: passwordHash,
      nombre: 'Leonardo Bergallo',
      fechaNacimiento: new Date(1988, 6, 10),
      avatar: null,
      biografia: 'Fundador de Indio. Amante de los animales y la vida al aire libre. Siempre saliendo con mi perro.',
      ubicacionLat: -31.6333,
      ubicacionLng: -60.7000,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 3,
      intereses: ['caminar', 'eventos', 'mascotas', 'correr'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  await prisma.mascota.create({
    data: {
      usuarioId: leo.id,
      nombre: 'Indio',
      tipo: 'Perro',
      raza: 'Mestizo',
      edad: 4,
      peso: 20,
      altura: 48,
      color: 'Marrón',
      genero: 'Macho',
      esterilizado: true,
      nivelActividad: 4,
      personalidad: ['sociable', 'activo', 'curioso', 'cariñoso'],
      intereses: ['paseos', 'encuentros', 'jugar', 'correr'],
      vacunas: ['Rabia', 'Séxtuple'],
      fotos: [],
    },
  });

  // María - corredora con Golden
  const maria = await prisma.usuario.create({
    data: {
      email: 'maria@sportpetmatch.com',
      password: passwordHash,
      nombre: 'María González',
      fechaNacimiento: new Date(1996, 2, 15),
      avatar: 'https://i.pravatar.cc/300?img=47',
      biografia: 'Diseñadora y corredora. Salgo a correr con Max todas las mañanas por la Costanera. Busco gente para running y paseos.',
      ubicacionLat: -31.6400,
      ubicacionLng: -60.7100,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 3,
      intereses: ['correr', 'caminar', 'ciclismo'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

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
      nivelActividad: 4,
      personalidad: ['juguetón', 'sociable', 'energético'],
      intereses: ['correr', 'jugar en el parque', 'nadar'],
      vacunas: ['Rabia', 'Moquillo', 'Parvovirus'],
      fotos: ['https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400'],
    },
  });

  // Carlos - ciclista
  const carlos = await prisma.usuario.create({
    data: {
      email: 'carlos@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Carlos Rodríguez',
      fechaNacimiento: new Date(1989, 5, 20),
      avatar: 'https://i.pravatar.cc/300?img=12',
      biografia: 'Ciclista aficionado. Recorro la ruta de la costa todos los findes. Organizo salidas grupales.',
      ubicacionLat: -31.6500,
      ubicacionLng: -60.6900,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 4,
      intereses: ['ciclismo', 'senderismo'],
      tipoUsuario: 'solo',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  // Ana - dueña de múltiples mascotas
  const ana = await prisma.usuario.create({
    data: {
      email: 'ana@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Ana Martínez',
      fechaNacimiento: new Date(1992, 8, 10),
      avatar: 'https://i.pravatar.cc/300?img=32',
      biografia: 'Veterinaria de profesión. Tengo dos perros y un gato. Organizo playdates para socializar mascotas.',
      ubicacionLat: -31.6200,
      ubicacionLng: -60.6800,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 2,
      intereses: ['yoga', 'caminar', 'eventos'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

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
      nivelActividad: 5,
      personalidad: ['juguetón', 'sociable', 'energético'],
      intereses: ['correr', 'jugar', 'nadar'],
      vacunas: ['Rabia', 'Moquillo', 'Parvovirus', 'Hepatitis'],
      fotos: ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'],
    },
  });

  // Diego - entrenador
  const diego = await prisma.usuario.create({
    data: {
      email: 'diego@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Diego Fernández',
      fechaNacimiento: new Date(1994, 3, 5),
      avatar: 'https://i.pravatar.cc/300?img=15',
      biografia: 'Entrenador personal. Doy clases de running y funcional en el Parque del Sur. Sumate a mis sesiones.',
      ubicacionLat: -31.6450,
      ubicacionLng: -60.7150,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 5,
      intereses: ['crossfit', 'correr', 'ciclismo'],
      tipoUsuario: 'ambos',
      esPremium: true,
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  // Laura - principiante
  const laura = await prisma.usuario.create({
    data: {
      email: 'laura@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Laura Sánchez',
      fechaNacimiento: new Date(1999, 11, 18),
      avatar: 'https://i.pravatar.cc/300?img=45',
      biografia: 'Estudiante de arquitectura. Quiero empezar a hacer ejercicio con mi gato y conocer gente del palo.',
      ubicacionLat: -31.6550,
      ubicacionLng: -60.7200,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 1,
      intereses: ['yoga', 'caminar'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  await prisma.mascota.create({
    data: {
      usuarioId: laura.id,
      nombre: 'Milo',
      tipo: 'Gato',
      raza: 'Siamés',
      edad: 2,
      peso: 4.2,
      altura: 25,
      color: 'Crema y marrón',
      genero: 'Macho',
      esterilizado: true,
      nivelActividad: 2,
      personalidad: ['tranquilo', 'cariñoso', 'curioso'],
      intereses: ['dormir', 'explorar'],
      vacunas: ['Rabia', 'Triple felina'],
      fotos: ['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400'],
    },
  });

  // Pedro - de Paraná
  const pedro = await prisma.usuario.create({
    data: {
      email: 'pedro@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Pedro López',
      fechaNacimiento: new Date(1987, 10, 23),
      avatar: 'https://i.pravatar.cc/300?img=68',
      biografia: 'De Paraná, cruzo a Santa Fe seguido. Me encanta salir con mi border collie a correr y hacer senderismo.',
      ubicacionLat: -31.7319,
      ubicacionLng: -60.5237,
      ubicacionCiudad: 'Paraná',
      ubicacionPais: 'Argentina',
      nivelDeporte: 4,
      intereses: ['correr', 'senderismo', 'caminar'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  await prisma.mascota.create({
    data: {
      usuarioId: pedro.id,
      nombre: 'Rocco',
      tipo: 'Perro',
      raza: 'Border Collie',
      edad: 3,
      peso: 20,
      altura: 52,
      color: 'Blanco y negro',
      genero: 'Macho',
      esterilizado: true,
      nivelActividad: 5,
      personalidad: ['inteligente', 'activo', 'obediente'],
      intereses: ['correr', 'jugar frisbee', 'senderismo'],
      vacunas: ['Rabia', 'Séxtuple'],
      fotos: [],
    },
  });

  console.log('✅ 7 usuarios creados (todos Santa Fe / Paraná)');

  // ============================================
  // USUARIOS EXTRA para más matches y actividad
  // ============================================

  // Sofía - runner con husky
  const sofia = await prisma.usuario.create({
    data: {
      email: 'sofia@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Sofía Benítez',
      fechaNacimiento: new Date(1997, 4, 8),
      avatar: 'https://i.pravatar.cc/300?img=5',
      biografia: 'Profesora de educación física. Corro maratones y entreno perros. Mi husky Alaska es mi compañero de ruta.',
      ubicacionLat: -31.6420,
      ubicacionLng: -60.6850,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 5,
      intereses: ['correr', 'senderismo', 'ciclismo'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  await prisma.mascota.create({
    data: {
      usuarioId: sofia.id,
      nombre: 'Alaska',
      tipo: 'Perro',
      raza: 'Husky Siberiano',
      edad: 4,
      peso: 23,
      altura: 55,
      color: 'Gris y blanco',
      genero: 'Macho',
      esterilizado: true,
      nivelActividad: 5,
      personalidad: ['enérgico', 'aventurero', 'sociable'],
      intereses: ['correr', 'senderismo', 'nieve'],
      vacunas: ['Rabia', 'Séxtuple'],
      fotos: [],
    },
  });

  // Martín - con labrador, busca pareja de running
  const martin = await prisma.usuario.create({
    data: {
      email: 'martin@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Martín Díaz',
      fechaNacimiento: new Date(1993, 8, 14),
      avatar: 'https://i.pravatar.cc/300?img=60',
      biografia: 'Ingeniero en sistemas. Salgo a correr con mi labrador Thor todos los días. Busco gente piola para entrenar.',
      ubicacionLat: -31.6350,
      ubicacionLng: -60.7000,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 3,
      intereses: ['correr', 'caminar', 'eventos'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  await prisma.mascota.create({
    data: {
      usuarioId: martin.id,
      nombre: 'Thor',
      tipo: 'Perro',
      raza: 'Labrador',
      edad: 2,
      peso: 30,
      altura: 56,
      color: 'Chocolate',
      genero: 'Macho',
      esterilizado: false,
      nivelActividad: 4,
      personalidad: ['juguetón', 'cariñoso', 'obediente'],
      intereses: ['correr', 'nadar', 'buscar objetos'],
      vacunas: ['Rabia', 'Moquillo', 'Parvovirus'],
      fotos: [],
    },
  });

  // Julieta - yin yoga, sin mascota pero ama animales
  const julieta = await prisma.usuario.create({
    data: {
      email: 'julieta@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Julieta Ríos',
      fechaNacimiento: new Date(2000, 1, 22),
      avatar: 'https://i.pravatar.cc/300?img=44',
      biografia: 'Instructora de yoga y meditación. No tengo mascota propia pero amo los animales. Busco grupos para actividades al aire libre.',
      ubicacionLat: -31.6180,
      ubicacionLng: -60.7120,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 2,
      intereses: ['yoga', 'caminar', 'eventos'],
      tipoUsuario: 'solo',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  // Facundo - crossfit y perro rescatado
  const facundo = await prisma.usuario.create({
    data: {
      email: 'facundo@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Facundo Torres',
      fechaNacimiento: new Date(1990, 10, 5),
      avatar: 'https://i.pravatar.cc/300?img=11',
      biografia: 'Entreno crossfit y mi perra rescatada Lola me acompaña a todos lados. Busco compañeros de entrenamiento.',
      ubicacionLat: -31.6550,
      ubicacionLng: -60.7200,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 4,
      intereses: ['crossfit', 'correr', 'caminar'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  await prisma.mascota.create({
    data: {
      usuarioId: facundo.id,
      nombre: 'Lola',
      tipo: 'Perro',
      raza: 'Rescatada',
      edad: 3,
      peso: 18,
      altura: 45,
      color: 'Blanca con manchas',
      genero: 'Hembra',
      esterilizado: true,
      nivelActividad: 4,
      personalidad: ['leal', 'protectora', 'activa'],
      intereses: ['correr', 'jugar', 'acompañar'],
      vacunas: ['Rabia', 'Séxtuple'],
      fotos: [],
    },
  });

  // Natalia - caniche toy, busca paseos tranquilos
  const natalia = await prisma.usuario.create({
    data: {
      email: 'natalia@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Natalia Gómez',
      fechaNacimiento: new Date(1995, 6, 30),
      avatar: 'https://i.pravatar.cc/300?img=23',
      biografia: 'Médica pediatra. Tengo un caniche toy divino. Busco paseos tranquilos y encuentros pet-friendly.',
      ubicacionLat: -31.6307,
      ubicacionLng: -60.6950,
      ubicacionCiudad: 'Santa Fe Capital',
      ubicacionPais: 'Argentina',
      nivelDeporte: 1,
      intereses: ['caminar', 'eventos', 'mascotas'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  await prisma.mascota.create({
    data: {
      usuarioId: natalia.id,
      nombre: 'Coco',
      tipo: 'Perro',
      raza: 'Caniche Toy',
      edad: 5,
      peso: 4.5,
      altura: 28,
      color: 'Blanco',
      genero: 'Macho',
      esterilizado: true,
      nivelActividad: 2,
      personalidad: ['tranquilo', 'cariñoso', 'sociable'],
      intereses: ['paseos cortos', 'socializar', 'dormir'],
      vacunas: ['Rabia', 'Séxtuple'],
      fotos: [],
    },
  });

  // Tomás - de Paraná, runner con weimaraner
  const tomas = await prisma.usuario.create({
    data: {
      email: 'tomas@sportpetmatch.com',
      password: passwordHash,
      nombre: 'Tomás Ferrari',
      fechaNacimiento: new Date(1991, 2, 12),
      avatar: 'https://i.pravatar.cc/300?img=53',
      biografia: 'De Paraná. Corro todos los días con mi weimaraner Uma. Siempre listo para cruzar a Santa Fe a eventos.',
      ubicacionLat: -31.7410,
      ubicacionLng: -60.5150,
      ubicacionCiudad: 'Paraná',
      ubicacionPais: 'Argentina',
      nivelDeporte: 4,
      intereses: ['correr', 'ciclismo', 'senderismo'],
      tipoUsuario: 'con_mascota',
      onboardingCompletado: true,
      emailVerificado: true,
    },
  });

  await prisma.mascota.create({
    data: {
      usuarioId: tomas.id,
      nombre: 'Uma',
      tipo: 'Perro',
      raza: 'Weimaraner',
      edad: 3,
      peso: 28,
      altura: 62,
      color: 'Gris plata',
      genero: 'Hembra',
      esterilizado: true,
      nivelActividad: 5,
      personalidad: ['atlética', 'leal', 'cariñosa'],
      intereses: ['correr', 'nadar', 'senderismo'],
      vacunas: ['Rabia', 'Moquillo', 'Parvovirus'],
      fotos: [],
    },
  });

  console.log('✅ 13 usuarios totales (7 originales + 6 nuevos)');

  // ============================================
  // EVENTOS - Fechas actuales, zona Santa Fe
  // ============================================

  const e1 = await prisma.evento.create({
    data: {
      organizadorId: maria.id,
      titulo: 'Running matutino Costanera',
      descripcion: 'Salida grupal de running por la Costanera de Santa Fe. Ritmo tranquilo, ideal para principiantes e intermedios. Mascotas bienvenidas.',
      tipo: 'correr',
      nivelDificultad: 2,
      fechaInicio: sumarDias(1, 8),
      fechaFin: sumarDias(1, 9),
      duracion: 60,
      maxParticipantes: 15,
      esPetFriendly: true,
    },
  });

  const e2 = await prisma.evento.create({
    data: {
      organizadorId: carlos.id,
      titulo: 'Bicicleteada a Rincón',
      descripcion: 'Pedaleada grupal desde la Costanera hasta Rincón. 30km ida y vuelta. Parada para mates. Nivel intermedio.',
      tipo: 'ciclismo',
      nivelDificultad: 3,
      fechaInicio: sumarDias(3, 9),
      fechaFin: sumarDias(3, 12),
      duracion: 180,
      maxParticipantes: 12,
      esPetFriendly: false,
    },
  });

  const e3 = await prisma.evento.create({
    data: {
      organizadorId: ana.id,
      titulo: 'Playdate en el Parque del Sur',
      descripcion: 'Encuentro de perros y dueños en el Parque del Sur. Juegos, socialización y caminata relajada. Traé agua para tu mascota.',
      tipo: 'encuentro',
      nivelDificultad: 1,
      fechaInicio: sumarDias(2, 16),
      fechaFin: sumarDias(2, 18),
      duracion: 120,
      maxParticipantes: 25,
      esPetFriendly: true,
    },
  });

  const e4 = await prisma.evento.create({
    data: {
      organizadorId: diego.id,
      titulo: 'Entrenamiento funcional al aire libre',
      descripcion: 'Sesión de entrenamiento funcional y running para todos los niveles. Técnica, ejercicios y elongación. Cupos limitados.',
      tipo: 'entrenamiento',
      nivelDificultad: 3,
      fechaInicio: sumarDias(3, 7),
      fechaFin: sumarDias(3, 8),
      duracion: 60,
      maxParticipantes: 10,
      esPetFriendly: false,
      esPremium: true,
      precio: 2000,
    },
  });

  const e5 = await prisma.evento.create({
    data: {
      organizadorId: laura.id,
      titulo: 'Yoga entre árboles',
      descripcion: 'Sesión de yoga suave en el Parque Federal. Para principiantes que quieran conectar cuerpo y mente al aire libre. Traé mat.',
      tipo: 'yoga',
      nivelDificultad: 1,
      fechaInicio: sumarDias(4, 10),
      fechaFin: sumarDias(4, 11),
      duracion: 60,
      maxParticipantes: 15,
      esPetFriendly: true,
    },
  });

  const e6 = await prisma.evento.create({
    data: {
      organizadorId: pedro.id,
      titulo: 'Senderismo en el Puente Colgante',
      descripcion: 'Caminata por los senderos alrededor del Puente Colgante. Naturaleza, río y buena compañía. Ideal para ir con mascota.',
      tipo: 'senderismo',
      nivelDificultad: 2,
      fechaInicio: sumarDias(5, 9),
      fechaFin: sumarDias(5, 12),
      duracion: 180,
      maxParticipantes: 20,
      esPetFriendly: true,
    },
  });

  const e7 = await prisma.evento.create({
    data: {
      organizadorId: leo.id,
      titulo: 'Café con mascotas en Candioti',
      descripcion: 'Encuentro tranquilo en café pet-friendly del barrio Candioti. Charla, mates y buena onda. Conocé otros dueños de la comunidad.',
      tipo: 'social',
      nivelDificultad: 1,
      fechaInicio: sumarDias(2, 10),
      fechaFin: sumarDias(2, 11),
      duracion: 90,
      maxParticipantes: 15,
      esPetFriendly: true,
    },
  });

  const e8 = await prisma.evento.create({
    data: {
      organizadorId: maria.id,
      titulo: 'Running nocturno Costanera',
      descripcion: 'Trote liviano por la Costanera al atardecer. Ritmo suave, buena música y linda energía para cerrar el día.',
      tipo: 'correr',
      nivelDificultad: 2,
      fechaInicio: sumarDias(6, 19),
      fechaFin: sumarDias(6, 20),
      duracion: 60,
      maxParticipantes: 12,
      esPetFriendly: true,
    },
  });

  const e9 = await prisma.evento.create({
    data: {
      organizadorId: carlos.id,
      titulo: 'Ciclismo ruta 168',
      descripcion: 'Ruta por la RN 168 hasta el Túnel Subfluvial. 40km de pedaleo con paradas. Para ciclistas con experiencia.',
      tipo: 'ciclismo',
      nivelDificultad: 4,
      fechaInicio: sumarDias(7, 8),
      fechaFin: sumarDias(7, 11),
      duracion: 180,
      maxParticipantes: 8,
      esPetFriendly: false,
    },
  });

  const e10 = await prisma.evento.create({
    data: {
      organizadorId: ana.id,
      titulo: 'Picnic pet-friendly en el Parque Federal',
      descripcion: 'Picnic abierto para familias y mascotas. Traé algo para compartir y muchas ganas de pasar una linda tarde.',
      tipo: 'picnic',
      nivelDificultad: 1,
      fechaInicio: sumarDias(8, 15),
      fechaFin: sumarDias(8, 18),
      duracion: 180,
      maxParticipantes: 30,
      esPetFriendly: true,
    },
  });

  console.log('✅ 10 eventos creados (fechas actuales, zona Santa Fe/Paraná)');

  // ============================================
  // MATCHES
  // ============================================

  await prisma.match.create({
    data: {
      usuarioId: maria.id,
      usuarioMatchId: carlos.id,
      estado: 'pendiente',
    },
  });

  const matchMA = await prisma.match.create({
    data: {
      usuarioId: maria.id,
      usuarioMatchId: ana.id,
      estado: 'aceptado',
    },
  });

  await prisma.mensaje.create({
    data: {
      matchId: matchMA.id,
      usuarioId: maria.id,
      contenido: '¡Hola Ana! Vi que organizás playdates. Max y yo nos re sumamos al próximo 🐕',
      tipo: 'texto',
    },
  });

  await prisma.mensaje.create({
    data: {
      matchId: matchMA.id,
      usuarioId: ana.id,
      contenido: '¡Hola María! Genial, justo organicé uno para este finde en el Parque del Sur. Están invitados 🤗',
      tipo: 'texto',
      isLeido: true,
    },
  });

  const matchDL = await prisma.match.create({
    data: {
      usuarioId: diego.id,
      usuarioMatchId: laura.id,
      estado: 'aceptado',
    },
  });

  await prisma.mensaje.create({
    data: {
      matchId: matchDL.id,
      usuarioId: diego.id,
      contenido: 'Hola Lau! Vi que te interesa yoga y running. Doy clases grupales en el Parque del Sur, ¿te pinta probar una?',
      tipo: 'texto',
    },
  });

  const matchMP = await prisma.match.create({
    data: {
      usuarioId: maria.id,
      usuarioMatchId: pedro.id,
      estado: 'aceptado',
    },
  });

  // Más matches para la beta
  const matchMS = await prisma.match.create({
    data: { usuarioId: maria.id, usuarioMatchId: sofia.id, estado: 'aceptado' },
  });

  await prisma.mensaje.create({
    data: { matchId: matchMS.id, usuarioId: sofia.id, contenido: 'Hola María! Vi que corrés con tu golden. Yo tengo un husky, ¿hacemos running juntas? 🏃‍♀️', tipo: 'texto' },
  });

  const matchMM = await prisma.match.create({
    data: { usuarioId: martin.id, usuarioMatchId: maria.id, estado: 'pendiente' },
  });

  const matchFJ = await prisma.match.create({
    data: { usuarioId: facundo.id, usuarioMatchId: julieta.id, estado: 'aceptado' },
  });

  await prisma.mensaje.create({
    data: { matchId: matchFJ.id, usuarioId: julieta.id, contenido: 'Hola Facu! Me re interesa arrancar crossfit. Vi que tenés una perrita rescatada 😍', tipo: 'texto' },
  });

  const matchNT = await prisma.match.create({
    data: { usuarioId: natalia.id, usuarioMatchId: tomas.id, estado: 'pendiente' },
  });

  const matchCT = await prisma.match.create({
    data: { usuarioId: carlos.id, usuarioMatchId: tomas.id, estado: 'aceptado' },
  });

  await prisma.mensaje.create({
    data: { matchId: matchCT.id, usuarioId: carlos.id, contenido: 'Tomás! Justo estaba buscando alguien para pedalear a Paraná. Hacemos ruta juntos? 🚴', tipo: 'texto' },
  });

  const matchPS = await prisma.match.create({
    data: { usuarioId: pedro.id, usuarioMatchId: sofia.id, estado: 'aceptado' },
  });

  await prisma.mensaje.create({
    data: { matchId: matchPS.id, usuarioId: pedro.id, contenido: 'Sofía! Tu husky es hermoso. Cruzo a Santa Fe seguido, ¿hacemos senderismo por el Puente Colgante?', tipo: 'texto' },
  });

  console.log('✅ 10 matches creados con mensajes');

  // ============================================
  // PARTICIPANTES EN EVENTOS
  // ============================================

  const addParticipante = async (usuarioId: string, eventoId: string) => {
    await prisma.eventoParticipante.create({
      data: { usuarioId, eventoId, estado: 'confirmado' },
    });
  };

  // Running matutino - varios se unen
  await addParticipante(maria.id, e1.id);
  await addParticipante(ana.id, e1.id);
  await addParticipante(laura.id, e1.id);

  // Bicicleteada
  await addParticipante(carlos.id, e2.id);
  await addParticipante(diego.id, e2.id);

  // Playdate
  await addParticipante(ana.id, e3.id);
  await addParticipante(maria.id, e3.id);
  await addParticipante(laura.id, e3.id);
  await addParticipante(pedro.id, e3.id);

  // Entrenamiento funcional
  await addParticipante(diego.id, e4.id);
  await addParticipante(carlos.id, e4.id);

  // Yoga
  await addParticipante(laura.id, e5.id);
  await addParticipante(ana.id, e5.id);

  // Senderismo
  await addParticipante(pedro.id, e6.id);
  await addParticipante(leo.id, e6.id);

  // Café Candioti
  await addParticipante(leo.id, e7.id);
  await addParticipante(maria.id, e7.id);
  await addParticipante(laura.id, e7.id);

  console.log('✅ 19 participaciones en eventos creadas');

  console.log(`
╔══════════════════════════════════════════════════╗
║     🌱 SEED PRODUCCIÓN COMPLETADO              ║
╠══════════════════════════════════════════════════╣
║  13 usuarios  │  13 mascotas                     ║
║  10 eventos   │  +30 participaciones             ║
║  10 matches   │  7 conversaciones                ║
╠══════════════════════════════════════════════════╣
║  🔑 TODOS los usuarios usan contraseña: 123456  ║
╠══════════════════════════════════════════════════╣
║  👤 leonardobergallo@gmail.com                  ║
║     Leonardo Bergallo + Indio (perro mestizo)   ║
║     Santa Fe Capital                            ║
╠══════════════════════════════════════════════════╣
║  👤 maria@sportpetmatch.com                     ║
║     María González + Max (Golden Retriever)     ║
║     Santa Fe Capital                            ║
╠══════════════════════════════════════════════════╣
║  👤 carlos@sportpetmatch.com                    ║
║     Carlos Rodríguez (sin mascota)              ║
║     Santa Fe Capital - Ciclista                 ║
╠══════════════════════════════════════════════════╣
║  👤 ana@sportpetmatch.com                       ║
║     Ana Martínez + Luna (Labrador)              ║
║     Santa Fe Capital - Veterinaria              ║
╠══════════════════════════════════════════════════╣
║  👤 diego@sportpetmatch.com                     ║
║     Diego Fernández (entrenador, premium)       ║
║     Santa Fe Capital                            ║
╠══════════════════════════════════════════════════╣
║  👤 laura@sportpetmatch.com                     ║
║     Laura Sánchez + Milo (gato siamés)          ║
║     Santa Fe Capital - Principiante             ║
╠══════════════════════════════════════════════════╣
║  👤 pedro@sportpetmatch.com                     ║
║     Pedro López + Rocco (Border Collie)         ║
║     Paraná - Corredor                           ║
╠══════════════════════════════════════════════════╣
║  👤 sofia@sportpetmatch.com                     ║
║     Sofía Benítez + Alaska (Husky Siberiano)    ║
║     Santa Fe Capital - Runner                   ║
╠══════════════════════════════════════════════════╣
║  👤 martin@sportpetmatch.com                    ║
║     Martín Díaz + Thor (Labrador Chocolate)     ║
║     Santa Fe Capital - Runner                   ║
╠══════════════════════════════════════════════════╣
║  👤 julieta@sportpetmatch.com                   ║
║     Julieta Ríos (sin mascota)                  ║
║     Santa Fe Capital - Yoga                     ║
╠══════════════════════════════════════════════════╣
║  👤 facundo@sportpetmatch.com                   ║
║     Facundo Torres + Lola (Rescatada)           ║
║     Santa Fe Capital - Crossfit                 ║
╠══════════════════════════════════════════════════╣
║  👤 natalia@sportpetmatch.com                   ║
║     Natalia Gómez + Coco (Caniche Toy)          ║
║     Santa Fe Capital - Paseos                   ║
╠══════════════════════════════════════════════════╣
║  👤 tomas@sportpetmatch.com                     ║
║     Tomás Ferrari + Uma (Weimaraner)            ║
║     Paraná - Runner/Ciclista                    ║
╚══════════════════════════════════════════════════╝

📅 Eventos destacados (Santa Fe / Paraná):
  1. Running matutino Costanera — Mañana 8 AM
  2. Playdate en Parque del Sur — Pasado mañana 4 PM
  3. Café con mascotas en Candioti — Pasado mañana 10 AM
  4. Bicicleteada a Rincón — 30km, intermedio
  5. Yoga entre árboles — Parque Federal (pet-friendly!)
  6. Senderismo Puente Colgante — 3h, naturaleza
  7. Picnic pet-friendly — Parque Federal
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
