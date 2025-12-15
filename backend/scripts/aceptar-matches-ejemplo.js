// Script para aceptar matches pendientes y habilitar chat
// Uso: node scripts/aceptar-matches-ejemplo.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function aceptarMatchesEjemplo() {
  try {
    console.log('\n🎯 Aceptando Matches para Habilitar Chat\n');
    console.log('='.repeat(80));
    
    // Buscar matches pendientes
    const matchesPendientes = await prisma.match.findMany({
      where: {
        estado: 'pendiente',
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        usuarioMatch: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        fechaMatch: 'desc',
      },
      take: 5, // Tomar los 5 más recientes
    });

    if (matchesPendientes.length === 0) {
      console.log('❌ No hay matches pendientes para aceptar.\n');
      return;
    }

    console.log(`\n✅ Encontrados ${matchesPendientes.length} matches pendientes\n`);

    // Aceptar los primeros 2 matches
    const matchesAAceptar = matchesPendientes.slice(0, 2);
    
    for (const match of matchesAAceptar) {
      console.log(`\n📝 Aceptando match entre ${match.usuario.nombre} y ${match.usuarioMatch.nombre}...`);
      
      const matchActualizado = await prisma.match.update({
        where: { id: match.id },
        data: {
          estado: 'aceptado',
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          usuarioMatch: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });

      console.log(`   ✅ Match aceptado! ID: ${matchActualizado.id}`);
      console.log(`   👤 ${matchActualizado.usuario.nombre} (${matchActualizado.usuario.email})`);
      console.log(`   👤 ${matchActualizado.usuarioMatch.nombre} (${matchActualizado.usuarioMatch.email})`);
      console.log(`   💬 Ahora pueden chatear!`);
    }

    // Mostrar eventos de los usuarios involucrados
    console.log('\n\n📅 EVENTOS DE LOS USUARIOS\n');
    console.log('='.repeat(80));

    const usuariosIds = new Set();
    matchesAAceptar.forEach(match => {
      usuariosIds.add(match.usuario.id);
      usuariosIds.add(match.usuarioMatch.id);
    });

    for (const usuarioId of usuariosIds) {
      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: {
          id: true,
          nombre: true,
          email: true,
          eventosCreados: {
            select: {
              id: true,
              titulo: true,
              descripcion: true,
              tipo: true,
              fechaInicio: true,
              fechaFin: true,
              esPetFriendly: true,
              esPremium: true,
              maxParticipantes: true,
              precio: true,
            },
            orderBy: {
              fechaInicio: 'asc',
            },
          },
        },
      });

      if (usuario) {
        console.log(`\n👤 ${usuario.nombre} (${usuario.email})`);
        console.log(`   📧 Email: ${usuario.email}`);
        
        if (usuario.eventosCreados.length === 0) {
          console.log(`   📅 No tiene eventos creados`);
        } else {
          console.log(`   📅 Eventos creados: ${usuario.eventosCreados.length}`);
          usuario.eventosCreados.forEach((evento, index) => {
            console.log(`\n   ${index + 1}. ${evento.titulo}`);
            console.log(`      🆔 ID: ${evento.id}`);
            console.log(`      📝 Tipo: ${evento.tipo}`);
            console.log(`      📅 Fecha inicio: ${new Date(evento.fechaInicio).toLocaleDateString('es-AR')}`);
            if (evento.fechaFin) {
              console.log(`      📅 Fecha fin: ${new Date(evento.fechaFin).toLocaleDateString('es-AR')}`);
            }
            console.log(`      🐾 Pet-friendly: ${evento.esPetFriendly ? 'Sí' : 'No'}`);
            console.log(`      ⭐ Premium: ${evento.esPremium ? 'Sí' : 'No'}`);
            if (evento.maxParticipantes) {
              console.log(`      👥 Máx participantes: ${evento.maxParticipantes}`);
            }
            if (evento.precio) {
              console.log(`      💰 Precio: $${evento.precio}`);
            }
            if (evento.descripcion) {
              const descCorta = evento.descripcion.length > 50 
                ? evento.descripcion.substring(0, 50) + '...' 
                : evento.descripcion;
              console.log(`      📄 Descripción: ${descCorta}`);
            }
          });
        }
        console.log('   ' + '-'.repeat(76));
      }
    }

    // Resumen final
    console.log('\n\n✅ RESUMEN\n');
    console.log('='.repeat(80));
    console.log(`\n✅ Matches aceptados: ${matchesAAceptar.length}`);
    console.log(`✅ Usuarios que ahora pueden chatear:`);
    matchesAAceptar.forEach((match, index) => {
      console.log(`   ${index + 1}. ${match.usuario.nombre} ↔ ${match.usuarioMatch.nombre}`);
    });
    console.log('\n💡 Para probar el chat:');
    console.log('   1. Inicia sesión con uno de los usuarios');
    console.log('   2. Ve a la pantalla "Matches" o "Chats"');
    console.log('   3. Deberías ver el match aceptado');
    console.log('   4. Toca el match para abrir el chat');
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Proceso completado!\n');
    
  } catch (error) {
    console.error('❌ Error aceptando matches:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

aceptarMatchesEjemplo();

