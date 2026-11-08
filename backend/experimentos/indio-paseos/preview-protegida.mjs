import { spawn } from 'node:child_process';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import http from 'node:http';
import { writeFileSync } from 'node:fs';

const usuario = 'indio';
const puertoDemo = Number(process.env.INDIO_DEMO_PORT ?? 8784);
const puertoProxy = Number(process.env.INDIO_PREVIEW_PORT ?? 8785);
const minutos = Number(process.env.INDIO_PREVIEW_MINUTOS ?? 45);
const archivoAcceso = process.env.INDIO_PREVIEW_ACCESS_FILE;
if (!Number.isInteger(minutos) || minutos < 1 || minutos > 240) {
  throw new Error('La vista previa debe durar entre 1 y 240 minutos.');
}
const clave = randomBytes(18).toString('base64url');
const esperado = Buffer.from('Basic ' + Buffer.from(usuario + ':' + clave).toString('base64'));
let dominio;
const proxy = http.createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const recibido = Buffer.from(req.headers.authorization ?? '');
  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Demo temporal Indio", charset="UTF-8"' });
    return res.end('Acceso protegido');
  }
  if (req.headers.origin && req.headers.origin !== 'https://' + dominio) {
    res.writeHead(403);
    return res.end();
  }
  const headers = { host: '127.0.0.1:' + puertoDemo };
  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type'];
  if (req.headers['content-length']) headers['content-length'] = req.headers['content-length'];
  // El navegador usa Basic para la vista previa y la demo envía su token en este encabezado.
  if (req.headers['x-indio-demo-token']) headers.authorization = 'Bearer ' + req.headers['x-indio-demo-token'];
  const destino = http.request({ hostname: '127.0.0.1', port: puertoDemo, path: req.url, method: req.method, headers }, upstream => {
    if (upstream.headers['content-type']) res.setHeader('Content-Type', upstream.headers['content-type']);
    res.writeHead(upstream.statusCode);
    upstream.pipe(res);
  });
  destino.on('error', () => { res.writeHead(502); res.end('Demo local no disponible'); });
  req.pipe(destino);
});

proxy.listen(puertoProxy, '127.0.0.1', () => {
  const tunnel = spawn('cloudflared', ['tunnel', '--url', 'http://127.0.0.1:' + puertoProxy, '--protocol', 'http2', '--no-autoupdate']);
  let salida = '';
  tunnel.stderr.on('data', chunk => {
    salida = (salida + chunk).slice(-4000);
    const url = salida.match(/https:\/\/([a-z0-9-]+\.trycloudflare\.com)/i);
    if (!dominio && url) {
      dominio = url[1];
      if (archivoAcceso) {
        try { writeFileSync(archivoAcceso, `Usuario: ${usuario}\nContraseña: ${clave}\n`, { flag: 'wx', mode: 0o600 }); }
        catch (error) { console.error('No se pudo guardar el acceso temporal:', error.code); cerrar(); return; }
      }
      console.log(`URL: ${url[0]}\nDuración máxima: ${minutos} minutos` +
        (archivoAcceso ? '\nAcceso temporal guardado en: ' + archivoAcceso : '\nUsuario: ' + usuario + '\nClave: ' + clave));
    }
  });
  tunnel.on('error', error => { console.error(error.message); proxy.close(); });
  tunnel.on('exit', () => { if (!dominio) console.error(salida); proxy.close(); });
  const cerrar = () => { tunnel.kill(); proxy.close(); };
  process.on('SIGINT', cerrar);
  process.on('SIGTERM', cerrar);
  setTimeout(cerrar, minutos * 60_000).unref();
});
