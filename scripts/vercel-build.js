#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function run(command, cwd) {
  execSync(command, { cwd, stdio: 'inherit' });
}

try {
  console.log('Build completo para Vercel...');
  console.log('CWD:', process.cwd());

  console.log('Instalando backend...');
  run('npm install', path.join(rootDir, 'backend'));

  console.log('Compilando backend...');
  run('npm run build', path.join(rootDir, 'backend'));

  console.log('Instalando frontend...');
  run('npm install', path.join(rootDir, 'frontend'));

  console.log('Exportando frontend web...');
  run('npm run build', path.join(rootDir, 'frontend'));

  console.log('Copiando API a public...');
  run('node scripts/copiar-api.js', rootDir);

  console.log('Build completado.');
  console.log('Archivos en public/:');
  console.log(fs.readdirSync(path.join(rootDir, 'public')).slice(0, 5).join(', '));
} catch (error) {
  console.error('Error de build:', error.message);
  process.exit(1);
}
