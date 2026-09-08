/**
 * Lexico canonico de No Soy Peter Pan.
 *
 * Los nombres de dominio se conservan en espanol a proposito: son parte de la
 * identidad del producto, no vocabulario generico. Ver CLAUDE.md seccion 2.
 *
 * La cadena central del producto:
 *   Algun dia -> 5 anos (Norte) -> 1 ano -> 90 dias -> semana -> hoy
 */

/** Areas de vida donde ocurre el crecimiento. */
export const TERRITORIOS = [
  'carrera',
  'dinero',
  'cuerpo',
  'relaciones',
  'mente',
  'aventura',
] as const;

export type Territorio = (typeof TERRITORIOS)[number];

/** Horizonte temporal de una Ruta. */
export const HORIZONTES = ['cinco_anos', 'un_ano', 'noventa_dias'] as const;
export type Horizonte = (typeof HORIZONTES)[number];

export const ESTADOS_RUTA = ['activa', 'pausada', 'lograda', 'abandonada'] as const;
export type EstadoRuta = (typeof ESTADOS_RUTA)[number];

export const ESTADOS_MISION = ['pendiente', 'completada', 'saltada'] as const;
export type EstadoMision = (typeof ESTADOS_MISION)[number];

/** Identificador de usuario: coincide con auth.users.id de Supabase. */
export type UsuarioId = string;

/**
 * El Norte. La vision a 5 anos: quien quieres ser.
 * Sin Norte no se pueden crear Misiones (regla 3 de CLAUDE.md).
 */
export interface Norte {
  id: string;
  usuarioId: UsuarioId;
  titulo: string;
  descripcion: string | null;
  fechaHorizonte: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Una Ruta conecta el hoy con el Norte. Existe en tres horizontes:
 * 5 anos, 1 ano y 90 dias. Una Ruta puede colgar de otra Ruta mas larga.
 */
export interface Ruta {
  id: string;
  usuarioId: UsuarioId;
  norteId: string;
  rutaPadreId: string | null;
  territorio: Territorio;
  horizonte: Horizonte;
  titulo: string;
  descripcion: string | null;
  estado: EstadoRuta;
  fechaLimite: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

/**
 * Una Mision es una accion de la semana o del dia.
 * REGLA 1 (no negociable): ninguna Mision es huerfana. `rutaId` es obligatorio
 * porque toda Mision debe poder responder "a que objetivo de mi vida contribuye".
 */
export interface Mision {
  id: string;
  usuarioId: UsuarioId;
  rutaId: string;
  titulo: string;
  /** Resignificacion: que compras con esta accion. Ver regla 2 de CLAUDE.md. */
  significado: string | null;
  estado: EstadoMision;
  fechaProgramada: string;
  completadaEn: string | null;
  creadoEn: string;
}

/**
 * Nunca Jamas: donde viven los "algun dia voy a...".
 * Es visible a proposito. Es el antagonista del juego (regla 4).
 */
export interface AlgunDia {
  id: string;
  usuarioId: UsuarioId;
  texto: string;
  territorio: Territorio | null;
  creadoEn: string;
  /** Cuando salio de Nunca Jamas al convertirse en Ruta. */
  rescatadoEn: string | null;
  rutaGeneradaId: string | null;
}

/**
 * Un Voto: cada Mision completada es un voto por la persona que quieres ser.
 * Es la unidad de progreso del juego, no un contador de checks.
 */
export interface Voto {
  id: string;
  usuarioId: UsuarioId;
  misionId: string;
  rutaId: string;
  territorio: Territorio;
  emitidoEn: string;
}

/** Perfil publico del usuario, espejo de auth.users. */
export interface Perfil {
  id: UsuarioId;
  nombre: string | null;
  avatarUrl: string | null;
  creadoEn: string;
}

/** Cuantos dias lleva un AlgunDia en Nunca Jamas. Alimenta a La Sombra. */
export function diasEnNuncaJamas(algunDia: Pick<AlgunDia, 'creadoEn'>, ahora = new Date()): number {
  const desde = new Date(algunDia.creadoEn).getTime();
  return Math.floor((ahora.getTime() - desde) / 86_400_000);
}
