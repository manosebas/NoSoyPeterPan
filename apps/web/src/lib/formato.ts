import { leePlazo, type LecturaPlazo } from '@nspp/shared';

const FECHA_LARGA = new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' });
const FECHA_CORTA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

/** Como se nombra un plazo en pantalla. */
export const NOMBRE_PLAZO: Record<LecturaPlazo, string> = {
  sin_fecha: 'sin fecha',
  vencido: 'vencido',
  semana: 'esta semana',
  corto: 'corto plazo',
  mediano: 'mediano plazo',
  largo: 'largo plazo',
};

/**
 * Texto de la fecha de un objetivo. Lo lejano se dice por mes y ano; lo
 * cercano por dia, que es lo unico que importa cuando falta poco.
 */
export function textoFecha(venceEl: string | null, ahora = new Date()): string {
  if (!venceEl) return 'sin fecha';

  const fecha = new Date(`${venceEl}T00:00:00`);
  const lectura = leePlazo(venceEl, ahora);
  const hoy = ahora.toISOString().slice(0, 10);

  if (venceEl === hoy) return 'hoy';
  if (lectura === 'vencido' || lectura === 'semana' || lectura === 'corto') {
    return FECHA_CORTA.format(fecha);
  }
  return FECHA_LARGA.format(fecha);
}

/** Frase del estado de una rama. Sin maquillar: regla 7 de CLAUDE.md. */
export function textoActividad(diasQuieta: number | null): string {
  if (diasQuieta === null) return 'sin empezar';
  if (diasQuieta === 0) return 'creciendo hoy';
  if (diasQuieta === 1) return 'creciendo ayer';
  if (diasQuieta < 7) return `hace ${diasQuieta} días`;
  if (diasQuieta < 14) return 'quieta hace una semana';
  if (diasQuieta < 60) return `quieta hace ${Math.floor(diasQuieta / 7)} semanas`;
  return `quieta hace ${Math.floor(diasQuieta / 30)} meses`;
}
