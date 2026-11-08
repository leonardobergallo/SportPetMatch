// Semilla de lugares pet friendly para Indio
// Uso: node --env-file=.env scripts/sembrar-lugares.mjs
// Inserta los lugares faltantes sin sobrescribir los existentes.

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
];

async function main() {
  const { count } = await prisma.lugarPetFriendly.createMany({
    skipDuplicates: true,
    data: lugares.map((lugar) => ({
      slug: lugar.slug,
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
    })),
  });

  const total = await prisma.lugarPetFriendly.count({ where: { isActive: true } });
  console.log(`Lugares pet friendly: ${count} creados, ${total} activos en total.`);
}

main()
  .catch((error) => {
    console.error('Error sembrando lugares pet friendly:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
