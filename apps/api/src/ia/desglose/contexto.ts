import {
  DIAS_PLAZO_DEFECTO,
  leePlazo,
  PLAZOS,
  PROFUNDIDAD_MAX,
  textoDuracion,
  type DiasPlazo,
  type LecturaPlazo,
  type Plazo,
} from '@nspp/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Todo lo que la IA necesita saber de un objetivo, leido de la base. La web
 * solo manda el id: el contenido sale de lo guardado y de nadie mas.
 */
export interface ContextoDesglose {
  hoy: string;
  objetivo: {
    titulo: string;
    detalle: string | null;
    rama: string;
    plazo: LecturaPlazo;
    venceEl: string | null;
  };
  /** Titulos desde la raiz hasta el padre del objetivo. */
  camino: string[];
  /** Titulos de los pasos que ya tiene, para no repetirlos. */
  desgloseExistente: string[];
  /** Plazos que caben debajo del objetivo, con lo que duran para esta persona. */
  plazosPermitidos: Array<{ clave: Plazo; duracion: string }>;
  /** Cuantos niveles caben todavia debajo del objetivo. */
  nivelesDisponibles: number;
}

type FilaObjetivo = {
  id: string;
  padre_id: string | null;
  categoria_id: string;
  titulo: string;
  detalle: string | null;
  vence_el: string | null;
  profundidad: number;
};

/** Null si el objetivo no existe o no es de esta persona. */
export async function leeContexto(
  admin: SupabaseClient,
  usuarioId: string,
  objetivoId: string,
): Promise<ContextoDesglose | null> {
  // El arbol entero de una persona son decenas de filas: una consulta alcanza
  // para el objetivo, su camino y sus hijos.
  const [objetivos, categorias, preferencias] = await Promise.all([
    admin
      .from('objetivos')
      .select('id, padre_id, categoria_id, titulo, detalle, vence_el, profundidad')
      .eq('usuario_id', usuarioId)
      .order('orden')
      .returns<FilaObjetivo[]>(),
    admin.from('categorias').select('id, nombre').returns<{ id: string; nombre: string }[]>(),
    admin
      .from('preferencias')
      .select('dias_largo, dias_mediano, dias_corto')
      .eq('usuario_id', usuarioId)
      .maybeSingle<{ dias_largo: number; dias_mediano: number; dias_corto: number }>(),
  ]);

  if (objetivos.error) throw objetivos.error;
  if (categorias.error) throw categorias.error;
  if (preferencias.error) throw preferencias.error;

  const filas = objetivos.data;
  const objetivo = filas.find((o) => o.id === objetivoId);
  if (!objetivo) return null;

  const dias: DiasPlazo = preferencias.data
    ? {
        largo: preferencias.data.dias_largo,
        mediano: preferencias.data.dias_mediano,
        corto: preferencias.data.dias_corto,
      }
    : DIAS_PLAZO_DEFECTO;

  const plazo = leePlazo(objetivo.vence_el, dias);

  return {
    hoy: new Date().toISOString().slice(0, 10),
    objetivo: {
      titulo: objetivo.titulo,
      detalle: objetivo.detalle,
      rama: categorias.data.find((c) => c.id === objetivo.categoria_id)?.nombre ?? objetivo.categoria_id,
      plazo,
      venceEl: objetivo.vence_el,
    },
    camino: caminoHasta(filas, objetivo),
    desgloseExistente: filas.filter((o) => o.padre_id === objetivo.id).map((o) => o.titulo),
    plazosPermitidos: plazosDebajo(plazo).map((clave) => ({
      clave,
      duracion: clave === 'hoy' ? 'hoy' : textoDuracion(clave, dias),
    })),
    nivelesDisponibles: PROFUNDIDAD_MAX - objetivo.profundidad,
  };
}

function caminoHasta(filas: FilaObjetivo[], objetivo: FilaObjetivo): string[] {
  const porId = new Map(filas.map((o) => [o.id, o]));
  const camino: string[] = [];

  let actual = objetivo.padre_id ? porId.get(objetivo.padre_id) : undefined;
  while (actual && camino.length <= PROFUNDIDAD_MAX) {
    camino.unshift(actual.titulo);
    actual = actual.padre_id ? porId.get(actual.padre_id) : undefined;
  }
  return camino;
}

/**
 * Un hijo vence antes o a la vez que su padre, asi que solo caben su mismo
 * plazo y los mas cortos. Sin fecha cabe cualquiera; vencido, solo lo inmediato.
 */
export function plazosDebajo(plazo: LecturaPlazo): Plazo[] {
  const claves = PLAZOS.map((p) => p.clave);
  if (plazo === 'sin_fecha') return claves;
  if (plazo === 'vencido') return ['semana', 'hoy'];
  return claves.slice(claves.indexOf(plazo));
}
