// Servidor simple para probar SportPetMatch
// Servidor Express básico sin dependencias complejas

const express = require('express');
const cors = require('cors');

const app = express();
const PUERTO = process.env.PORT || 3000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Ruta de salud
app.get('/api/salud', (req, res) => {
  res.json({
    mensaje: '¡Servidor SportPetMatch funcionando correctamente! 🐕‍🦺',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    entorno: 'development',
    baseDatos: 'Conectada ✅'
  });
});

// Ruta raíz de la API
app.get('/api', (req, res) => {
  res.json({
    mensaje: 'API SportPetMatch - Conecta personas y mascotas en eventos deportivos',
    version: '1.0.0',
    documentacion: '/api/documentacion',
    salud: '/api/salud',
    endpoints: {
      autenticacion: '/api/auth',
      usuarios: '/api/usuarios',
      mascotas: '/api/mascotas',
      eventos: '/api/eventos',
      matches: '/api/matches',
      desafios: '/api/desafios',
      notificaciones: '/api/notificaciones'
    }
  });
});

// Ruta de prueba para eventos
app.get('/api/eventos', (req, res) => {
  res.json({
    eventos: [
      {
        id: '1',
        titulo: 'Caminata Matutina',
        descripcion: 'Caminata relajada por el parque central',
        tipo: 'Caminata',
        fechaInicio: '2024-01-15T08:00:00Z',
        ubicacion: 'Parque Central',
        maxParticipantes: 20,
        participantesActuales: 12,
        esPetFriendly: true
      },
      {
        id: '2',
        titulo: 'Carrera Canina',
        descripcion: 'Carrera competitiva para perros y sus dueños',
        tipo: 'Carrera',
        fechaInicio: '2024-01-20T10:00:00Z',
        ubicacion: 'Estadio Municipal',
        maxParticipantes: 50,
        participantesActuales: 35,
        esPetFriendly: true
      }
    ]
  });
});

// Ruta de prueba para matches
app.get('/api/matches', (req, res) => {
  res.json({
    matches: [
      {
        id: '1',
        usuario: {
          nombre: 'María González',
          avatar: 'M',
          ubicacion: 'Buenos Aires'
        },
        mascota: {
          nombre: 'Max',
          tipo: 'Golden Retriever',
          edad: 3
        },
        fechaMatch: '2024-01-10T14:30:00Z',
        estado: 'activo'
      },
      {
        id: '2',
        usuario: {
          nombre: 'Carlos Ruiz',
          avatar: 'C',
          ubicacion: 'Córdoba'
        },
        mascota: {
          nombre: 'Luna',
          tipo: 'Border Collie',
          edad: 2
        },
        fechaMatch: '2024-01-12T16:45:00Z',
        estado: 'activo'
      }
    ]
  });
});

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log('🚀 Servidor SportPetMatch iniciado exitosamente!');
  console.log(`📍 Servidor corriendo en: http://localhost:${PUERTO}`);
  console.log(`📊 API disponible en: http://localhost:${PUERTO}/api`);
  console.log(`❤️  Salud del servidor: http://localhost:${PUERTO}/api/salud`);
  console.log('🐕‍🦺 ¡Listo para conectar personas y mascotas!');
});
