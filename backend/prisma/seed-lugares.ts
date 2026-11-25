// Seed NO destructivo de lugares pet friendly para Indio.
// Carga lugares de referencia de Santa Fe sin borrar datos existentes.
//
// Uso: npm run db:seed-lugares

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LUGARES = [
  {
    slug: 'parque-federal',
    nombre: 'Parque Federal',
    descripcion:
      'El clásico de Santa Fe para pasear con tu mascota: mucho verde, sombra y espacio para correr.',
    categoria: 'parque',
    direccion: 'Av. Alem y San Jerónimo',
    latitud: -31.6229,
    longitud: -60.7106,
    zonaPetFriendly: 'ambos',
    aguaParaMascotas: true,
    verificado: true,
    destacado: true,
    recomendaciones: 48,
  },
  {
    slug: 'parque-sur-general-belgrano',
    nombre: 'Parque Sur General Belgrano',
    descripcion:
      'Amplio parque en la zona sur, ideal para caminatas largas y encuentros con otros perros.',
    categoria: 'parque',
    direccion: 'Av. del Puerto y Av. Arijón',
    latitud: -31.6481,
    longitud: -60.7084,
    zonaPetFriendly: 'exterior',
    aguaParaMascotas: false,
    verificado: true,
    destacado: false,
    recomendaciones: 26,
  },
  {
    slug: 'paseo-costanera-oeste',
    nombre: 'Paseo Costanera Oeste',
    descripcion:
      'Recorrido junto al río con vistas abiertas. Perfecto para el paseo de la tarde.',
    categoria: 'paseo',
    direccion: 'Av. Alte. Brown, Costanera Oeste',
    latitud: -31.628,
    longitud: -60.704,
    zonaPetFriendly: 'exterior',
    aguaParaMascotas: true,
    verificado: true,
    destacado: true,
    recomendaciones: 41,
  },
  {
    slug: 'plaza-25-de-mayo',
    nombre: 'Plaza 25 de Mayo',
    descripcion:
      'Plaza céntrica con calles arboladas. Mejor ir con correa por la cantidad de gente.',
    categoria: 'plaza',
    direccion: 'Centro, entre San Martín y 25 de Mayo',
    latitud: -31.6572,
    longitud: -60.7056,
    zonaPetFriendly: 'exterior',
    aguaParaMascotas: false,
    verificado: true,
    destacado: false,
    recomendaciones: 18,
  },
  {
    slug: 'mirador-laguna-setubal',
    nombre: 'Mirador Laguna Setúbal',
    descripcion:
      'Paseo costero con sombra y vista a la laguna. Buen lugar para caminar temprano.',
    categoria: 'paseo',
    direccion: 'Costanera Este',
    latitud: -31.6325,
    longitud: -60.679,
    zonaPetFriendly: 'exterior',
    aguaParaMascotas: false,
    verificado: true,
    destacado: false,
    recomendaciones: 22,
  },
  {
    slug: 'parque-de-la-constitucion',
    nombre: 'Parque de la Constitución',
    descripcion:
      'Espacio verde amplio al norte de la ciudad, con senderos y mucho lugar para explorar.',
    categoria: 'parque',
    direccion: 'Av. Blas Parera',
    latitud: -31.6055,
    longitud: -60.7005,
    zonaPetFriendly: 'ambos',
    aguaParaMascotas: false,
    verificado: false,
    destacado: false,
    recomendaciones: 12,
  },
  {
    slug: 'cafe-candioti-pet-friendly',
    nombre: 'Café Candioti',
    descripcion:
      'Café de barrio con mesas afuera donde tu perro es bienvenido. Piden mantener la correa.',
    categoria: 'cafeteria',
    direccion: 'Bv. Gálvez 1600',
    latitud: -31.635,
    longitud: -60.703,
    zonaPetFriendly: 'exterior',
    aguaParaMascotas: true,
    verificado: false,
    destacado: false,
    recomendaciones: 15,
  },
  {
    slug: 'mercado-progreso',
    nombre: 'Mercado Progreso',
    descripcion:
      'Espacio cultural y gastronómico con patio. Consultá antes de entrar con tu mascota.',
    categoria: 'bar',
    direccion: 'Balcarce 1635',
    latitud: -31.6385,
    longitud: -60.7045,
    zonaPetFriendly: 'exterior',
    aguaParaMascotas: false,
    verificado: false,
    destacado: false,
    recomendaciones: 9,
  },
  {
    slug: 'restobar-la-costanera',
    nombre: 'Restobar La Costanera',
    descripcion:
      'Comida y tragos con mesas al aire libre frente al río. Avisá que vas con mascota al reservar.',
    categoria: 'restaurante',
    direccion: 'Av. Alte. Brown 2700',
    latitud: -31.6255,
    longitud: -60.6985,
    zonaPetFriendly: 'ambos',
    aguaParaMascotas: true,
    verificado: false,
    destacado: false,
    recomendaciones: 11,
  },
  {
    slug: 'veterinaria-huellitas',
    nombre: 'Veterinaria Huellitas',
    descripcion:
      'Atención clínica y guardia. Reciben mascotas con turno y también sin turno.',
    categoria: 'veterinaria',
    direccion: 'Av. Freyre 2300',
    latitud: -31.641,
    longitud: -60.715,
    zonaPetFriendly: 'interior',
    aguaParaMascotas: false,
    verificado: false,
    destacado: false,
    recomendaciones: 7,
  },
  {
    slug: 'pet-shop-mundo-animal',
    nombre: 'Pet Shop Mundo Animal',
    descripcion:
      'Alimento, accesorios y juguetes. Tu mascota puede entrar con correa.',
    categoria: 'pet_shop',
    direccion: 'San Martín 2500',
    latitud: -31.649,
    longitud: -60.706,
    zonaPetFriendly: 'interior',
    aguaParaMascotas: false,
    verificado: false,
    destacado: false,
    recomendaciones: 6,
  },
  {
    slug: 'hotel-los-silos',
    nombre: 'Hotel Los Silos',
    descripcion:
      'Alojamiento céntrico que acepta mascotas pequeñas. Confirmá disponibilidad al reservar.',
    categoria: 'alojamiento',
    direccion: 'Av. Alte. Brown 2500',
    latitud: -31.627,
    longitud: -60.696,
    zonaPetFriendly: 'ambos',
    aguaParaMascotas: false,
    verificado: false,
    destacado: false,
    recomendaciones: 5,
  },
];

async function main() {
  console.log('🌱 Cargando lugares pet friendly (sin borrar datos)...');

  for (const lugar of LUGARES) {
    const datos = {
      nombre: lugar.nombre,
      descripcion: lugar.descripcion,
      categoria: lugar.categoria,
      direccion: lugar.direccion,
      ciudad: 'Santa Fe',
      provincia: 'Santa Fe',
      pais: 'Argentina',
      latitud: lugar.latitud,
      longitud: lugar.longitud,
      fotos: [] as string[],
      permitePerros: true,
      zonaPetFriendly: lugar.zonaPetFriendly,
      requiereCorrea: true,
      aguaParaMascotas: lugar.aguaParaMascotas,
      verificado: lugar.verificado,
      destacado: lugar.destacado,
      fuente: lugar.verificado ? 'manual' : 'comunidad',
      recomendaciones: lugar.recomendaciones,
      isActive: true,
    };

    await prisma.lugarPetFriendly.upsert({
      where: { slug: lugar.slug },
      create: { slug: lugar.slug, ...datos },
      update: datos,
    });

    console.log(`✅ ${lugar.nombre}`);
  }

  console.log(`🎉 Listo. ${LUGARES.length} lugares pet friendly cargados.`);
}

main()
  .catch((error) => {
    console.error('❌ Error cargando lugares pet friendly:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
