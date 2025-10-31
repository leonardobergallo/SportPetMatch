// Seeder para SportPetMatch - Datos de prueba realistas
// Incluye usuarios con geolocalización, mascotas y eventos deportivos

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de SportPetMatch...');

  // Limpiar datos existentes
  await prisma.eventoParticipante.deleteMany();
  await prisma.match.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.mascota.deleteMany();
  await prisma.ubicacion.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🧹 Datos anteriores limpiados');

  // Hash para contraseñas
  const passwordHash = await bcrypt.hash('123456', 10);

  // Datos de ubicaciones específicas de Santa Fe Capital con coordenadas reales
  const ubicacionesSantaFe = [
    { nombre: 'Centro', lat: -31.6333, lng: -60.7000, barrio: 'Centro', descripcion: 'Centro histórico de Santa Fe' },
    { nombre: 'Candioti Sur', lat: -31.6240, lng: -60.7080, barrio: 'Candioti Sur', descripcion: 'Zona residencial tranquila' },
    { nombre: 'Barranquitas', lat: -31.6420, lng: -60.6850, barrio: 'Barranquitas', descripcion: 'Barrio familiar con espacios verdes' },
    { nombre: 'Guadalupe Norte', lat: -31.6180, lng: -60.7120, barrio: 'Guadalupe Norte', descripcion: 'Zona norte en crecimiento' },
    { nombre: 'Costanera', lat: -31.6280, lng: -60.6900, barrio: 'Costanera', descripcion: 'Zona ribereña ideal para deportes' },
    { nombre: 'Parque Sur', lat: -31.6450, lng: -60.6950, barrio: 'Parque Sur', descripcion: 'Área verde con espacios deportivos' },
    { nombre: 'La Guardia', lat: -31.6350, lng: -60.7150, barrio: 'La Guardia', descripcion: 'Barrio tradicional santafesino' },
    { nombre: 'Villa Setúbal', lat: -31.6200, lng: -60.6800, barrio: 'Villa Setúbal', descripcion: 'Cerca de la laguna, ideal para outdoor' },
  ];

  // Crear usuarios con ubicaciones reales
  const usuarios = [];
  const nombresUsuarios = [
    { nombre: 'Ana García', email: 'ana@example.com', bio: 'Amo correr con mi perro todas las mañanas. Siempre buscando nuevas rutas y compañía!' },
    { nombre: 'Carlos Ruiz', email: 'carlos@example.com', bio: 'Entrenador personal especializado en actividades con mascotas. Mi gato Michi es mi copiloto.' },
    { nombre: 'María López', email: 'maria@example.com', bio: 'Veterinaria y atleta amateur. Me encanta el senderismo con mi Golden Retriever.' },
    { nombre: 'Luis Chen', email: 'luis@example.com', bio: 'Ciclista urbano que ama explorar la ciudad con mi Border Collie inteligente.' },
    { nombre: 'Elena Martín', email: 'elena@example.com', bio: 'Instructora de yoga que practica con mi gata Luna. Buscamos grupos zen.' },
    { nombre: 'Diego Silva', email: 'diego@example.com', bio: 'Runner profesional. Mi Husky Siberiano es mi compañero de entrenamientos intensos.' },
    { nombre: 'Sofía Herrera', email: 'sofia@example.com', bio: 'Estudiante de medicina veterinaria. Organizo caminatas grupales los fines de semana.' },
    { nombre: 'Ricardo Torres', email: 'ricardo@example.com', bio: 'Fotógrafo de naturaleza. Mis dos pastores alemanes son mis modelos favoritos.' },
  ];

  for (let i = 0; i < nombresUsuarios.length; i++) {
    const ubicacion = ubicacionesSantaFe[i % ubicacionesSantaFe.length];
    // Variación de coordenadas para simular diferentes ubicaciones exactas dentro del barrio
    const latVariacion = (Math.random() - 0.5) * 0.01; // ±0.005 grados (~500m)
    const lngVariacion = (Math.random() - 0.5) * 0.01;

    const usuario = await prisma.usuario.create({
      data: {
        email: nombresUsuarios[i].email,
        password: passwordHash,
        nombre: nombresUsuarios[i].nombre,
        fechaNacimiento: new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        telefono: `+54911${Math.floor(Math.random() * 90000000) + 10000000}`,
        avatar: `https://picsum.photos/200/200?random=${i + 1}`,
        biografia: nombresUsuarios[i].bio,
        ubicacionLat: ubicacion.lat + latVariacion,
        ubicacionLng: ubicacion.lng + lngVariacion,
        ubicacionCiudad: `${ubicacion.nombre}, Santa Fe`,
        ubicacionPais: 'Argentina',
        nivelDeporte: Math.floor(Math.random() * 5) + 1,
        intereses: ['futbol', 'correr', 'senderismo', 'ciclismo', 'yoga'].slice(0, Math.floor(Math.random() * 3) + 2),
        esPremium: Math.random() > 0.7, // 30% premium
      }
    });
    usuarios.push(usuario);
  }

  console.log(`✅ Creados ${usuarios.length} usuarios con ubicaciones`);

  // Crear mascotas para cada usuario
  // Datos más realistas para mascotas
  const razasPerros = ['Golden Retriever', 'Labrador', 'Border Collie', 'Husky Siberiano', 'Pastor Alemán', 'Bulldog Francés', 'Beagle', 'Cocker Spaniel', 'Pitbull', 'Mestizo'];
  const razasGatos = ['Doméstico', 'Siamés', 'Persa', 'Maine Coon', 'British Shorthair', 'Ragdoll', 'Bengalí', 'Ruso Azul'];
  const nombresPerros = ['Max', 'Luna', 'Rocky', 'Bella', 'Charlie', 'Mia', 'Zeus', 'Coco', 'Thor', 'Storm', 'Buddy', 'Lola'];
  const nombresGatos = ['Michi', 'Whiskers', 'Salem', 'Mittens', 'Shadow', 'Oreo', 'Simba', 'Nala', 'Garfield', 'Felix'];
  const personalidadesMascota = ['cariñoso', 'juguetón', 'energético', 'tranquilo', 'sociable', 'protector', 'inteligente', 'independiente'];
  const interesesMascota = ['correr', 'jugar', 'explorar', 'nadar', 'buscar', 'socializar', 'entrenar', 'caminar'];

  for (const usuario of usuarios) {
    const cantidadMascotas = Math.random() > 0.6 ? 2 : 1; // 40% tiene 2 mascotas
    
    for (let j = 0; j < cantidadMascotas; j++) {
      const esPerro = Math.random() > 0.3; // 70% perros
      const raza = esPerro ? 
        razasPerros[Math.floor(Math.random() * razasPerros.length)] : 
        razasGatos[Math.floor(Math.random() * razasGatos.length)];
      
      await prisma.mascota.create({
        data: {
          usuarioId: usuario.id,
          nombre: esPerro ? 
            nombresPerros[Math.floor(Math.random() * nombresPerros.length)] : 
            nombresGatos[Math.floor(Math.random() * nombresGatos.length)],
          tipo: esPerro ? 'perro' : 'gato',
          raza: raza,
          edad: Math.floor(Math.random() * 12) + 1,
          peso: esPerro ? Math.floor(Math.random() * 30) + 5 : Math.floor(Math.random() * 8) + 2,
          genero: Math.random() > 0.5 ? 'macho' : 'hembra',
          fotos: [`https://picsum.photos/300/300?random=${usuario.id}${j + 10}`],
          nivelActividad: Math.floor(Math.random() * 5) + 1,
          personalidad: personalidadesMascota.slice(0, Math.floor(Math.random() * 3) + 1),
          intereses: interesesMascota.slice(0, Math.floor(Math.random() * 3) + 1),
        }
      });
    }
  }

  console.log('🐕 Mascotas creadas');

  // Crear ubicaciones específicas de Santa Fe
  const ubicacionesCreadas = [];
  
  for (const ubicacion of ubicacionesSantaFe) {
    const ubicacionCreada = await prisma.ubicacion.create({
      data: {
        nombre: ubicacion.nombre,
        direccion: `${ubicacion.barrio}, Santa Fe, Argentina`,
        ciudad: 'Santa Fe',
        pais: 'Argentina',
        latitud: ubicacion.lat,
        longitud: ubicacion.lng,
        tipo: 'parque'
      }
    });
    ubicacionesCreadas.push(ubicacionCreada);
  }

  // Ubicaciones adicionales para eventos deportivos en Santa Fe
  const ubicacionesDeportivas = [
    {
      nombre: 'Costanera Este',
      direccion: 'Costanera Este, Santa Fe',
      lat: -31.6280,
      lng: -60.6900,
      tipo: 'costanera'
    },
    {
      nombre: 'Parque Sur',
      direccion: 'Parque Sur, Santa Fe',
      lat: -31.6450,
      lng: -60.6950,
      tipo: 'parque'
    },
    {
      nombre: 'Plaza de Mayo',
      direccion: 'Plaza de Mayo, Centro, Santa Fe',
      lat: -31.6320,
      lng: -60.7010,
      tipo: 'plaza'
    }
  ];

  for (const ubicacion of ubicacionesDeportivas) {
    const ubicacionCreada = await prisma.ubicacion.create({
      data: {
        nombre: ubicacion.nombre,
        direccion: ubicacion.direccion,
        ciudad: 'Santa Fe',
        pais: 'Argentina',
        latitud: ubicacion.lat,
        longitud: ubicacion.lng,
        tipo: ubicacion.tipo
      }
    });
    ubicacionesCreadas.push(ubicacionCreada);
  }

  console.log('📍 Ubicaciones creadas');

  // Eventos deportivos específicos de Santa Fe con ubicaciones reales
  const eventosTemplates = [
    {
      titulo: 'Running matutino en Costanera',
      descripcion: 'Grupo de running para principiantes y experimentados. Recorrido por la costanera de Santa Fe. ¡Mascotas bienvenidas!',
      tipo: 'correr'
    },
    {
      titulo: 'Caminata grupal en Parque Sur',
      descripcion: 'Caminata relajada por el parque. Ideal para mascotas de todas las edades.',
      tipo: 'caminar'
    },
    {
      titulo: 'Cycling Tour por el centro',
      descripcion: 'Recorrido en bicicleta por el centro histórico de Santa Fe. Actividad cultural y deportiva.',
      tipo: 'ciclismo'
    },
    {
      titulo: 'Yoga con mascotas en Parque Sur',
      descripcion: 'Sesión de yoga al aire libre junto a tu mascota en el Parque Sur.',
      tipo: 'yoga'
    },
    {
      titulo: 'Paddle en Club Náutico',
      descripcion: 'Torneo de paddle para todos los niveles. ¡Con espacio para mascotas!',
      tipo: 'paddle'
    },
    {
      titulo: 'Trekking urbano en Centro',
      descripcion: 'Caminata urbana descubriendo la historia del centro santafesino.',
      tipo: 'caminar'
    },
    {
      titulo: 'Running nocturno por Costanera',
      descripcion: 'Corrida nocturna por la costanera con vista al río.',
      tipo: 'correr'
    },
    {
      titulo: 'Natación en Laguna Setúbal',
      descripcion: 'Actividad acuática en la laguna. ¡Perfecto para perros que aman el agua!',
      tipo: 'natacion'
    }
  ];

  for (let i = 0; i < 15; i++) {
    const organizador = usuarios[Math.floor(Math.random() * usuarios.length)];
    const eventoTemplate = eventosTemplates[i % eventosTemplates.length];
    const ubicacionSeleccionada = ubicacionesCreadas[Math.floor(Math.random() * ubicacionesCreadas.length)];
    
    const fechaEvento = new Date();
    fechaEvento.setDate(fechaEvento.getDate() + Math.floor(Math.random() * 30) + 1); // Próximos 30 días

    const eventoCreado = await prisma.evento.create({
      data: {
        organizadorId: organizador.id,
        titulo: eventoTemplate.titulo,
        descripcion: eventoTemplate.descripcion,
        tipo: eventoTemplate.tipo,
        nivelDificultad: Math.floor(Math.random() * 5) + 1,
        fechaInicio: fechaEvento,
        fechaFin: new Date(fechaEvento.getTime() + (2 * 60 * 60 * 1000)), // 2 horas después
        maxParticipantes: Math.floor(Math.random() * 20) + 5,
        precio: Math.random() > 0.7 ? Math.floor(Math.random() * 500) + 100 : 0, // 30% eventos pagos
        esPetFriendly: Math.random() > 0.1, // 90% pet-friendly
      }
    });

    // Asociar el evento con una ubicación
    await prisma.ubicacionEvento.create({
      data: {
        eventoId: eventoCreado.id,
        ubicacionId: ubicacionSeleccionada.id
      }
    });
  }

  console.log('🏃‍♂️ Eventos deportivos creados');

  // Crear algunos matches para el algoritmo tipo Tinder
  const usuarioBase = usuarios[0]; // Ana García será nuestro usuario de prueba
  
  for (let i = 1; i < Math.min(usuarios.length, 6); i++) {
    await prisma.match.create({
      data: {
        usuarioId: usuarioBase.id,
        usuarioMatchId: usuarios[i].id,
        estado: ['pendiente', 'aceptado', 'rechazado'][Math.floor(Math.random() * 3)],
      }
    });
  }

  console.log('💕 Matches creados');

  console.log('🌱 Seed completado exitosamente!');
  console.log(`
  📊 Resumen de datos creados:
  - ${usuarios.length} usuarios con ubicaciones geolocalizadas
  - Mascotas para cada usuario
  - 15 eventos deportivos distribuidos geográficamente
  - 5 matches para pruebas del algoritmo
  
  🔑 Usuario de prueba:
  - Email: ana@example.com
  - Password: 123456
  - Ubicación: Buenos Aires (con matches y eventos cerca)
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