// Acceso administrativo compartido por las rutas y por el login.
// ADMIN_USER_IDS permite autorizar por ID y ADMIN_EMAILS por correo,
// para no depender de conocer el ID interno de cada administrador.

const idsAdministradores = new Set(
  (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
);

const emailsAdministradores = new Set(
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

export function esAdministrador(usuario: { id: string; email: string }): boolean {
  return (
    idsAdministradores.has(usuario.id) ||
    emailsAdministradores.has(usuario.email.trim().toLowerCase())
  );
}
