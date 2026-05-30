#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

function run(command, cwd) {
  execSync(command, { cwd, stdio: 'inherit' });
}

function copyDir(source, target) {
  fs.mkdirSync(target, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

try {
  console.log('Build VPS SportPetMatch...');

  console.log('Instalando backend...');
  run('npm install', path.join(rootDir, 'backend'));

  console.log('Compilando backend...');
  run('npm run build', path.join(rootDir, 'backend'));

  console.log('Instalando frontend...');
  run('npm install', path.join(rootDir, 'frontend'));

  console.log('Exportando frontend web...');
  run('npm run build', path.join(rootDir, 'frontend'));

  const sourceFrontendDist = path.join(rootDir, 'frontend', 'dist');
  const publicDir = path.join(rootDir, 'public');

  if (!fs.existsSync(sourceFrontendDist)) {
    throw new Error('frontend/dist no existe despues del build');
  }

  fs.rmSync(publicDir, { recursive: true, force: true });
  copyDir(sourceFrontendDist, publicDir);

  console.log('Build VPS completado.');
  console.log(`Frontend listo en ${publicDir}`);
} catch (error) {
  console.error('Error de build VPS:', error.message);
  process.exit(1);
}
