import express from 'express';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const app = express();
const puerto = Number(process.env.INDIO_DEMO_PORT ?? 8784);
const gpsReal = process.env.INDIO_DEMO_GPS_REAL === '1';
const limiteSeguimiento = (gpsReal ? 30 : 240) * 60_000;
const sesiones = new Map();
const reservas = new Map();
const dia = 86_400_000;
const altaDemo = new Date().toISOString();
const mensualidades = new Map();
const tarifaDemo = 15900;
const altaDuenoDemo = new Date(Date.now() - 62 * dia).toISOString();
const ciudades = {
  'santa-fe': { nombre: 'Santa Fe', lat: -31.62, lon: -60.69, cuenta: 'paseador', nombreDemo: 'Lucía Demo' },
  parana: { nombre: 'Paraná', lat: -31.73, lon: -60.53, cuenta: 'paseador-parana', nombreDemo: 'Mateo Demo' },
  rosario: { nombre: 'Rosario', lat: -32.96, lon: -60.66, cuenta: 'paseador-rosario', nombreDemo: 'Valentina Demo' },
};
const usuarios = [
  { id: 'dueno', nombre: 'Sofía Demo', email: 'sofia@example.invalid', rol: 'dueno', activo: true, alta: altaDuenoDemo },
  ...Object.values(ciudades).map(c => ({ id: c.cuenta, nombre: c.nombreDemo,
    email: c.cuenta + '@example.invalid', rol: 'paseador', activo: true, alta: altaDemo })),
];
const mascotas = [
  { nombre: 'Mora', dueno: 'dueno', especie: 'Perro', estado: 'Completo' },
  { nombre: 'Simón', dueno: 'dueno', especie: 'Perro', estado: 'Completo' },
];
const eventos = Object.entries(ciudades).map(([id, c]) => ({
  id: 'paseo-demo-' + id, nombre: 'Paseo comunitario de ejemplo · ' + c.nombre, organizador: 'Sofía Demo',
  fecha: new Date(Date.now() + dia).toISOString(), zona: c.nombre, participantes: 0, publicado: true,
}));
const auditoria = [];
const perfiles = new Map(Object.entries(ciudades).map(([ciudad, c]) => [c.cuenta, {
  ciudad, nombre: c.nombreDemo, zona: c.nombre, descripcion: 'Paseos individuales',
  precio: 6000, duracion: 30, disponibilidad: 'Lunes a viernes',
  experiencia: 'Dos años', referencias: 'Disponibles a pedido', foto: '',
  verificacion: 'pendiente',
}]));

function distancia(a, b) {
  const rad = Math.PI / 180;
  const h = Math.sin((b.lat - a.lat) * rad / 2) ** 2
    + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin((b.lon - a.lon) * rad / 2) ** 2;
  return 12_742 * Math.asin(Math.sqrt(Math.min(1, h)));
}

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (![`127.0.0.1:${puerto}`, `localhost:${puerto}`].includes(req.get('host'))) return res.sendStatus(403);
  const origen = req.get('origin');
  if (origen && origen !== `http://${req.get('host')}`) return res.sendStatus(403);
  next();
});
app.use(express.json({ limit: '8kb' }));
app.get('/', (_, res) => res.sendFile(fileURLToPath(new URL('./index.html', import.meta.url))));
app.get('/demo-assets/:recurso', (req, res) => {
  const recursos = new Map([
    ['marca', '../../../frontend/web/icon-192x192.png'],
    ['mora', '../../../frontend/assets/golden-retriever-playing.png'],
    ['simon', '../../../frontend/assets/labrador-playing-tennis.jpg'],
  ]);
  const recurso = recursos.get(req.params.recurso);
  if (!recurso) return res.sendStatus(404);
  res.sendFile(fileURLToPath(new URL(recurso, import.meta.url)));
});
app.post('/api/sesion', (req, res) => {
  const rol = req.body?.rol;
  const ciudad = req.body?.ciudad ?? 'santa-fe';
  if (!['dueno', 'paseador', 'visitante', 'admin'].includes(rol)) return res.sendStatus(400);
  if (!Object.hasOwn(ciudades, ciudad)) return res.sendStatus(400);
  const actor = rol === 'paseador' ? ciudades[ciudad].cuenta : rol;
  if (usuarios.some(u => u.id === actor && !u.activo)) return res.status(403).json({ mensaje: 'La cuenta ficticia está suspendida.' });
  const token = randomUUID();
  sesiones.set(token, { rol, actor, ciudad, vence: Date.now() + dia });
  res.json({ token, gpsReal, ciudades: Object.fromEntries(Object.entries(ciudades).map(([id, { nombre, lat, lon }]) =>
    [id, { nombre, lat, lon }])) });
});
app.use('/api', (req, res, next) => {
  const sesion = sesiones.get(req.get('authorization')?.slice(7));
  if (!sesion || sesion.vence <= Date.now()) return res.sendStatus(401);
  if (usuarios.some(u => u.id === sesion.actor && !u.activo)) return res.sendStatus(403);
  req.rol = sesion.rol;
  req.actor = sesion.actor;
  req.ciudad = sesion.ciudad;
  next();
});

app.get('/api/paseadores', (req, res) => {
  const filtro = nombre => typeof req.query[nombre] === 'string' ? req.query[nombre].toLowerCase().trim() : '';
  const precio = Number(filtro('precio')) || Infinity;
  res.json([...perfiles.entries()].filter(([id, p]) =>
    p.ciudad === req.ciudad && usuarios.some(u => u.id === id && u.activo) &&
    p.zona.toLowerCase().includes(filtro('zona')) &&
    p.disponibilidad.toLowerCase().includes(filtro('disponibilidad')) &&
    p.descripcion.toLowerCase().includes(filtro('tipo')) &&
    (!filtro('verificacion') || p.verificacion === filtro('verificacion')) && p.precio <= precio)
    .map(([id, p]) => ({ id, ...p })));
});
app.get('/api/perfil', (req, res) => {
  if (req.rol !== 'paseador') return res.sendStatus(403);
  res.json(perfiles.get(req.actor));
});
function adminDemo(req, res, next) {
  if (req.rol !== 'admin') return res.sendStatus(403);
  next();
}
function finPrueba(alta) {
  const fecha = new Date(alta);
  const diaAlta = fecha.getUTCDate();
  fecha.setUTCDate(1);
  fecha.setUTCMonth(fecha.getUTCMonth() + 1);
  const finMes = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 0)).getUTCDate();
  fecha.setUTCDate(Math.min(diaAlta, finMes));
  return fecha.toISOString().slice(0, 10);
}
const fechaArgentina = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());
app.get('/api/reporte-diario', adminDemo, (_req, res) => {
  const generado = Date.now();
  const corte = generado - dia;
  const reciente = fecha => {
    const instante = typeof fecha === 'number' ? fecha : Date.parse(fecha);
    return instante >= corte && instante <= generado;
  };
  const altas = usuarios.filter(u => reciente(u.alta))
    .map(({ nombre, email, rol, alta }) => ({ nombre, email, rol, alta }))
    .sort((a, b) => b.alta.localeCompare(a.alta));
  const cuotas = [...mensualidades.values()];
  const pagos = cuotas.filter(c => reciente(c.pagada)).sort((a, b) => b.pagada.localeCompare(a.pagada))
    .map(c => ({ nombre: usuarios.find(u => u.id === c.usuario)?.nombre, monto: c.monto, pagada: c.pagada, vence: c.vence }));
  const paseos = [...reservas.values()];
  const solicitudes = paseos.filter(r => reciente(r.solicitada)).sort((a, b) => b.solicitada - a.solicitada)
    .map(({ mascota, zona, estado, solicitada }) => ({ mascota, zona, estado, solicitada }));
  res.json({ generado, altas, pagos, solicitudes, totales: {
    usuarios: usuarios.length, pagos: cuotas.filter(c => c.pagada).length,
    importe: cuotas.reduce((total, c) => total + (c.pagada ? c.monto : 0), 0),
    solicitudes: paseos.length,
  } });
});
app.get('/api/mensualidades', adminDemo, (req, res) => {
  const periodo = req.query.periodo ?? fechaArgentina().slice(0, 7);
  if (typeof periodo !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(periodo)) return res.sendStatus(400);
  const hoy = fechaArgentina();
  const filas = usuarios.map(({ id, nombre, rol, alta, activo }) => {
    const pruebaHasta = finPrueba(alta);
    const cuota = mensualidades.get(id + ':' + periodo);
    const estado = cuota?.pagada ? 'pagada' : cuota ? (cuota.vence < hoy ? 'vencida' : 'pendiente')
      : hoy < pruebaHasta ? 'prueba' : 'sin registrar';
    return { id, nombre, rol, alta, activo, pruebaHasta, estado, cuota };
  });
  res.json({ periodo, tarifa: tarifaDemo, filas, totalPagado: filas.reduce((total, fila) =>
    total + (fila.cuota?.pagada ? fila.cuota.monto : 0), 0) });
});
app.post('/api/mensualidades', adminDemo, (req, res) => {
  const { usuario, vence } = req.body ?? {};
  const cuenta = usuarios.find(u => u.id === usuario && u.activo);
  const fecha = typeof vence === 'string' ? new Date(vence) : new Date(NaN);
  if (!cuenta || !/^\d{4}-\d{2}-\d{2}$/.test(vence ?? '') ||
      !Number.isFinite(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== vence) {
    return res.status(400).json({ mensaje: 'Elegí una cuenta activa y una fecha de vencimiento válida.' });
  }
  if (vence < finPrueba(cuenta.alta)) {
    return res.status(409).json({ mensaje: 'El vencimiento debe quedar fuera del mes de prueba.' });
  }
  const periodo = vence.slice(0, 7);
  const id = usuario + ':' + periodo;
  if (mensualidades.has(id)) return res.status(409).json({ mensaje: 'Esta cuenta ya tiene una mensualidad en ese período.' });
  mensualidades.set(id, { id, usuario, monto: tarifaDemo, vence, pagada: null });
  res.status(201).json({ periodo });
});
app.put('/api/mensualidades/:id/pago', adminDemo, (req, res) => {
  const cuota = mensualidades.get(req.params.id);
  if (!cuota) return res.sendStatus(404);
  cuota.pagada ??= new Date().toISOString();
  res.sendStatus(204);
});
app.get('/api/operaciones', adminDemo, (req, res) => {
  const conteo = { solicitado: 0, aceptado: 0, activo: 0, finalizado: 0, rechazado: 0, cancelado: 0 };
  for (const r of reservas.values()) conteo[r.estado]++;
  const lista = [...reservas.values()];
  const desde = typeof req.query.desde === 'string' ? Date.parse(req.query.desde) : -Infinity;
  const hasta = typeof req.query.hasta === 'string' ? Date.parse(req.query.hasta) + dia : Infinity;
  if (Number.isNaN(desde) || Number.isNaN(hasta) || desde >= hasta) return res.sendStatus(400);
  const enPeriodo = fecha => { const t = typeof fecha === 'number' ? fecha : Date.parse(fecha); return t >= desde && t < hasta; };
  const reportes = {
    altas: usuarios.filter(u => enPeriodo(u.alta)).length,
    mascotas: mascotas.filter(() => enPeriodo(altaDemo)).length,
    solicitudes: lista.filter(r => enPeriodo(r.solicitada)).length,
    completados: lista.filter(r => enPeriodo(r.fin)).length,
    eventos: eventos.filter(e => e.publicado && enPeriodo(e.fecha)).length,
    seguimientos: lista.filter(r => enPeriodo(r.inicio)).length,
  };
  const zonas = new Map();
  const sector = nombre => {
    const clave = nombre.toLocaleLowerCase('es-AR');
    if (!zonas.has(clave)) zonas.set(clave, { nombre, paseos: 0, activos: 0, eventos: 0 });
    return zonas.get(clave);
  };
  for (const c of Object.values(ciudades)) sector(c.nombre);
  for (const r of lista) {
    const z = sector(ciudades[r.ciudad].nombre);
    z.paseos++;
    if (r.estado === 'activo') z.activos++;
  }
  for (const e of eventos) if (e.publicado) sector(e.zona).eventos++;
  const cuotas = [...mensualidades.values()];
  res.json({ conteo, usuariosActivos: usuarios.filter(u => u.activo).length,
    altas7dias: usuarios.filter(u => Date.parse(u.alta) >= Date.now() - 7 * dia).length,
    cuotasPorRevisar: cuotas.filter(c => !c.pagada).length,
    cuotasVencidas: cuotas.filter(c => !c.pagada && c.vence < fechaArgentina()).length,
    usuarios: usuarios.map(u => ({ ...u, mascotas: mascotas.filter(m => m.dueno === u.id).length })),
    mascotas: mascotas.map(m => ({ ...m, dueno: usuarios.find(u => u.id === m.dueno).nombre })),
    eventos, reportes, zonas: [...zonas.values()], auditoria: auditoria.slice(-10).reverse(), dispositivos: 0, alertas: 0,
    paseadores: [...perfiles.entries()].map(([id, { foto, ...perfil }]) => ({ id, ...perfil,
      solicitudes: lista.filter(r => r.paseador === id).length,
      completados: lista.filter(r => r.paseador === id && r.estado === 'finalizado').length })) });
});
app.patch('/api/operaciones/:tipo/:id', adminDemo, (req, res) => {
  const { tipo, id } = req.params;
  const valor = req.body?.valor;
  let objetivo, campo;
  if (tipo === 'paseadores' && ['pendiente', 'aprobado', 'rechazado'].includes(valor)) {
    objetivo = perfiles.get(id);
    campo = 'verificacion';
  } else if (tipo === 'usuarios' && typeof valor === 'boolean') {
    objetivo = usuarios.find(u => u.id === id);
    campo = 'activo';
  } else if (tipo === 'eventos' && typeof valor === 'boolean') {
    objetivo = eventos.find(e => e.id === id);
    campo = 'publicado';
  } else return res.sendStatus(400);
  if (!objetivo) return res.sendStatus(404);
  if (objetivo[campo] !== valor) {
    auditoria.push({ tipo, id, anterior: objetivo[campo], valor, hora: Date.now(), actor: 'admin-demo' });
    if (auditoria.length > 100) auditoria.shift();
    objetivo[campo] = valor;
  }
  res.sendStatus(204);
});
app.put('/api/perfil', (req, res) => {
  if (req.rol !== 'paseador') return res.sendStatus(403);
  const p = req.body ?? {};
  const campos = ['nombre', 'zona', 'descripcion', 'disponibilidad', 'experiencia', 'referencias'];
  if (campos.some(c => typeof p[c] !== 'string' || !p[c].trim() || p[c].length > 300)
      || !Number.isInteger(p.precio) || p.precio <= 0 || p.precio > 1_000_000
      || !Number.isInteger(p.duracion) || p.duracion < 5 || p.duracion > 180) return res.sendStatus(400);
  let foto = '';
  if (p.foto) {
    try {
      const url = new URL(p.foto);
      if (url.protocol !== 'https:') return res.sendStatus(400);
      foto = url.href;
    } catch { return res.sendStatus(400); }
  }
  const perfil = Object.fromEntries(campos.map(c => [c, p[c].trim()]));
  perfiles.set(req.actor, { ...perfil, ciudad: req.ciudad, precio: p.precio, duracion: p.duracion, foto,
    verificacion: perfiles.get(req.actor)?.verificacion ?? 'pendiente' });
  res.sendStatus(204);
});

const resumen = ({ puntos, ...reserva }) => ({ ...reserva, distanciaKm: Math.round(reserva.distanciaKm * 100) / 100 });
app.get('/api/reservas', (req, res) => {
  res.json([...reservas.values()].filter(r => r.ciudad === req.ciudad && [r.dueno, r.paseador].includes(req.actor)).map(resumen));
});
app.post('/api/reservas', (req, res) => {
  if (req.rol !== 'dueno') return res.sendStatus(403);
  const { paseador, mascota, fecha } = req.body ?? {};
  const perfil = perfiles.get(paseador);
  const horario = typeof fecha === 'string' ? Date.parse(fecha) : NaN;
  if (!Number.isFinite(horario) || horario <= Date.now()) {
    return res.status(400).json({ mensaje: 'Elegí una fecha y un horario futuros para solicitar el paseo.' });
  }
  if (!perfil || perfil.ciudad !== req.ciudad || !usuarios.some(u => u.id === paseador && u.activo) ||
      !mascotas.some(m => m.nombre === mascota && m.dueno === req.rol)) {
    return res.status(400).json({ mensaje: 'Seleccioná un paseador y una mascota disponibles.' });
  }
  const fechaReserva = new Date(horario).toISOString();
  if ([...reservas.values()].some(r => r.dueno === req.rol && r.paseador === paseador &&
      r.mascota === mascota && r.fecha === fechaReserva && !['rechazado', 'cancelado'].includes(r.estado))) {
    return res.status(409).json({ mensaje: 'Ya tenés una solicitud para esa mascota, ese paseador y ese horario.' });
  }
  const r = { id: randomUUID(), dueno: req.actor, paseador, mascota, fecha: fechaReserva, ciudad: req.ciudad,
    precio: perfil.precio, duracion: perfil.duracion, zona: perfil.zona, solicitada: Date.now(),
    estado: 'solicitado', puntos: [], distanciaKm: 0 };
  reservas.set(r.id, r);
  res.status(201).json(resumen(r));
});

app.use('/api/reservas/:id', (req, res, next) => {
  const r = reservas.get(req.params.id);
  if (!r || r.ciudad !== req.ciudad || ![r.dueno, r.paseador].includes(req.actor)) return res.sendStatus(404);
  if (r.estado === 'activo' && Date.now() - r.inicio >= limiteSeguimiento) {
    r.estado = 'finalizado';
    r.fin = r.inicio + limiteSeguimiento;
    r.puntos = [];
  }
  req.reserva = r;
  next();
});

const transiciones = {
  aceptar: ['paseador', ['solicitado'], 'aceptado'],
  rechazar: ['paseador', ['solicitado'], 'rechazado'],
  cancelar: ['ambos', ['solicitado', 'aceptado'], 'cancelado'],
  iniciar: ['paseador', ['aceptado'], 'activo'],
  finalizar: ['paseador', ['activo'], 'finalizado'],
};
app.post('/api/reservas/:id/estado', (req, res) => {
  const r = req.reserva;
  const accion = req.body?.accion;
  if (!Object.hasOwn(transiciones, accion)) return res.sendStatus(400);
  const [rol, desde, estado] = transiciones[accion];
  if (rol !== 'ambos' && req.rol !== rol) return res.sendStatus(403);
  if (!desde.includes(r.estado)) return res.sendStatus(409);
  if (accion === 'iniciar') {
    const ahora = Date.now();
    const turno = Date.parse(r.fecha);
    if (ahora < turno - 15 * 60_000) {
      return res.status(409).json({ mensaje: 'Podés iniciar el seguimiento desde 15 minutos antes del horario reservado.' });
    }
    if (ahora >= turno + r.duracion * 60_000) {
      return res.status(409).json({ mensaje: 'El horario reservado ya terminó. Coordiná una nueva solicitud.' });
    }
    r.inicio = ahora;
  }
  if (accion === 'finalizar') {
    r.fin = Date.now();
    r.puntos = [];
  }
  r.estado = estado;
  res.json(resumen(r));
});
app.route('/api/reservas/:id/ubicacion')
  .get((req, res) => {
    const r = req.reserva;
    if (r.estado !== 'activo') return res.sendStatus(409);
    res.json({ puntos: r.puntos, distanciaKm: resumen(r).distanciaKm, inicio: r.inicio });
  })
  .post((req, res) => {
    const r = req.reserva;
    if (req.actor !== r.paseador) return res.sendStatus(403);
    if (r.estado !== 'activo') return res.sendStatus(409);
    const simulado = req.body?.simular === true;
    if (!simulado && !gpsReal) return res.sendStatus(403);
    const paso = r.puntos.length;
    const centro = ciudades[r.ciudad];
    const { lat, lon } = simulado
      ? { lat: centro.lat + paso * .00025, lon: centro.lon + paso * .0003 }
      : (req.body ?? {});
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return res.sendStatus(400);
    }
    if (r.puntos.length >= 3600) return res.sendStatus(429);
    const hora = Date.now();
    const capturada = simulado ? hora : req.body?.capturada;
    if (!Number.isFinite(capturada) || capturada < hora - 30_000 || capturada > hora + 10_000) {
      return res.status(400).json({ mensaje: 'La posición recibida está vencida o el reloj del teléfono no coincide.' });
    }
    const punto = { lat, lon, hora, capturada, simulado };
    const anterior = r.puntos.at(-1);
    if (anterior && anterior.simulado !== simulado) {
      return res.status(409).json({ mensaje: 'Usá una reserva distinta para GPS real y para simulación.' });
    }
    if (anterior && capturada <= anterior.capturada) {
      return res.status(409).json({ mensaje: 'La posición no es más reciente que la anterior.' });
    }
    if (anterior && punto.hora - anterior.hora < 1000) return res.sendStatus(429);
    if (anterior) r.distanciaKm += distancia(anterior, punto);
    r.puntos.push(punto);
    res.sendStatus(204);
  });

setInterval(() => {
  const ahora = Date.now();
  for (const [token, sesion] of sesiones) if (sesion.vence <= ahora) sesiones.delete(token);
  for (const [id, r] of reservas) {
    if (r.estado === 'activo' && ahora - r.inicio >= limiteSeguimiento) {
      r.estado = 'finalizado';
      r.fin = r.inicio + limiteSeguimiento;
      r.puntos = [];
    }
    if (ahora - (r.fin ?? Date.parse(r.fecha)) > dia) reservas.delete(id);
  }
}, 60_000).unref();

app.listen(puerto, '127.0.0.1', () => console.log(`Demo Indio: http://127.0.0.1:${puerto}`));
const minutosInstancia = Number(process.env.INDIO_DEMO_MINUTOS);
if (Number.isInteger(minutosInstancia) && minutosInstancia > 0) {
  setTimeout(() => process.exit(0), minutosInstancia * 60_000).unref();
}
