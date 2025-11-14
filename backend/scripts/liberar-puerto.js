// Script para liberar el puerto 3000 en Windows
// Ejecuta: node scripts/liberar-puerto.js

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function liberarPuerto(puerto = 3000) {
  try {
    console.log(`🔍 Buscando procesos usando el puerto ${puerto}...`);
    
    // Buscar procesos usando el puerto
    const { stdout } = await execPromise(`netstat -ano | findstr :${puerto}`);
    
    if (!stdout || stdout.trim().length === 0) {
      console.log(`✅ El puerto ${puerto} está libre.`);
      return;
    }
    
    // Extraer PIDs
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const match = line.match(/\s+(\d+)$/);
      if (match) {
        pids.add(match[1]);
      }
    });
    
    if (pids.size === 0) {
      console.log(`✅ El puerto ${puerto} está libre.`);
      return;
    }
    
    console.log(`🔴 Encontrados ${pids.size} proceso(s) usando el puerto ${puerto}:`);
    pids.forEach(pid => console.log(`   - PID: ${pid}`));
    
    // Terminar procesos
    for (const pid of pids) {
      try {
        console.log(`🛑 Terminando proceso ${pid}...`);
        await execPromise(`taskkill /F /PID ${pid}`);
        console.log(`✅ Proceso ${pid} terminado.`);
      } catch (error) {
        console.log(`⚠️  No se pudo terminar el proceso ${pid}: ${error.message}`);
      }
    }
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar que el puerto esté libre
    try {
      const { stdout: checkOutput } = await execPromise(`netstat -ano | findstr :${puerto}`);
      if (!checkOutput || checkOutput.trim().length === 0) {
        console.log(`✅ El puerto ${puerto} está ahora libre.`);
      } else {
        console.log(`⚠️  El puerto ${puerto} todavía está en uso.`);
      }
    } catch (error) {
      console.log(`✅ El puerto ${puerto} está ahora libre.`);
    }
    
  } catch (error) {
    if (error.message.includes('findstr')) {
      console.log(`✅ El puerto ${puerto} está libre.`);
    } else {
      console.error(`❌ Error: ${error.message}`);
    }
  }
}

// Ejecutar
liberarPuerto(3000);


