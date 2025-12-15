// Script para listar usuarios registrados en la base de datos
// Uso: node scripts/listar-usuarios.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listarUsuarios() {
  try {
    console.log('\n📋 Usuarios Registrados en SportPetMatch\n');
    console.log('=' .repeat(80));
    
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        fechaNacimiento: true,
        telefono: true,
        ubicacionCiudad: true,
        ubicacionPais: true,
        nivelDeporte: true,
        intereses: true,
        tipoUsuario: true,
        esPremium: true,
        isActive: true,
        emailVerificado: true,
        onboardingCompletado: true,
        createdAt: true,
        _count: {
          select: {
            mascotas: true,
            eventosCreados: true,
            matches: true,
            matchesRecibidos: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (usuarios.length === 0) {
      console.log('❌ No hay usuarios registrados en la base de datos.');
      console.log('💡 Ejecuta: npm run db:seed para crear usuarios de ejemplo\n');
      return;
    }

    console.log(`\n✅ Total de usuarios: ${usuarios.length}\n`);

    usuarios.forEach((usuario, index) => {
      console.log(`\n${index + 1}. ${usuario.nombre}`);
      console.log(`   📧 Email: ${usuario.email}`);
      console.log(`   🆔 ID: ${usuario.id}`);
      console.log(`   📍 Ubicación: ${usuario.ubicacionCiudad || 'No especificada'}, ${usuario.ubicacionPais || 'No especificada'}`);
      console.log(`   🏃 Nivel deportivo: ${usuario.nivelDeporte}/5`);
      console.log(`   🎯 Tipo: ${usuario.tipoUsuario || 'solo'}`);
      console.log(`   ⭐ Premium: ${usuario.esPremium ? 'Sí' : 'No'}`);
      console.log(`   🎨 Intereses: ${usuario.intereses.join(', ') || 'Ninguno'}`);
      console.log(`   📅 Fecha de registro: ${usuario.createdAt.toLocaleDateString('es-AR')}`);
      console.log(`   ✅ Estado:`);
      console.log(`      - Activo: ${usuario.isActive ? 'Sí' : 'No'}`);
      console.log(`      - Email verificado: ${usuario.emailVerificado ? 'Sí' : 'No'}`);
      console.log(`      - Onboarding completado: ${usuario.onboardingCompletado ? 'Sí' : 'No'}`);
      console.log(`   📊 Estadísticas:`);
      console.log(`      - Mascotas: ${usuario._count.mascotas}`);
      console.log(`      - Eventos creados: ${usuario._count.eventosCreados}`);
      console.log(`      - Matches enviados: ${usuario._count.matches}`);
      console.log(`      - Matches recibidos: ${usuario._count.matchesRecibidos}`);
      console.log(`      - Total matches: ${usuario._count.matches + usuario._count.matchesRecibidos}`);
      console.log('   ' + '-'.repeat(76));
    });

    // Resumen de matches
    console.log('\n\n📊 RESUMEN DE MATCHES\n');
    console.log('=' .repeat(80));
    
    const todosLosMatches = await prisma.match.findMany({
      include: {
        usuario: {
          select: { nombre: true, email: true },
        },
        usuarioMatch: {
          select: { nombre: true, email: true },
        },
        eventoPropuesto: {
          select: { titulo: true },
        },
      },
      orderBy: {
        fechaMatch: 'desc',
      },
    });

    if (todosLosMatches.length === 0) {
      console.log('❌ No hay matches en la base de datos.\n');
    } else {
      console.log(`\n✅ Total de matches: ${todosLosMatches.length}\n`);
      
      todosLosMatches.forEach((match, index) => {
        console.log(`\n${index + 1}. Match entre ${match.usuario.nombre} y ${match.usuarioMatch.nombre}`);
        console.log(`   🆔 ID: ${match.id}`);
        console.log(`   📧 ${match.usuario.nombre}: ${match.usuario.email}`);
        console.log(`   📧 ${match.usuarioMatch.nombre}: ${match.usuarioMatch.email}`);
        console.log(`   📊 Estado: ${match.estado}`);
        console.log(`   📅 Fecha: ${match.fechaMatch.toLocaleDateString('es-AR')}`);
        if (match.eventoPropuesto) {
          console.log(`   🎉 Evento propuesto: ${match.eventoPropuesto.titulo}`);
        }
        if (match.mensajeInicial) {
          console.log(`   💬 Mensaje inicial: "${match.mensajeInicial.substring(0, 50)}..."`);
        }
        console.log('   ' + '-'.repeat(76));
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Listado completado!\n');
    
  } catch (error) {
    console.error('❌ Error al listar usuarios:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

listarUsuarios();

