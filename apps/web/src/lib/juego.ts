import type { Categoria, Objetivo, Voto } from '@nspp/shared';
import { createClienteServidor } from '@/lib/supabase/server';

/** Filas crudas: snake_case, como viven en Postgres. */
type FilaObjetivo = {
  id: string;
  usuario_id: string;
  padre_id: string | null;
  categoria_id: string;
  suelto: boolean;
  titulo: string;
  detalle: string | null;
  vence_el: string | null;
  completado_en: string | null;
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

export type Juego = {
  usuarioId: string;
  objetivos: Objetivo[];
  categorias: Categoria[];
  votos: Voto[];
  /** votos_por_nivel por categoria. Sin entrada vale el valor por defecto. */
  metas: Record<string, number>;
};

/**
 * Todo lo que necesita cualquier pantalla, en una sola carga.
 *
 * El arbol de una persona son decenas de filas: traerlo entero sale mas barato
 * que pedir un nivel por pantalla, y deja el progreso calculado en memoria sin
 * un solo contador que mantener sincronizado.
 */
export async function cargaJuego(): Promise<Juego | null> {
  const supabase = await createClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [objetivos, categorias, votos, metas] = await Promise.all([
    supabase.from('objetivos').select('*').order('orden').returns<FilaObjetivo[]>(),
    supabase.from('categorias').select('*').order('orden').returns<Categoria[]>(),
    supabase.from('votos').select('*').returns<FilaVoto[]>(),
    supabase
      .from('metas_categoria')
      .select('categoria_id, votos_por_nivel')
      .returns<{ categoria_id: string; votos_por_nivel: number }[]>(),
  ]);

  return {
    usuarioId: user.id,
    objetivos: (objetivos.data ?? []).map(aObjetivo),
    categorias: categorias.data ?? [],
    votos: (votos.data ?? []).map(aVoto),
    metas: Object.fromEntries((metas.data ?? []).map((m) => [m.categoria_id, m.votos_por_nivel])),
  };
}

function aObjetivo(f: FilaObjetivo): Objetivo {
  return {
    id: f.id,
    usuarioId: f.usuario_id,
    padreId: f.padre_id,
    categoriaId: f.categoria_id,
    suelto: f.suelto,
    titulo: f.titulo,
    detalle: f.detalle,
    venceEl: f.vence_el,
    completadoEn: f.completado_en,
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
