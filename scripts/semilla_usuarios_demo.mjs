/**
 * Semilla de usuarios de ejemplo para Indio (beta)
 *
 * Crea 8 perfiles con datos realistas (Santa Fe / Paraná), avatar, mascotas
 * y participación en eventos, para que las personas que se registren vean
 * actividad en Matching, Mapa y Eventos.
 *
 * Uso:
 *   node scripts/semilla_usuarios_demo.mjs            (crea/actualiza)
 *   node scripts/semilla_usuarios_demo.mjs --dry-run  (solo muestra el plan)
 *
 * Los emails son de estilo personal y NO se les envía ningún correo.
 */

const API = process.env.INDIO_API_URL || 'https://indio.com.ar/api';
const DRY = process.argv.includes('--dry-run');
const PASSWORD = 'IndioComunidad2026!';

const usuarios = [
  {
    nombre: 'Camila Sosa',
    email: 'camila.sosa.sf@gmail.com',
    fechaNacimiento: '1995-03-12',
    tipoUsuario: 'dueno',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    biografia: 'Corro casi todas las mañanas por la Costanera. Kira es mi copiloto de 4 patas. Busco gente para sumar al grupo.',
    ciudad: 'Santa Fe', lat: -31.6275, lng: -60.6940,
    nivelDeporte: 4,
    intereses: ['running', 'paseos', 'eventos'],
    mascotas: [
      { nombre: 'Kira', tipo: 'perro', raza: 'Border Collie', edad: 3, genero: 'hembra',
        personalidad: ['juguetona', 'sociable', 'energética'], nivelActividad: 4,
        intereses: ['correr', 'parque', 'pelota'], fotos: [] },
    ],
  },
  {
    nombre: 'Julián Aguirre',
    email: 'julian.aguirre.sf@gmail.com',
    fechaNacimiento: '1990-09-23',
    tipoUsuario: 'cuidador',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    biografia: 'Salgo en bici los fines de semana por la ruta 1. Ritmo tranquilo, siempre con parada a desayunar.',
    ciudad: 'Santa Fe', lat: -31.6333, lng: -60.7000,
    nivelDeporte: 4,
    intereses: ['ciclismo', 'eventos'],
    mascotas: [],
  },
  {
    nombre: 'Florencia Benítez',
    email: 'florencia.benitez.sf@gmail.com',
    fechaNacimiento: '1997-01-30',
    tipoUsuario: 'dueno',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    biografia: 'Yoga suave, mate y paseos largos con Nala. Si te gustan los planes tranquilos, hablemos.',
    ciudad: 'Santa Fe', lat: -31.6180, lng: -60.7110,
    nivelDeporte: 2,
    intereses: ['yoga', 'paseos', 'cafés'],
    mascotas: [
      { nombre: 'Nala', tipo: 'gato', raza: 'Siamesa', edad: 4, genero: 'hembra',
        personalidad: ['tranquila', 'cariñosa'], nivelActividad: 2,
        intereses: ['siesta', 'ventana'], fotos: [] },
    ],
  },
  {
    nombre: 'Nicolás Ramírez',
    email: 'nicolas.ramirez.st@gmail.com',
    fechaNacimiento: '1993-06-08',
    tipoUsuario: 'dueno',
    avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
    biografia: 'Rescaté a Toto hace dos años y desde entonces no paramos. Corremos por la costanera de Santo Tomé.',
    ciudad: 'Santo Tomé', lat: -31.6630, lng: -60.7660,
    nivelDeporte: 3,
    intereses: ['running', 'fútbol', 'eventos'],
    mascotas: [
      { nombre: 'Toto', tipo: 'perro', raza: 'Mestizo', edad: 5, genero: 'macho',
        personalidad: ['rescatado', 'fiel', 'juguetón'], nivelActividad: 3,
        intereses: ['correr', 'nadar'], fotos: [] },
    ],
  },
  {
    nombre: 'Agustina Lemos',
    email: 'agustina.lemos.pna@gmail.com',
    fechaNacimiento: '1999-11-17',
    tipoUsuario: 'dueno',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    biografia: 'Estudiante de veterinaria. Los findes me escapo al río con Uma. Siempre sumo gente al plan.',
    ciudad: 'Paraná', lat: -31.7410, lng: -60.5170,
    nivelDeporte: 3,
    intereses: ['senderismo', 'running', 'eventos'],
    mascotas: [
      { nombre: 'Uma', tipo: 'perro', raza: 'Weimaraner', edad: 2, genero: 'hembra',
        personalidad: ['inquieta', 'dulce'], nivelActividad: 4,
        intereses: ['senderismo', 'río'], fotos: [] },
    ],
  },
  {
    nombre: 'Martín Cabrera',
    email: 'martin.cabrera.sf@gmail.com',
    fechaNacimiento: '1986-03-05',
    tipoUsuario: 'familia',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    biografia: 'Profe de funcional. Sábados 9am armamos grupo en el Parque del Sur. Sumate con o sin perro.',
    ciudad: 'Santa Fe', lat: -31.6450, lng: -60.7080,
    nivelDeporte: 5,
    intereses: ['entrenamiento', 'running', 'eventos'],
    mascotas: [],
  },
  {
    nombre: 'Valentina Ruiz',
    email: 'valentina.ruiz.pna@gmail.com',
    fechaNacimiento: '1991-08-26',
    tipoUsuario: 'dueno',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    biografia: 'Mamá de Simón. Amo los cafés pet friendly y los paseos largos sin apuro.',
    ciudad: 'Paraná', lat: -31.7290, lng: -60.5290,
    nivelDeporte: 2,
    intereses: ['paseos', 'cafés', 'eventos'],
    mascotas: [
      { nombre: 'Simón', tipo: 'perro', raza: 'Caniche', edad: 6, genero: 'macho',
        personalidad: ['tranquilo', 'faldero'], nivelActividad: 2,
        intereses: ['paseos', 'cafés'], fotos: [] },
    ],
  },
  {
    nombre: 'Facundo Delgado',
    email: 'facundo.delgado.sf@gmail.com',
    fechaNacimiento: '1994-12-14',
    tipoUsuario: 'dueno',
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    biografia: 'Trabajo de noche, entreno de noche. Lola y yo corremos por la costanera cuando está todo quieto.',
    ciudad: 'Santa Fe', lat: -31.6070, lng: -60.6860,
    nivelDeporte: 4,
    intereses: ['running', 'ciclismo'],
    mascotas: [
      { nombre: 'Lola', tipo: 'perro', raza: 'Labrador', edad: 4, genero: 'hembra',
        personalidad: ['compañera', 'tranquila'], nivelActividad: 4,
        intereses: ['correr', 'costanera'], fotos: [] },
    ],
  },
];

async function req(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 300) }; }
  return { status: res.status, json };
}

// Espera a que la API responda (útil al correr como post-deploy en el contenedor)
async function esperarApi(maxIntentos = 30) {
  for (let i = 1; i <= maxIntentos; i++) {
    try {
      const r = await req('GET', '/salud');
      if (r.status === 200) return true;
    } catch { /* reintentar */ }
    await new Promise((res) => setTimeout(res, 2000));
  }
  return false;
}

async function main() {
  console.log(`API: ${API}${DRY ? '  (DRY RUN)' : ''}`);
  console.log(`Usuarios a procesar: ${usuarios.length}\n`);

  const apiLista = await esperarApi();
  console.log(`API disponible: ${apiLista ? 'sí' : 'NO (se intenta igual)'}`);

  const evRes = await req('GET', '/eventos');
  const eventos = Array.isArray(evRes.json?.data) ? evRes.json.data : [];
  const ahora = Date.now();
  const proximos = eventos.filter((e) => new Date(e.fechaInicio).getTime() >= ahora);
  const paraUnirse = proximos.length ? proximos : eventos;
  console.log(`Eventos en la plataforma: ${eventos.length} (próximos: ${proximos.length})`);

  const resultados = [];

  for (let i = 0; i < usuarios.length; i++) {
    const u = usuarios[i];
    console.log(`\n=== ${u.nombre} — ${u.email} ===`);

    if (DRY) {
      console.log(`  perfil: ${u.ciudad} (${u.lat}, ${u.lng}) | intereses: ${u.intereses.join(', ')}`);
      console.log(`  mascotas: ${u.mascotas.map((m) => m.nombre).join(', ') || 'ninguna'}`);
      continue;
    }

    // 1) Registro (si ya existe, se ignora el error y se sigue con login)
    let r = await req('POST', '/auth/registro', {
      email: u.email,
      password: PASSWORD,
      nombre: u.nombre,
      fechaNacimiento: u.fechaNacimiento,
      tipoUsuario: u.tipoUsuario,
      intereses: u.intereses,
    });
    console.log(`  registro: ${r.status} ${r.json?.message || ''}`.trim());

    // 2) Login para obtener token
    r = await req('POST', '/auth/login', { email: u.email, password: PASSWORD });
    const token = r.json?.data?.token;
    if (!token) {
      console.log(`  login FALLÓ: ${r.status} ${JSON.stringify(r.json).slice(0, 200)}`);
      resultados.push({ email: u.email, estado: 'login-fallo' });
      continue;
    }
    console.log('  login: ok');

    // 3) Perfil completo (avatar, bio, ubicación, intereses)
    r = await req('PUT', '/usuarios/mi-perfil', {
      nombre: u.nombre,
      avatar: u.avatar,
      biografia: u.biografia,
      ubicacionLat: u.lat,
      ubicacionLng: u.lng,
      ubicacionCiudad: u.ciudad,
      ubicacionPais: 'Argentina',
      nivelDeporte: u.nivelDeporte,
      tipoUsuario: u.tipoUsuario,
      intereses: u.intereses,
      onboardingCompletado: true,
    }, token);
    console.log(`  perfil: ${r.status}`);

    // 4) Mascotas (idempotente: no duplica si ya existe una con el mismo nombre)
    const misMascotas = await req('GET', '/mascotas', null, token);
    const nombresExistentes = new Set(
      (Array.isArray(misMascotas.json?.data) ? misMascotas.json.data : []).map((m) =>
        String(m.nombre || '').toLowerCase()
      )
    );
    for (const m of u.mascotas) {
      if (nombresExistentes.has(String(m.nombre).toLowerCase())) {
        console.log(`  mascota ${m.nombre}: ya existe, sin cambios`);
        continue;
      }
      r = await req('POST', '/mascotas', m, token);
      console.log(`  mascota ${m.nombre}: ${r.status} ${r.json?.message || ''}`.trim());
    }

    // 5) Sumarse a 1-2 eventos (repartidos)
    const seleccion = [];
    if (paraUnirse.length) {
      seleccion.push(paraUnirse[i % paraUnirse.length]);
      if (paraUnirse.length > 1) seleccion.push(paraUnirse[(i + 3) % paraUnirse.length]);
    }
    for (const ev of seleccion) {
      r = await req('POST', `/eventos/${ev.id}/participar`, {}, token);
      console.log(`  evento "${ev.titulo}": ${r.status}`);
    }

    resultados.push({
      email: u.email,
      nombre: u.nombre,
      estado: 'ok',
      mascotas: u.mascotas.map((m) => m.nombre),
      eventos: seleccion.map((e) => e.titulo),
    });
  }

  console.log('\n================ RESUMEN ================');
  const ok = resultados.filter((x) => x.estado === 'ok').length;
  console.log(`Creados/actualizados: ${ok}/${usuarios.length}`);
  for (const x of resultados) {
    console.log(`- ${x.nombre} <${x.email}> → ${x.estado}`);
  }
  console.log(`\nContraseña de los usuarios demo: ${PASSWORD}`);
  console.log('(No se envía ningún correo a estas cuentas.)');
}

main()
  .then(() => {
    // Salida segura para post-deploy: nunca marcar el deploy como fallido
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error inesperado:', e);
    process.exit(0);
  });
