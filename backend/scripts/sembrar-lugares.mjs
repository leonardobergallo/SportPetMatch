// Semilla de lugares pet friendly para Indio
// Uso: node --env-file=.env scripts/sembrar-lugares.mjs
// Es idempotente: actualiza por slug sin borrar datos existentes.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const lugares = [
  // Santa Fe - espacios publicos
  {
    slug: 'santa-fe-parque-federal',
    nombre: 'Parque Federal',
    descripcion: 'Gran espacio verde con senderos, sombra y sectores para caminar con tu mascota.',
    categoria: 'parque',
    direccion: 'Sargento Cabral, Santa Fe',
    ciudad: 'Santa Fe',
    provincia: 'Santa Fe',
    latitud: -31.6221628,
    longitud: -60.6957438,
    verificado: true,
    destacado: true,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'santa-fe-parque-del-sur',
    nombre: 'Parque del Sur Manuel Belgrano',
    descripcion: 'Parque amplio y arbolado, ideal para paseos largos y encuentros con otras mascotas.',
    categoria: 'parque',
    direccion: 'Pedro Candioti Sud, Santa Fe',
    ciudad: 'Santa Fe',
    provincia: 'Santa Fe',
    latitud: -31.6623824,
    longitud: -60.7087437,
    verificado: true,
    destacado: false,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'santa-fe-parque-biblioteca-constitucion',
    nombre: 'Parque Biblioteca de la Constitución',
    descripcion: 'Paseo junto a la costanera con espacio abierto para caminar y disfrutar del río.',
    categoria: 'parque',
    direccion: 'Costanera, Santa Fe',
    ciudad: 'Santa Fe',
    provincia: 'Santa Fe',
    latitud: -31.6695437,
    longitud: -60.7163769,
    verificado: true,
    destacado: true,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'santa-fe-parque-juan-de-garay',
    nombre: 'Parque Juan de Garay',
    descripcion: 'Espacio verde barrial con calles internas para caminar con correa.',
    categoria: 'parque',
    direccion: 'Santa Fe',
    ciudad: 'Santa Fe',
    provincia: 'Santa Fe',
    latitud: -31.6364559,
    longitud: -60.7198970,
    verificado: true,
    destacado: false,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'santa-fe-plaza-pueyrredon',
    nombre: 'Plaza Pueyrredón',
    descripcion: 'Plaza céntrica rodeada de bares y restaurantes, punto de encuentro para salir con tu perro.',
    categoria: 'plaza',
    direccion: 'Candioti Sud, Santa Fe',
    ciudad: 'Santa Fe',
    provincia: 'Santa Fe',
    latitud: -31.6383310,
    longitud: -60.6929794,
    verificado: true,
    destacado: true,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'santa-fe-plaza-de-las-banderas',
    nombre: 'Plaza de las Banderas',
    descripcion: 'Plaza abierta en Candioti Norte, cómoda para una caminata corta con tu mascota.',
    categoria: 'plaza',
    direccion: 'Candioti Norte, Santa Fe',
    ciudad: 'Santa Fe',
    provincia: 'Santa Fe',
    latitud: -31.6314969,
    longitud: -60.6932441,
    verificado: true,
    destacado: false,
    zonaPetFriendly: 'exterior',
  },

  // Santa Fe - comercio recomendado por la comunidad
  {
    slug: 'santa-fe-cioccolata-pasteleria',
    nombre: 'Cioccolata Pastelería & Cafetería',
    descripcion: 'Cafetería y pastelería con mesas exteriores. Dato de la comunidad: aceptan perros afuera. Confirmá antes de ir.',
    categoria: 'cafeteria',
    direccion: 'Santiago del Estero 2497, Santa Fe',
    ciudad: 'Santa Fe',
    provincia: 'Santa Fe',
    latitud: -31.6381144,
    longitud: -60.7031245,
    verificado: false,
    destacado: false,
    zonaPetFriendly: 'exterior',
    fuente: 'comunidad',
  },

  // Parana - espacios publicos
  {
    slug: 'parana-parque-urquiza',
    nombre: 'Parque Urquiza',
    descripcion: 'Parque histórico con vistas al río, sombra y caminos para pasear con tu mascota.',
    categoria: 'parque',
    direccion: 'Paraná',
    ciudad: 'Paraná',
    provincia: 'Entre Ríos',
    latitud: -31.7192848,
    longitud: -60.5323456,
    verificado: true,
    destacado: true,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'parana-plaza-1-de-mayo',
    nombre: 'Plaza 1° de Mayo',
    descripcion: 'Plaza céntrica de Paraná, ideal para una pausa y una vuelta con tu perro.',
    categoria: 'plaza',
    direccion: 'Paraná',
    ciudad: 'Paraná',
    provincia: 'Entre Ríos',
    latitud: -31.7330143,
    longitud: -60.5297813,
    verificado: true,
    destacado: false,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'parana-parque-gazzano',
    nombre: 'Parque Gazzano',
    descripcion: 'Espacio verde amplio para caminar y jugar con tu mascota.',
    categoria: 'parque',
    direccion: 'Paraná',
    ciudad: 'Paraná',
    provincia: 'Entre Ríos',
    latitud: -31.7676368,
    longitud: -60.5011804,
    verificado: true,
    destacado: false,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'parana-plaza-alvear',
    nombre: 'Plaza Alvear',
    descripcion: 'Plaza arbolada con calles tranquilas para pasear con correa.',
    categoria: 'plaza',
    direccion: 'Paraná',
    ciudad: 'Paraná',
    provincia: 'Entre Ríos',
    latitud: -31.7278274,
    longitud: -60.5291208,
    verificado: true,
    destacado: false,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'parana-costanera',
    nombre: 'Costanera de Paraná',
    descripcion: 'Paseo costero para caminar con tu mascota y disfrutar del río.',
    categoria: 'paseo',
    direccion: 'Anacleto Medina sur, Paraná',
    ciudad: 'Paraná',
    provincia: 'Entre Ríos',
    latitud: -31.7444127,
    longitud: -60.5581830,
    verificado: true,
    destacado: true,
    zonaPetFriendly: 'exterior',
  },

  // Rosario - espacios publicos y cafes recomendados por la comunidad
  {
    slug: 'rosario-parque-independencia',
    nombre: 'Parque de la Independencia',
    descripcion: 'Parque histórico de Rosario con senderos, sombra y espacio para pasear con tu mascota.',
    categoria: 'parque',
    direccion: 'Rosario Centro, Rosario',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    latitud: -32.9591546,
    longitud: -60.6600095,
    verificado: true,
    destacado: true,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'rosario-parque-urquiza',
    nombre: 'Parque Urquiza',
    descripcion: 'Parque con vista al río y caminos para pasear con correa.',
    categoria: 'parque',
    direccion: 'Distrito Centro, Rosario',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    latitud: -32.9572424,
    longitud: -60.6235400,
    verificado: true,
    destacado: false,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'rosario-costanera',
    nombre: 'Costanera de Rosario',
    descripcion: 'Paseo costero para caminar con tu mascota y disfrutar del río.',
    categoria: 'paseo',
    direccion: 'Saladillo Sur, Rosario',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    latitud: -33.0004614,
    longitud: -60.6164926,
    verificado: true,
    destacado: true,
    zonaPetFriendly: 'exterior',
  },
  {
    slug: 'rosario-pancho-pet-friendly-cafe',
    nombre: 'PANCHO - pet friendly cafe',
    descripcion: 'Cafetería de especialidad pet friendly. Dato de la comunidad: reciben perros. Confirmá antes de ir.',
    categoria: 'cafeteria',
    direccion: '3 de Febrero 3203, Rosario',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    latitud: -32.9476584,
    longitud: -60.6687015,
    verificado: false,
    destacado: false,
    zonaPetFriendly: 'ambos',
    fuente: 'comunidad',
  },
  {
    slug: 'rosario-constant-cafe',
    nombre: 'constant cafe',
    descripcion: 'Café de especialidad que recibe mascotas. Dato de la comunidad: confirmá las condiciones antes de ir.',
    categoria: 'cafeteria',
    direccion: 'San Juan 1144, Rosario',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    latitud: -32.9500014,
    longitud: -60.6397104,
    verificado: false,
    destacado: false,
    zonaPetFriendly: 'ambos',
    fuente: 'comunidad',
  },
];

async function main() {
  let creados = 0;
  let actualizados = 0;

  for (const lugar of lugares) {
    const datos = {
      nombre: lugar.nombre,
      descripcion: lugar.descripcion,
      categoria: lugar.categoria,
      direccion: lugar.direccion,
      ciudad: lugar.ciudad,
      provincia: lugar.provincia,
      pais: lugar.pais || 'Argentina',
      latitud: lugar.latitud,
      longitud: lugar.longitud,
      fotos: [],
      permitePerros: true,
      zonaPetFriendly: lugar.zonaPetFriendly || 'exterior',
      requiereCorrea: true,
      aguaParaMascotas: false,
      verificado: Boolean(lugar.verificado),
      destacado: Boolean(lugar.destacado),
      fuente: lugar.fuente || 'manual',
      isActive: true,
    };

    const existente = await prisma.lugarPetFriendly.findUnique({ where: { slug: lugar.slug } });

    if (existente) {
      await prisma.lugarPetFriendly.update({ where: { slug: lugar.slug }, data: datos });
      actualizados += 1;
    } else {
      await prisma.lugarPetFriendly.create({
        data: { slug: lugar.slug, recomendaciones: 0, ...datos },
      });
      creados += 1;
    }
  }

  const total = await prisma.lugarPetFriendly.count({ where: { isActive: true } });
  console.log(`Lugares pet friendly: ${creados} creados, ${actualizados} actualizados, ${total} activos en total.`);
}

main()
  .catch((error) => {
    console.error('Error sembrando lugares pet friendly:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
