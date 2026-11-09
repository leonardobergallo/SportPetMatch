// Migra las cuentas demo viejas de @sportpetmatch.com a @indio.com.ar.
// Por defecto solo muestra el plan. Para aplicar:
//   node --env-file=.env scripts/renombrar-correos-demo.mjs --apply
//
// IMPORTANTE: cambiar el email de una cuenta cambia el usuario con el que se
// inicia sesión. Avisá a las personas que usan esas cuentas antes de aplicarlo.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const aplicar = process.argv.includes('--apply');
const dominioViejo = '@sportpetmatch.com';
const dominioNuevo = '@indio.com.ar';

async function main() {
  const usuarios = await prisma.usuario.findMany({
    where: { email: { endsWith: dominioViejo } },
    select: { id: true, email: true, nombre: true },
    orderBy: { email: 'asc' },
  });

  if (!usuarios.length) {
    console.log(`No hay cuentas con ${dominioViejo}.`);
    return;
  }

  console.log(`${usuarios.length} cuentas para migrar:`);
  let aplicadas = 0;
  let conflictos = 0;

  for (const usuario of usuarios) {
    const nuevoEmail = usuario.email.replace(new RegExp(`${dominioViejo}$`), dominioNuevo);
    const existente = await prisma.usuario.findUnique({ where: { email: nuevoEmail }, select: { id: true } });

    if (existente) {
      console.log(`CONFLICTO  ${usuario.email} -> ${nuevoEmail} (ya existe)`);
      conflictos += 1;
      continue;
    }

    console.log(`${aplicar ? 'MIGRAR' : 'PLAN'}    ${usuario.email} -> ${nuevoEmail} (${usuario.nombre})`);

    if (aplicar) {
      await prisma.usuario.update({ where: { id: usuario.id }, data: { email: nuevoEmail } });
      aplicadas += 1;
    }
  }

  if (aplicar) {
    console.log(`\nMigradas: ${aplicadas}. Conflictos: ${conflictos}.`);
  } else {
    console.log('\nEsto fue un simulacro. Agregá --apply para aplicarlo.');
  }
}

main()
  .catch((error) => {
    console.error('Error migrando correos demo:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
