// Script para iniciar el servidor en desarrollo
// Libera el puerto 3000 antes de iniciar
// Ejecuta: node start-dev.js

const { exec } = require('child_process');
const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 Verificando puerto 3000...');

// Ejecutar script de liberar puerto
exec('node scripts/liberar-puerto.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  console.log(stdout);
  
  // Esperar un momento antes de iniciar nodemon
  setTimeout(() => {
    console.log('🚀 Iniciando servidor...');
    
    // Iniciar nodemon
    const nodemon = spawn('npx', ['nodemon', 'src/index.ts'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true
    });
    
    nodemon.on('error', (error) => {
      console.error(`Error iniciando nodemon: ${error.message}`);
    });
    
    nodemon.on('exit', (code) => {
      console.log(`Nodemon terminado con código ${code}`);
    });
    
    // Manejar cierre graceful
    process.on('SIGINT', () => {
      console.log('\n🛑 Cerrando servidor...');
      nodemon.kill('SIGINT');
      process.exit(0);
    });
  }, 1000);
});


