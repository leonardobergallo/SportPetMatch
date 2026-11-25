// Seed NO destructivo de paseadores demo para probar el flujo de paseos.
// No borra usuarios, mascotas ni paseos existentes.
//
// Uso: npm run db:seed-paseadores

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DURACION_MEMBRESIA_DIAS = 365;

type DatosPaseadorDemo = {
  email: string;
  nombre: string;
  telefono: string;
  ciudad: string;
  zona: string;
  precioHora: number;
  disponibilidad: string;
  experiencia: string;
};

const PASEADORES_DEMO: DatosPaseadorDemo[] = [
  {
    email: 'carlos@sportpetmatch.com',
    nombre: 'Carlos Rodríguez',
    telefono: '+54 9 342 555-1001',
    ciudad: 'Santa Fe',
    zona: 'Centro, Candioti, Costanera',
    precioHora: 4500,
    disponibilidad: 'Lun, Mar, Mié, Jue, Vie, Sáb · Mañana (8-12 hs), Tarde (12-18 hs)',
    experiencia:
      'Paseos de 30 a 90 minutos por la costanera y parques de Santa Fe. Trabajo con perros sociables y también con perros que necesitan paseos tranquilos.',
  },
  {
    email: 'ana@sportpetmatch.com',
    nombre: 'Ana Silva',
    telefono: '+54 9 342 555-1002',
    ciudad: 'Santa Fe',
    zona: 'Barranquitas, Guadalupe, Parque Sur',
    precioHora: 4000,
    disponibilidad: 'Mar, Mié, Jue, Vie, Sáb, Dom · Mañana (8-12 hs), Tarde (12-18 hs)',
    experiencia:
      'Paseos recreativos y entrenamiento básico. Experiencia con razas chicas, medianas y perros rescatados.',
  },
  {
    email: 'diego@sportpetmatch.com',
    nombre: 'Diego Fernández',
    telefono: '+54 9 343 555-1003',
    ciudad: 'Paraná',
    zona: 'Centro, Parque Urquiza, Villa Urquiza',
    precioHora: 5000,
    disponibilidad: 'Lun, Mié, Vie, Dom · Tarde (12-18 hs), Noche (18-22 hs)',
    experiencia:
      'Paseos por la costanera y el Parque Urquiza. Trabajo con perros de tamaño grande y paseos de alta energía.',
  },
];

async function asegurarUsuario(datos: DatosPaseadorDemo) {
  const existente = await prisma.usuario.findUnique({ where: { email: datos.email } });
  if (existente) {
    return existente;
  }

  const password = await bcrypt.hash('123456', 10);
  return prisma.usuario.create({
    data: {
      email: datos.email,
      password,
      nombre: datos.nombre,
      fechaNacimiento: new Date(1992, 3, 15),
      telefono: datos.telefono,
      ubicacionLat: -31.6333,
      ubicacionLng: -60.7,
      ubicacionCiudad: datos.ciudad,
      ubicacionPais: 'Argentina',
      intereses: ['paseos', 'mascotas', 'eventos'],
      tipoUsuario: 'dueno',
      onboardingCompletado: true,
      emailVerificado: true,
      isActive: true,
    },
  });
}

async function asegurarMembresia(usuarioId: string) {
  const ahora = new Date();
  const vigente = await prisma.suscripcion.findFirst({
    where: {
      usuarioId,
      tipo: { in: ['indio_prueba', 'indio_mensual'] },
      estado: 'activa',
      fechaInicio: { lte: ahora },
      fechaFin: { gt: ahora },
    },
    select: { id: true },
  });

  if (vigente) return;

  await prisma.suscripcion.create({
    data: {
      usuarioId,
      tipo: 'indio_mensual',
      estado: 'activa',
      fechaInicio: ahora,
      fechaFin: new Date(ahora.getTime() + DURACION_MEMBRESIA_DIAS * 24 * 60 * 60 * 1000),
      precio: 15900,
      moneda: 'ARS',
    },
  });
}

async function main() {
  console.log('🌱 Creando paseadores demo (sin borrar datos)...');

  for (const datos of PASEADORES_DEMO) {
    const usuario = await asegurarUsuario(datos);
    await asegurarMembresia(usuario.id);

    const paseador = await prisma.paseador.upsert({
      where: { usuarioId: usuario.id },
      create: {
        usuarioId: usuario.id,
        telefono: datos.telefono,
        ciudad: datos.ciudad,
        zona: datos.zona,
        experiencia: datos.experiencia,
        precioHora: datos.precioHora,
        disponibilidad: datos.disponibilidad,
        estado: 'aprobado',
      },
      update: {
        telefono: datos.telefono,
        ciudad: datos.ciudad,
        zona: datos.zona,
        experiencia: datos.experiencia,
        precioHora: datos.precioHora,
        disponibilidad: datos.disponibilidad,
        estado: 'aprobado',
        motivoRechazo: null,
      },
      select: { id: true, estado: true },
    });

    console.log(`✅ ${usuario.nombre} (${usuario.email}) → paseador ${paseador.estado}`);
  }

  console.log('🎉 Listo. Ya podés solicitar un paseo desde la app.');
}

main()
  .catch((error) => {
    console.error('❌ Error creando paseadores demo:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
