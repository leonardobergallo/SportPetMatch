#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Build completo para Vercel...');
console.log('CWD:', process.cwd());

const rootDir = path.join(__dirname, '..');

try {
  console.log('📦 Instalando backend...');
  execSync('npm install', { cwd: path.join(rootDir, 'backend'), stdio: 'inherit' });
  
  console.log('🔨 Compilando backend (TypeScript)...');
  try {
    execSync('npm run build', { cwd: path.join(rootDir, 'backend'), stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️ Backend build tuvo errores, continuando...');
  }
  
  console.log('📦 Instalando frontend...');
  execSync('npm install', { cwd: path.join(rootDir, 'frontend'), stdio: 'inherit' });
  
  console.log('🔨 Exportando frontend web (Expo)...');
  execSync('npm run build', { cwd: path.join(rootDir, 'frontend'), stdio: 'inherit' });
  
  console.log('📋 Copiando archivos a public/...');
  execSync('node scripts/copiar-api.js', { cwd: rootDir, stdio: 'inherit' });
  
  console.log('✅ Build completado!');
  console.log('Archivos en public/:');
  console.log(fs.readdirSync(path.join(rootDir, 'public')).slice(0,5).join(', '));
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}