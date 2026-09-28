/**
 * Utilidad de fechas para perfiles.
 */
export function calcularEdad(fechaNacimiento?: string | null): number {
  if (!fechaNacimiento) return 25;
  const nacimiento = new Date(fechaNacimiento);
  if (Number.isNaN(nacimiento.getTime())) return 25;

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  if (!Number.isFinite(edad) || edad < 18) return 25;
  return Math.min(99, edad);
}
