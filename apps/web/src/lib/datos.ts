import {
  DIAS_PLAZO_DEFECTO,
  PASOS_POR_DIA_DEFECTO,
  type Categoria,
  type DiasPlazo,
  type ModoFoco,
  type Objetivo,
  type Pendiente,
  type Voto,
} from '@nspp/shared';
import { createClienteServidor } from '@/lib/supabase/server';

/** Filas crudas: snake_case, como viven en Postgres. */
type FilaObjetivo = {
  id: string;
  usuario_id: string;
  padre_id: string | null;
  categoria_id: string;
  titulo: string;
  detalle: string | null;
  vence_el: string | null;
  completado_en: string | null;
  pospuesto_hasta: string | null;
  orden: number;
  profundidad: number;
  creado_en: string;
};

type FilaVoto = {
  id: string;
  usuario_id: string;
  objetivo_id: string | null;
  categoria_id: string;
  titulo: string;
  emitido_en: string;
};

export type Datos = {
  usuarioId: string;
  objetivos: Objetivo[];
  categorias: Categoria[];
  votos: Voto[];
  /** Los to-do del dia. Sin rama, sin fecha, sin voto. */
  pendientes: Pendiente[];
  /** votos_por_nivel por categoria. Sin entrada vale el valor por defecto. */
  metas: Record<string, number>;
  /** Cuanto dura cada plazo para esta persona. */
  plazos: DiasPlazo;
  /** Cuantos pasos entran al foco de Hoy y como se eligen. */
  foco: { pasosPorDia: number; modo: ModoFoco };
};

/**
 * Todo lo que necesita cualquier pantalla, en una sola carga.
 *
 * El arbol de una persona son decenas de filas: traerlo entero sale mas barato
 * que pedir un nivel por pantalla, y deja el progreso calculado en memoria sin
 * un solo contador que mantener sincronizado.
 */
export async function cargaDatos(): Promise<Datos | null> {
  const supabase = await createClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [objetivos, categorias, votos, metas, preferencias, pendientes] = await Promise.all([
    supabase.from('objetivos').select('*').order('orden').returns<FilaObjetivo[]>(),
    supabase.from('categorias').select('*').order('orden').returns<Categoria[]>(),
    supabase.from('votos').select('*').returns<FilaVoto[]>(),
    supabase
      .from('metas_categoria')
      .select('categoria_id, votos_por_nivel')
      .returns<{ categoria_id: string; votos_por_nivel: number }[]>(),
    supabase
      .from('preferencias')
      .select('dias_largo, dias_mediano, dias_corto, pasos_por_dia, modo_foco')
      .maybeSingle<{
        dias_largo: number;
        dias_mediano: number;
        dias_corto: number;
        pasos_por_dia: number;
        modo_foco: ModoFoco;
      }>(),
    supabase
      .from('pendientes')
      .select('id, usuario_id, titulo, creado_en')
      .order('creado_en')
      .returns<{ id: string; usuario_id: string; titulo: string; creado_en: string }[]>(),
  ]);

  return {
    usuarioId: user.id,
    objetivos: (objetivos.data ?? []).map(aObjetivo),
    categorias: categorias.data ?? [],
    votos: (votos.data ?? []).map(aVoto),
    pendientes: (pendientes.data ?? []).map((p) => ({
      id: p.id,
      usuarioId: p.usuario_id,
      titulo: p.titulo,
      creadoEn: p.creado_en,
    })),
    metas: Object.fromEntries((metas.data ?? []).map((m) => [m.categoria_id, m.votos_por_nivel])),
    plazos: preferencias.data
      ? {
          largo: preferencias.data.dias_largo,
          mediano: preferencias.data.dias_mediano,
          corto: preferencias.data.dias_corto,
        }
      : DIAS_PLAZO_DEFECTO,
    foco: {
      pasosPorDia: preferencias.data?.pasos_por_dia ?? PASOS_POR_DIA_DEFECTO,
      modo: preferencias.data?.modo_foco ?? 'automatico',
    },
  };
}

function aObjetivo(f: FilaObjetivo): Objetivo {
  return {
    id: f.id,
    usuarioId: f.usuario_id,
    padreId: f.padre_id,
    categoriaId: f.categoria_id,
    titulo: f.titulo,
    detalle: f.detalle,
    venceEl: f.vence_el,
    completadoEn: f.completado_en,
    pospuestoHasta: f.pospuesto_hasta,
    orden: f.orden,
    profundidad: f.profundidad,
    creadoEn: f.creado_en,
  };
}

function aVoto(f: FilaVoto): Voto {
  return {
    id: f.id,
    usuarioId: f.usuario_id,
    objetivoId: f.objetivo_id,
    categoriaId: f.categoria_id,
    titulo: f.titulo,
    emitidoEn: f.emitido_en,
  };
}

/** Indice de categorias por id, que es como las consulta la UI. */
export function porId(categorias: Categoria[]): Map<string, Categoria> {
  return new Map(categorias.map((c) => [c.id, c]));
}

/** Fecha de hoy en formato `YYYY-MM-DD`, que es como se guarda `vence_el`. */
export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}
