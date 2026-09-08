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

/**
 * Las ramas de la vida. Viven en la tabla de catalogo `categorias`, no en el
 * codigo: agregar una es una fila, no un despliegue.
 */
export interface Categoria {
  id: string;
  nombre: string;
  color: string;
  orden: number;
}

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
  /** Se hereda del padre al crear. Cambiarla mueve el objetivo de rama. */
  categoriaId: string;
  /** Objetivo del dia sin arbol. Solo puede ser true en una raiz. */
  suelto: boolean;
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
 * Los plazos del juego. `semana` dura siempre siete dias; los otros tres los
 * ajusta cada persona en Ajustes, porque largo plazo no significa lo mismo
 * para todos.
 */
export const PLAZOS = [
  { clave: 'largo', etiqueta: 'Largo plazo' },
  { clave: 'mediano', etiqueta: 'Mediano plazo' },
  { clave: 'corto', etiqueta: 'Corto plazo' },
  { clave: 'semana', etiqueta: 'Esta semana' },
] as const;

export type Plazo = (typeof PLAZOS)[number]['clave'];

/** Los tres que se configuran. `semana` no: una semana son siete dias. */
export type PlazoConfigurable = 'largo' | 'mediano' | 'corto';
export type DiasPlazo = Record<PlazoConfigurable, number>;

export const DIAS_SEMANA = 7;
export const DIAS_PLAZO_DEFECTO: DiasPlazo = { largo: 1095, mediano: 365, corto: 90 };

/** Cuantos dias dura un plazo para esta persona. */
export function diasDe(plazo: Plazo, dias: DiasPlazo = DIAS_PLAZO_DEFECTO): number {
  return plazo === 'semana' ? DIAS_SEMANA : dias[plazo];
}

/** Mientras mas abajo en el arbol, mas cerca la fecha que se propone. */
export function plazoPorDefecto(profundidad: number): Plazo {
  if (profundidad <= 0) return 'largo';
  if (profundidad === 1) return 'mediano';
  if (profundidad === 2) return 'corto';
  return 'semana';
}

/** Fecha propuesta, en formato `YYYY-MM-DD` para la columna `date`. */
export function fechaDePlazo(
  plazo: Plazo,
  dias: DiasPlazo = DIAS_PLAZO_DEFECTO,
  hoy = new Date(),
): string {
  const fecha = new Date(hoy.getTime() + diasDe(plazo, dias) * 86_400_000);
  return fecha.toISOString().slice(0, 10);
}

export type LecturaPlazo = 'sin_fecha' | 'vencido' | Plazo;

/** Como se lee una fecha ya guardada: el plazo se deduce, no se clasifica. */
export function leePlazo(
  venceEl: string | null,
  dias: DiasPlazo = DIAS_PLAZO_DEFECTO,
  hoy = new Date(),
): LecturaPlazo {
  if (!venceEl) return 'sin_fecha';

  const faltan = Math.ceil(
    (new Date(`${venceEl}T00:00:00Z`).getTime() - hoy.getTime()) / 86_400_000,
  );
  if (faltan < 0) return 'vencido';
  if (faltan <= DIAS_SEMANA) return 'semana';
  if (faltan <= dias.corto) return 'corto';
  if (faltan <= dias.mediano) return 'mediano';
  return 'largo';
}

/** Cuanto dura un plazo, dicho como lo diria una persona: "3 anos", "90 dias". */
export function textoDuracion(plazo: Plazo, dias: DiasPlazo = DIAS_PLAZO_DEFECTO): string {
  const total = diasDe(plazo, dias);

  if (total >= 365 && total % 365 === 0) {
    const anos = total / 365;
    return anos === 1 ? '1 año' : `${anos} años`;
  }
  if (total >= 60) {
    const meses = Math.round(total / 30);
    return total % 30 === 0 && meses > 1 ? `${meses} meses` : `${total} días`;
  }
  return total === 1 ? '1 día' : `${total} días`;
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

/**
 * Un voto: un objetivo cumplido. Es la unidad de progreso del juego.
 * No se borra al desmarcar ni al borrar el objetivo: lo que ya creciste, creció.
 */
export interface Voto {
  id: string;
  usuarioId: UsuarioId;
  objetivoId: string | null;
  categoriaId: string;
  titulo: string;
  emitidoEn: string;
}

/** Cuantos votos llenan la barra de una rama. Se edita en Ajustes. */
export const VOTOS_POR_NIVEL_DEFECTO = 30;

export interface Fuerza {
  /** Votos de por vida en la rama. Nunca baja. */
  total: number;
  /** Empieza en 1 y sube cada vez que la barra se llena. */
  nivel: number;
  /** Votos dentro del nivel actual y cuantos faltan para el siguiente. */
  enNivel: number;
  meta: number;
  /** Entre 0 y 1: lo que se pinta en la barra. */
  fraccion: number;
  /** Votos en los ultimos 30 dias. Dice si la rama esta viva, no si creciste. */
  recientes: number;
  /** Dias desde el ultimo voto. null si nunca hubo uno. */
  diasQuieta: number | null;
}

/**
 * Fuerza de una rama a partir de sus votos.
 *
 * La barra empieza en cero, sube con cada objetivo cumplido y al llenarse pasa
 * de nivel y vuelve a empezar. No es un porcentaje de completado a proposito:
 * asi proponerse cosas nuevas nunca te debilita.
 */
export function fuerzaDeRama(
  votos: Pick<Voto, 'emitidoEn'>[],
  meta = VOTOS_POR_NIVEL_DEFECTO,
  ahora = new Date(),
): Fuerza {
  const porNivel = Math.max(1, meta);
  const total = votos.length;

  let recientes = 0;
  let ultimo = 0;
  for (const v of votos) {
    const cuando = new Date(v.emitidoEn).getTime();
    if (ahora.getTime() - cuando <= 30 * 86_400_000) recientes += 1;
    if (cuando > ultimo) ultimo = cuando;
  }

  const enNivel = total % porNivel;

  return {
    total,
    nivel: Math.floor(total / porNivel) + 1,
    enNivel,
    meta: porNivel,
    fraccion: enNivel / porNivel,
    recientes,
    diasQuieta: ultimo === 0 ? null : Math.floor((ahora.getTime() - ultimo) / 86_400_000),
  };
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
