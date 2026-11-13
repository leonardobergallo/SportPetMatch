#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const publicDir = path.join(rootDir, 'public');
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';
const express = require(path.join(backendDir, 'node_modules', 'express'));

// Migración idempotente para la tabla de paseadores. Si falla, la app sigue
// arrancando y el error queda en el log para revisarlo.
function aplicarMigraciones() {
  const prismaCli = path.join(backendDir, 'node_modules', 'prisma', 'build', 'index.js');
  const schema = path.join(backendDir, 'prisma', 'schema.prisma');
  const migraciones = ['paseadores-indio.sql', 'paseos-gps.sql', 'reportes-indio.sql'];
  if (!fs.existsSync(prismaCli) || !fs.existsSync(schema)) return;

  for (const archivo of migraciones) {
    const sql = path.join(backendDir, 'prisma', 'sql', archivo);
    if (!fs.existsSync(sql)) continue;
    try {
      console.log(`Aplicando migración ${archivo}...`);
      execFileSync(process.execPath, [prismaCli, 'db', 'execute', '--schema', schema, '--file', sql], {
        cwd: backendDir,
        stdio: 'inherit',
        env: process.env,
      });
    } catch (error) {
      console.error(`No se pudo aplicar la migración ${archivo}:`, error.message);
    }
  }
}

aplicarMigraciones();

let apiApp;

try {
  const importedApi = require(path.join(backendDir, 'dist', 'src', 'index.js'));
  apiApp = importedApi.default || importedApi;

  if (!apiApp || typeof apiApp !== 'function') {
    throw new Error('backend/dist/src/index.js no exporta una app Express valida');
  }
} catch (error) {
  console.error('No se pudo cargar la API compilada:', error.message);
  process.exit(1);
}

if (!fs.existsSync(publicDir)) {
  console.error(`No existe ${publicDir}. Ejecuta npm run vps-build antes de iniciar.`);
  process.exit(1);
}

const app = express();

app.use((req, res, next) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    apiApp(req, res, next);
    return;
  }

  next();
});

app.use(express.static(publicDir, {
  extensions: ['html'],
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  setHeaders: (res, filePath) => {
    // El HTML cambia con cada deploy: evitar que quede cacheado una hora.
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  res.sendFile(indexPath);
});

app.listen(port, host, () => {
  console.log(`SportPetMatch VPS escuchando en http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
  try {
    const { iniciarSchedulerReportes } = require(
      path.join(backendDir, 'dist', 'src', 'servicios', 'reporteScheduler.js')
    );
    iniciarSchedulerReportes();
  } catch (error) {
    console.error('No se pudo iniciar el scheduler de reportes:', error.message);
  }
});
