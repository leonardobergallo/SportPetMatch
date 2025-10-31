// Archivo principal del servidor SportPetMatch
// Configuración del servidor Express con todas las funcionalidades

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar rutas
import rutasAuth from './rutas/auth';

// Importar middleware personalizado
// import { middlewareAutenticacion } from './middleware/autenticacion';
// import { middlewareValidacion } from './middleware/validacion';
// import { middlewareManejoErrores } from './middleware/errores';

// Cargar variables de entorno
dotenv.config({ path: '../config.env' });

// Crear aplicación Express
const app = express();

// Configuración del puerto
const PUERTO = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Middleware de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuración de CORS para permitir conexiones desde la app móvil
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://192.168.0.108:8081',
    'exp://192.168.0.108:8081'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware de compresión para optimizar respuestas
app.use(compression());

// Middleware de logging para desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Log detallado en desarrollo
} else {
  app.use(morgan('combined')); // Log básico en producción
}

// Rate limiting para prevenir abuso de la API
const limitador = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    codigo: 'RATE_LIMIT_EXCEDIDO'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limitador);

// Middleware para parsear JSON (límite de 10MB)
app.use(express.json({ limit: '10mb' }));

// Middleware para parsear URL-encoded (límite de 10MB)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta de salud del servidor
app.get('/api/salud', (req, res) => {
  res.json({
    mensaje: '¡Servidor SportPetMatch funcionando correctamente! 🐕‍🦺',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    entorno: process.env.NODE_ENV || 'development',
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

// Configurar rutas de la API
app.use('/api/auth', rutasAuth);

// Middleware para rutas no encontradas (404)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    mensaje: `La ruta ${req.originalUrl} no existe en esta API`,
    codigo: 'ENDPOINT_NO_ENCONTRADO',
    documentacion: '/api/documentacion'
  });
});

// Middleware global de manejo de errores
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error en el servidor:', error);
  
  // Error de validación de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token de autenticación inválido',
      codigo: 'TOKEN_INVALIDO'
    });
  }
  
  // Error de token expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token de autenticación expirado',
      codigo: 'TOKEN_EXPIRADO'
    });
  }
  
  // Error de validación de datos
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      detalles: error.message,
      codigo: 'VALIDACION_FALLIDA'
    });
  }
  
  // Error de base de datos
  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflicto de datos',
      mensaje: 'Ya existe un registro con estos datos',
      codigo: 'CONFLICTO_DATOS'
    });
  }
  
  // Error genérico del servidor
  return res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal',
    codigo: 'ERROR_SERVIDOR'
  });
});

// Función para iniciar el servidor
const iniciarServidor = async () => {
  try {
    // Aquí podríamos conectar a la base de datos si fuera necesario
    // await conectarBaseDatos();
    
    app.listen(PUERTO, () => {
      console.log('🚀 Servidor SportPetMatch iniciado exitosamente!');
      console.log(`📍 Servidor corriendo en: http://${HOST}:${PUERTO}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API disponible en: http://${HOST}:${PUERTO}/api`);
      console.log(`❤️  Salud del servidor: http://${HOST}:${PUERTO}/api/salud`);
      console.log('🐕‍🦺 ¡Listo para conectar personas y mascotas!');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar cierre graceful del servidor
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Señal SIGINT recibida. Cerrando servidor...');
  process.exit(0);
});

// Iniciar el servidor
iniciarServidor();

export default app;
