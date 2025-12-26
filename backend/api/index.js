// Handler de Vercel Serverless para Express
// Este archivo permite que tu backend Express funcione en Vercel

// Importar la app Express compilada
let expressApp;
try {
  expressApp = require('../dist/index.js');
} catch (error) {
  console.error('Error al cargar la app:', error);
  // En caso de error, crear una app básica de error
  const express = require('express');
  const errorApp = express();
  errorApp.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      message: 'Error al cargar la aplicación. Verifica que el build se haya completado correctamente.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  });
  expressApp = errorApp;
}

// Exportar la app para Vercel
// En Vercel, no llamamos app.listen(), solo exportamos la app
// Vercel manejará el servidor automáticamente
module.exports = expressApp.default || expressApp;
