#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Build completo para Vercel...');

const rootDir = path.join(__dirname, '..');

try {
  console.log('📦 Instalando backend...');
  execSync('npm install', { cwd: path.join(rootDir, 'backend'), stdio: 'inherit' });
  
  console.log('🔨 Compilando backend...');
  execSync('npm run build', { cwd: path.join(rootDir, 'backend'), stdio: 'inherit' });
  
  console.log('📦 Instalando frontend...');
  execSync('npm install', { cwd: path.join(rootDir, 'frontend'), stdio: 'inherit' });
  
  console.log('🔨 Exportando frontend web...');
  execSync('npm run build', { cwd: path.join(rootDir, 'frontend'), stdio: 'inherit' });
  
  console.log('📋 Copiando archivos...');
  execSync('node scripts/copiar-api.js', { cwd: rootDir, stdio: 'inherit' });
  
  console.log('✅ Build completado!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}