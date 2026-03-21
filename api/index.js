// Handler de Vercel Serverless para Express
// Este archivo permite que tu backend Express funcione en Vercel

// Importar la app Express compilada
let app;
try {
  // Intentar cargar desde api/dist (ruta relativa desde api/index.js)
  const importedApp = require('./dist/index.js');
  // Obtener la app de Express (puede ser default export o named export)
  app = importedApp.default || importedApp;
  
  // Verificar que sea una instancia de Express
  if (!app || typeof app !== 'function') {
    throw new Error('La app exportada no es una instancia válida de Express');
  }
  
  console.log('✅ App Express cargada correctamente');
} catch (error) {
  console.error('❌ Error al cargar la app:', error);
  console.error('❌ Stack:', error.stack);
  
  // En caso de error, crear una app básica de error
  const express = require('express');
  const errorApp = express();
  errorApp.use(express.json());
  errorApp.all('*', (req, res) => {
    console.error('❌ Petición recibida pero app no cargada:', req.method, req.url);
    res.status(500).json({
      success: false,
      message: 'Error al cargar la aplicación. Verifica que el build se haya completado correctamente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl
    });
  });
  app = errorApp;
}

// Exportar handler para Vercel
// Vercel espera una función que reciba (req, res). No cerrar hasta que Express envíe la respuesta.
module.exports = (req, res) => {
  const rawPath = req.url || req.path || req.originalUrl || '';
  const path = rawPath.startsWith('/api') ? rawPath : '/api' + (rawPath.startsWith('/') ? rawPath : '/' + rawPath);
  req.url = path;
  req.originalUrl = req.originalUrl || path;

  // No devolver hasta que la respuesta esté enviada (evita 405/connection closed)
  return new Promise((resolve) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    app(req, res);
  });
};
