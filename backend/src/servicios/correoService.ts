const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const EMAIL_ADMIN_POR_DEFECTO = 'it360tecnologia@gmail.com';

type TipoCorreoMembresia =
  | 'prueba'
  | 'renovacion'
  | 'recordatorio_7d'
  | 'recordatorio_1d';

/**
 * Envía un email transaccional con Resend. Devuelve true si Resend lo aceptó.
 * Se usa como alternativa a SMTP para recuperación de contraseña.
 */
export async function enviarEmailResend(
  destinatario: string,
  asunto: string,
  texto: string,
  html?: string,
  idempotencyKey?: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_FROM?.trim();
  if (!apiKey || !from) return false;

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from,
        to: [destinatario],
        subject: asunto,
        text: texto,
        ...(html ? { html } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const detalle = await response.text().catch(() => '');
      console.error('Resend rechazó el email de recuperación:', response.status, detalle);
    }
    return response.ok;
  } catch (error) {
    console.error('Error enviando email con Resend:', error);
    return false;
  }
}

export async function enviarCorreoMembresia(
  tipo: TipoCorreoMembresia,
  id: string,
  destinatario: string,
  asunto: string,
  texto: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const to = tipo === 'prueba'
    ? process.env.MEMBRESIA_ADMIN_EMAIL?.trim() ||
      process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || EMAIL_ADMIN_POR_DEFECTO
    : destinatario;
  if (!apiKey || !from) return false;

  // Los recordatorios incluyen la fecha en la clave para permitir reintentos
  // en días distintos sin que Resend los descarte como duplicados.
  const clave = tipo.startsWith('recordatorio_')
    ? `indio-membresia/${tipo}/${id}/${new Date().toISOString().slice(0, 10)}`
    : `indio-membresia/${tipo}/${id}`;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': clave,
      },
      body: JSON.stringify({ from, to: [to], subject: asunto, text: texto }),
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

interface NuevoRegistroEmail {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  fechaNacimiento?: Date | null;
  tipoUsuario?: string | null;
  createdAt: Date;
}

function escaparHtml(valor: unknown): string {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function valorVisible(valor: unknown): string {
  const texto = String(valor ?? '').trim();
  return texto || 'No informado';
}

/**
 * Avisa a IT360 cuando se crea una cuenta en Indio.
 * Nunca incluye contrasenas, tokens ni otros secretos. Un fallo de correo no
 * debe revertir ni bloquear el registro que ya fue guardado en la base.
 */
export async function notificarNuevoRegistro(usuario: NuevoRegistroEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const to = process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || EMAIL_ADMIN_POR_DEFECTO;

  if (!apiKey || !from) {
    console.warn('Notificacion de registro omitida: configura RESEND_API_KEY y EMAIL_FROM.');
    return false;
  }

  const fechaRegistro = usuario.createdAt.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
  });
  const fechaNacimiento = usuario.fechaNacimiento
    ? usuario.fechaNacimiento.toLocaleDateString('es-AR', { timeZone: 'UTC' })
    : 'No informada';

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Nuevo registro en Indio: ${usuario.nombre}`,
      text: [
        'Se registro un nuevo usuario en Indio Comunidad Pet Friendly.',
        `Nombre: ${valorVisible(usuario.nombre)}`,
        `Email: ${valorVisible(usuario.email)}`,
        `Telefono: ${valorVisible(usuario.telefono)}`,
        `Fecha de nacimiento: ${fechaNacimiento}`,
        `Tipo de usuario: ${valorVisible(usuario.tipoUsuario)}`,
        `Fecha del registro: ${fechaRegistro}`,
        `ID interno: ${usuario.id}`,
      ].join('\n'),
      html: `
        <h2>Nuevo registro en Indio</h2>
        <p>Se registro un nuevo usuario en Indio Comunidad Pet Friendly.</p>
        <table cellpadding="6" cellspacing="0" border="0">
          <tr><td><strong>Nombre</strong></td><td>${escaparHtml(usuario.nombre)}</td></tr>
          <tr><td><strong>Email</strong></td><td>${escaparHtml(usuario.email)}</td></tr>
          <tr><td><strong>Telefono</strong></td><td>${escaparHtml(valorVisible(usuario.telefono))}</td></tr>
          <tr><td><strong>Fecha de nacimiento</strong></td><td>${escaparHtml(fechaNacimiento)}</td></tr>
          <tr><td><strong>Tipo de usuario</strong></td><td>${escaparHtml(valorVisible(usuario.tipoUsuario))}</td></tr>
          <tr><td><strong>Fecha del registro</strong></td><td>${escaparHtml(fechaRegistro)}</td></tr>
          <tr><td><strong>ID interno</strong></td><td>${escaparHtml(usuario.id)}</td></tr>
        </table>
      `,
    }),
  });

  if (!response.ok) {
    const detalle = await response.text();
    throw new Error(`Resend rechazo la notificacion (${response.status}): ${detalle.slice(0, 300)}`);
  }

  return true;
}
