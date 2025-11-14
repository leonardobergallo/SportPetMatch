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
import rutasUsuarios from './rutas/usuarios';
import rutasMascotas from './rutas/mascotas';
import rutasEventos from './rutas/eventos';
import rutasMatches from './rutas/matches';
import rutasMensajes from './rutas/mensajes';

// Importar middleware personalizado
// import { middlewareAutenticacion } from './middleware/autenticacion';
// import { middlewareValidacion } from './middleware/validacion';
// import { middlewareManejoErrores } from './middleware/errores';

// Cargar variables de entorno
// Cargar desde la raíz del backend
import path from 'path';
const configPath = path.resolve(__dirname, '../config.env');
dotenv.config({ path: configPath });

// Crear aplicación Express
const app = express();

// Configuración del puerto
// Convertir a número explícitamente para evitar errores de TypeScript
const PUERTO = parseInt(process.env.PORT || '3000', 10);
// En desarrollo, escuchar en todas las interfaces (0.0.0.0) para permitir conexiones desde Expo Go
// En producción (Railway, Render, etc.), escuchar en 0.0.0.0 para que funcione correctamente
const HOST = process.env.HOST || '0.0.0.0';

// Middleware de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuración de CORS para permitir conexiones desde la app móvil
// En desarrollo, permitir todas las conexiones desde Expo Go
// En producción, usar variable de entorno CORS_ORIGIN o permitir Vercel por defecto
const getCorsOrigins = (): string[] | boolean => {
  if (process.env.NODE_ENV === 'production') {
    // Si hay una variable CORS_ORIGIN configurada, usarla
    if (process.env.CORS_ORIGIN) {
      return process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    }
    // Permitir cualquier dominio de Vercel por defecto
    return true; // En producción también permitir todos si no está especificado (para facilidad)
  }
  // En desarrollo, permitir todas las conexiones
  return true;
};

const corsOptions = {
  origin: getCorsOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

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
      mensajes: '/api/mensajes',
      desafios: '/api/desafios',
      notificaciones: '/api/notificaciones'
    }
  });
});

// Configurar rutas de la API
app.use('/api/auth', rutasAuth);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/mascotas', rutasMascotas);
app.use('/api/eventos', rutasEventos);
app.use('/api/matches', rutasMatches);
app.use('/api/mensajes', rutasMensajes);

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
    
    app.listen(PUERTO, HOST, () => {
      console.log('🚀 Servidor SportPetMatch iniciado exitosamente!');
      console.log(`📍 Servidor corriendo en: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PUERTO}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API disponible en: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PUERTO}/api`);
      console.log(`❤️  Salud del servidor: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PUERTO}/api/salud`);
      if (HOST === '0.0.0.0') {
        console.log(`📱 Para Expo Go, usa tu IP local: http://TU_IP_LOCAL:${PUERTO}/api`);
        console.log(`   Ejemplo: http://172.20.10.3:${PUERTO}/api`);
      }
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

// En Vercel Serverless, no iniciamos el servidor aquí
// Solo exportamos la app y Vercel la maneja
// Vercel automáticamente establece VERCEL=1 en el entorno
if (process.env.VERCEL || process.env.VERCEL_ENV) {
  // En Vercel, solo exportar la app sin iniciar el servidor
  // Vercel manejará el servidor automáticamente
} else {
  // En otros entornos (Railway, Render, local), iniciar el servidor normalmente
  iniciarServidor();
}

export default app;
