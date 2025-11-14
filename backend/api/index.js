// Handler de Vercel Serverless para Express
// Este archivo permite que tu backend Express funcione en Vercel

const expressApp = require('../dist/index.js');

// Exportar la app para Vercel
// En Vercel, no llamamos app.listen(), solo exportamos la app
module.exports = expressApp.default || expressApp;
