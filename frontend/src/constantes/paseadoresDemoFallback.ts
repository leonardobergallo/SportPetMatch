// Paseadores de ejemplo - Indio
// Se muestran en "Solicitar paseo" cuando la API todavía no tiene paseadores
// aprobados. Sirven para ver cómo funciona el flujo y los filtros por zona.

import type { PaseadorPaseo } from '../servicios/servicioPaseos';

export const PASEADORES_DEMO_FALLBACK: PaseadorPaseo[] = [
  {
    id: 'demo-carlos',
    usuarioId: 'demo-usuario-carlos',
    telefono: '+54 9 342 555-1001',
    ciudad: 'Santa Fe',
    zona: 'Centro, Candioti, Costanera',
    precioHora: 4500,
    disponibilidad: 'Lun, Mar, Mié, Jue, Vie, Sáb · Mañana (8-12 hs), Tarde (12-18 hs)',
    estado: 'aprobado',
    esDemo: true,
    usuario: {
      id: 'demo-usuario-carlos',
      nombre: 'Carlos (ejemplo)',
      ubicacionCiudad: 'Santa Fe',
    },
  },
  {
    id: 'demo-ana',
    usuarioId: 'demo-usuario-ana',
    telefono: '+54 9 342 555-1002',
    ciudad: 'Santa Fe',
    zona: 'Barranquitas, Guadalupe, Parque Sur',
    precioHora: 4000,
    disponibilidad: 'Mar, Mié, Jue, Vie, Sáb, Dom · Mañana (8-12 hs), Tarde (12-18 hs)',
    estado: 'aprobado',
    esDemo: true,
    usuario: {
      id: 'demo-usuario-ana',
      nombre: 'Ana (ejemplo)',
      ubicacionCiudad: 'Santa Fe',
    },
  },
  {
    id: 'demo-diego',
    usuarioId: 'demo-usuario-diego',
    telefono: '+54 9 342 555-1003',
    ciudad: 'Paraná',
    zona: 'Centro, Parque Urquiza, Villa Urquiza',
    precioHora: 5000,
    disponibilidad: 'Lun, Mié, Vie, Dom · Tarde (12-18 hs), Noche (18-22 hs)',
    estado: 'aprobado',
    esDemo: true,
    usuario: {
      id: 'demo-usuario-diego',
      nombre: 'Diego (ejemplo)',
      ubicacionCiudad: 'Paraná',
    },
  },
];
