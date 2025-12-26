// Handler de Vercel Serverless para Express
// Este archivo permite que tu backend Express funcione en Vercel
// Se copia automáticamente desde backend/api/index.js durante el build

// Importar la app Express compilada
let app;
try {
  const importedApp = require('./dist/index.js');
  // Obtener la app de Express (puede ser default export o named export)
  app = importedApp.default || importedApp;
  
  // Verificar que sea una instancia de Express
  if (!app || typeof app !== 'function') {
    throw new Error('La app exportada no es una instancia válida de Express');
  }
} catch (error) {
  console.error('❌ Error al cargar la app:', error);
  // En caso de error, crear una app básica de error
  const express = require('express');
  const errorApp = express();
  errorApp.use(express.json());
  errorApp.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Error al cargar la aplicación. Verifica que el build se haya completado correctamente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  app = errorApp;
}

// Exportar handler para Vercel
// Vercel espera una función que reciba (req, res)
// Necesitamos manejar las rutas correctamente cuando Vercel reescribe
module.exports = (req, res) => {
  // Log para debugging (siempre en Vercel)
  console.log(`📥 ${req.method} ${req.url || req.path} - Original: ${req.originalUrl || req.url}`);
  console.log(`📍 Query:`, req.query);
  console.log(`🔍 Headers:`, req.headers['content-type']);
  
  // En Vercel, cuando se reescribe /api/(.*) a /api/index.js,
  // la ruta puede llegar sin el prefijo /api
  // Necesitamos asegurarnos de que Express la maneje correctamente
  
  // Si la ruta no empieza con /api, agregarlo
  const originalUrl = req.url || req.path || '';
  if (!originalUrl.startsWith('/api')) {
    req.url = '/api' + originalUrl;
    req.originalUrl = req.originalUrl || req.url;
  }
  
  // Ejecutar la app de Express
  return app(req, res);
};
