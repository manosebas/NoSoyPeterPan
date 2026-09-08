/**
 * Lexico canonico de No Soy Peter Pan.
 *
 * Los nombres de dominio se conservan en espanol a proposito: son parte de la
 * identidad del producto, no vocabulario generico. Ver CLAUDE.md seccion 2 y
 * docs/JUEGO.md.
 *
 * El juego entero es un arbol: un objetivo se desglosa en objetivos mas chicos,
 * y esos se vuelven a desglosar hasta llegar a algo que se pueda hacer. El
 * Norte es la raiz; una Mision es una hoja. Misma entidad a distinta altura.
 */

/** Areas de vida donde ocurre el crecimiento. Sin uso todavia: ver JUEGO.md. */
export const TERRITORIOS = [
  'carrera',
  'dinero',
  'cuerpo',
  'relaciones',
  'mente',
  'aventura',
] as const;

export type Territorio = (typeof TERRITORIOS)[number];

/** Identificador de usuario: coincide con auth.users.id de Supabase. */
export type UsuarioId = string;

/** Seis niveles: raiz mas cinco desgloses. Mas abajo ya es la accion de hoy. */
export const PROFUNDIDAD_MAX = 5;

/**
 * Un objetivo. Cuelga de otro o es raiz.
 *
 * `completadoEn` solo lo llevan las hojas: un objetivo con desglose se cumple
 * cuando se cumple su desglose, y eso se calcula (ver `progreso`), no se guarda.
 * `venceEl` en null significa que vive en Nunca Jamas.
 */
export interface Objetivo {
  id: string;
  usuarioId: UsuarioId;
  padreId: string | null;
  titulo: string;
  detalle: string | null;
  venceEl: string | null;
  completadoEn: string | null;
  orden: number;
  profundidad: number;
  creadoEn: string;
}

/** Objetivo con su desglose colgando. Lo que consume la UI. */
export interface NodoObjetivo extends Objetivo {
  hijos: NodoObjetivo[];
}

/**
 * Plazos que se ofrecen al crear. La fecha es el dato real; el plazo solo
 * decide que dia se propone por defecto y como se lee despues.
 */
export const PLAZOS = [
  { clave: 'largo', etiqueta: 'Largo plazo', dias: 1460 },
  { clave: 'mediano', etiqueta: 'Mediano plazo', dias: 365 },
  { clave: 'corto', etiqueta: 'Corto plazo', dias: 90 },
  { clave: 'semana', etiqueta: 'Esta semana', dias: 7 },
] as const;

export type Plazo = (typeof PLAZOS)[number]['clave'];

/** Mientras mas abajo en el arbol, mas cerca la fecha que se propone. */
export function plazoPorDefecto(profundidad: number): Plazo {
  if (profundidad <= 0) return 'largo';
  if (profundidad === 1) return 'mediano';
  if (profundidad === 2) return 'corto';
  return 'semana';
}

/** Fecha propuesta, en formato `YYYY-MM-DD` para la columna `date`. */
export function fechaDePlazo(plazo: Plazo, hoy = new Date()): string {
  const dias = PLAZOS.find((p) => p.clave === plazo)?.dias ?? 90;
  const fecha = new Date(hoy.getTime() + dias * 86_400_000);
  return fecha.toISOString().slice(0, 10);
}

export type LecturaPlazo = 'sin_fecha' | 'vencido' | Plazo;

/** Como se lee una fecha ya guardada: el plazo se deduce, no se clasifica. */
export function leePlazo(venceEl: string | null, hoy = new Date()): LecturaPlazo {
  if (!venceEl) return 'sin_fecha';

  const dias = Math.ceil((new Date(`${venceEl}T00:00:00Z`).getTime() - hoy.getTime()) / 86_400_000);
  if (dias < 0) return 'vencido';
  if (dias <= 7) return 'semana';
  if (dias <= 90) return 'corto';
  if (dias <= 365) return 'mediano';
  return 'largo';
}

/** Arma el arbol a partir de las filas planas. Devuelve las raices. */
export function construyeArbol(objetivos: Objetivo[]): NodoObjetivo[] {
  const porId = new Map<string, NodoObjetivo>();
  for (const o of objetivos) porId.set(o.id, { ...o, hijos: [] });

  const raices: NodoObjetivo[] = [];
  for (const nodo of porId.values()) {
    const padre = nodo.padreId ? porId.get(nodo.padreId) : undefined;
    if (padre) padre.hijos.push(nodo);
    else raices.push(nodo);
  }

  const ordena = (nodos: NodoObjetivo[]) => {
    nodos.sort((a, b) => a.orden - b.orden || a.creadoEn.localeCompare(b.creadoEn));
    for (const n of nodos) ordena(n.hijos);
  };
  ordena(raices);

  return raices;
}

export interface Progreso {
  hojas: number;
  cumplidas: number;
  /** Entre 0 y 1. Un objetivo sin desglose vale 0 o 1. */
  fraccion: number;
}

/**
 * Avance de un objetivo: cuantas de sus hojas estan cumplidas.
 *
 * Se cuentan hojas y no hijos directos para que un desglose de diez pasos pese
 * mas que uno de dos, que es la verdad de lo que falta.
 */
export function progreso(nodo: NodoObjetivo): Progreso {
  if (nodo.hijos.length === 0) {
    const cumplidas = nodo.completadoEn ? 1 : 0;
    return { hojas: 1, cumplidas, fraccion: cumplidas };
  }

  let hojas = 0;
  let cumplidas = 0;
  for (const hijo of nodo.hijos) {
    const p = progreso(hijo);
    hojas += p.hojas;
    cumplidas += p.cumplidas;
  }

  return { hojas, cumplidas, fraccion: hojas === 0 ? 0 : cumplidas / hojas };
}

/** Camino desde la raiz hasta el objetivo. Alimenta las migas de la UI. */
export function camino(objetivos: Objetivo[], id: string): Objetivo[] {
  const porId = new Map(objetivos.map((o) => [o.id, o]));
  const ruta: Objetivo[] = [];

  let actual = porId.get(id);
  while (actual && ruta.length <= PROFUNDIDAD_MAX + 1) {
    ruta.unshift(actual);
    actual = actual.padreId ? porId.get(actual.padreId) : undefined;
  }

  return ruta;
}

/** Perfil publico del usuario, espejo de auth.users. */
export interface Perfil {
  id: UsuarioId;
  nombre: string | null;
  avatarUrl: string | null;
  creadoEn: string;
}

/**
 * Cuantos dias lleva un objetivo sin fecha, o sea, en Nunca Jamas.
 * Alimenta a La Sombra: el costo de no decidir cuando.
 */
export function diasEnNuncaJamas(
  objetivo: Pick<Objetivo, 'creadoEn' | 'venceEl'>,
  ahora = new Date(),
): number | null {
  if (objetivo.venceEl) return null;
  const desde = new Date(objetivo.creadoEn).getTime();
  return Math.floor((ahora.getTime() - desde) / 86_400_000);
}
