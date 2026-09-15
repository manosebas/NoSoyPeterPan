'use client';

import { mensajeError } from '@/lib/errores';
import { createClienteNavegador } from '@/lib/supabase/client';

/**
 * Escrituras de la app. Viven en el navegador y confian en RLS: la base
 * rechaza lo que no es tuyo, y los triggers cuidan las reglas del arbol.
 */

export type NuevoObjetivo = {
  usuarioId: string;
  padreId: string | null;
  categoriaId: string;
  titulo: string;
  /** Opcional. Vacio entra como `null`: una cadena vacia no es un detalle. */
  detalle: string;
  venceEl: string | null;
};

/** Devuelve el id del objetivo creado, para poder ir a su pagina. */
export async function creaObjetivo(nuevo: NuevoObjetivo): Promise<string> {
  const supabase = createClienteNavegador();

  // Lo nuevo entra al final de sus hermanos. Con `orden = 0` fijo quedaria
  // arriba de todo en cuanto alguien haya reordenado esa lista.
  const hermanos = supabase
    .from('objetivos')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1);
  const { data: ultimo } = await (nuevo.padreId
    ? hermanos.eq('padre_id', nuevo.padreId)
    : hermanos.is('padre_id', null)
  ).maybeSingle<{ orden: number }>();

  const { data, error } = await supabase
    .from('objetivos')
    .insert({
      usuario_id: nuevo.usuarioId,
      padre_id: nuevo.padreId,
      categoria_id: nuevo.categoriaId,
      titulo: nuevo.titulo.trim(),
      detalle: nuevo.detalle.trim() || null,
      vence_el: nuevo.venceEl,
      orden: (ultimo?.orden ?? -1) + 1,
    })
    .select('id')
    .single<{ id: string }>();
  if (error) throw error;
  return data.id;
}

export type PasoNuevo = {
  /** Generado en el navegador: los hijos necesitan el id del padre antes de guardar. */
  id: string;
  padreId: string;
  titulo: string;
  detalle: string;
  venceEl: string | null;
  /** Posicion entre sus hermanos. */
  orden: number;
};

/**
 * Guarda un desglose entero en un solo insert. Un insert de varias filas es
 * atomico: entra todo o nada, sin arboles a medias. Los padres deben venir
 * antes que sus hijos, porque el trigger de validacion busca al padre.
 */
export async function creaDesglose(
  usuarioId: string,
  categoriaId: string,
  pasos: PasoNuevo[],
): Promise<void> {
  if (pasos.length === 0) return;
  const supabase = createClienteNavegador();
  const { error } = await supabase.from('objetivos').insert(
    pasos.map((p) => ({
      id: p.id,
      usuario_id: usuarioId,
      padre_id: p.padreId,
      categoria_id: categoriaId,
      titulo: p.titulo.trim(),
      detalle: p.detalle.trim() || null,
      vence_el: p.venceEl,
      orden: p.orden,
    })),
  );
  if (error) throw error;
}

/** Marcar emite el voto por trigger; desmarcar no se lo lleva. */
export async function marcaObjetivo(id: string, cumplido: boolean): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase
    .from('objetivos')
    .update({ completado_en: cumplido ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) throw error;
}

export async function actualizaObjetivo(
  id: string,
  campos: { titulo?: string; venceEl?: string | null; categoriaId?: string; detalle?: string | null },
): Promise<void> {
  const supabase = createClienteNavegador();
  const fila: Record<string, unknown> = {};
  if (campos.titulo !== undefined) fila.titulo = campos.titulo.trim();
  if (campos.venceEl !== undefined) fila.vence_el = campos.venceEl;
  if (campos.categoriaId !== undefined) fila.categoria_id = campos.categoriaId;
  if (campos.detalle !== undefined) fila.detalle = campos.detalle;

  const { error } = await supabase.from('objetivos').update(fila).eq('id', id);
  if (error) throw error;
}

/**
 * Deja a los hermanos en el orden dado. Se reescribe la lista entera y no un
 * intercambio de dos: los objetivos nacen todos con `orden = 0`, y cambiar un
 * cero por otro cero no mueve nada.
 */
export async function ordenaHermanos(ids: string[]): Promise<void> {
  const supabase = createClienteNavegador();
  const resultados = await Promise.all(
    ids.map((id, orden) => supabase.from('objetivos').update({ orden }).eq('id', id)),
  );
  const fallo = resultados.find((r) => r.error);
  if (fallo?.error) throw fallo.error;
}

/** Se lleva el desglose completo: lo dice `on delete cascade`. */
export async function borraObjetivo(id: string): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase.from('objetivos').delete().eq('id', id);
  if (error) throw error;
}

/** Un to-do del dia. Sin rama y sin fecha: no construye nada, solo estorba. */
export async function creaPendiente(usuarioId: string, titulo: string): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase
    .from('pendientes')
    .insert({ usuario_id: usuarioId, titulo: titulo.trim() });
  if (error) throw error;
}

/** Marcar un to-do es borrarlo: no deja historia porque no la merece. */
export async function borraPendiente(id: string): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase.from('pendientes').delete().eq('id', id);
  if (error) throw error;
}

/** "Hoy no": el paso sale del foco hasta `hasta`. En modo elegir, tambien de la eleccion. */
export async function pospone(id: string, hasta: string, hoy: string): Promise<void> {
  const supabase = createClienteNavegador();
  const [objetivo, foco] = await Promise.all([
    supabase.from('objetivos').update({ pospuesto_hasta: hasta }).eq('id', id),
    supabase.from('foco').delete().eq('objetivo_id', id).eq('fecha', hoy),
  ]);
  if (objetivo.error) throw objetivo.error;
  if (foco.error) throw foco.error;
}

/** Modo elegir: suma pasos al foco de un dia. */
export async function eligeFoco(usuarioId: string, ids: string[], fecha: string): Promise<void> {
  if (ids.length === 0) return;
  const supabase = createClienteNavegador();
  const { error } = await supabase
    .from('foco')
    .upsert(
      ids.map((objetivo_id) => ({ objetivo_id, fecha, usuario_id: usuarioId })),
      { onConflict: 'objetivo_id,fecha', ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function creaHabito(usuarioId: string, titulo: string): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase
    .from('habitos')
    .insert({ usuario_id: usuarioId, titulo: titulo.trim() });
  if (error) throw error;
}

export async function borraHabito(id: string): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase.from('habitos').delete().eq('id', id);
  if (error) throw error;
}

/** Marcar un habito guarda el dia; desmarcarlo lo borra. */
export async function marcaHabito(
  usuarioId: string,
  habitoId: string,
  fecha: string,
  hecho: boolean,
): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = hecho
    ? await supabase
        .from('habitos_hechos')
        .upsert(
          { habito_id: habitoId, fecha, usuario_id: usuarioId },
          { onConflict: 'habito_id,fecha', ignoreDuplicates: true },
        )
    : await supabase.from('habitos_hechos').delete().eq('habito_id', habitoId).eq('fecha', fecha);
  if (error) throw error;
}

export async function guardaFoco(
  usuarioId: string,
  foco: { pasosPorDia: number; modo: 'automatico' | 'elegir' },
): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase
    .from('preferencias')
    .upsert(
      { usuario_id: usuarioId, pasos_por_dia: foco.pasosPorDia, modo_foco: foco.modo },
      { onConflict: 'usuario_id' },
    );
  if (error) throw error;
}

export async function guardaPlazos(
  usuarioId: string,
  dias: { largo: number; mediano: number; corto: number },
): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase.from('preferencias').upsert(
    {
      usuario_id: usuarioId,
      dias_largo: dias.largo,
      dias_mediano: dias.mediano,
      dias_corto: dias.corto,
    },
    { onConflict: 'usuario_id' },
  );
  if (error) throw error;
}

export async function guardaMeta(
  usuarioId: string,
  categoriaId: string,
  votosPorNivel: number,
): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase
    .from('metas_categoria')
    .upsert(
      { usuario_id: usuarioId, categoria_id: categoriaId, votos_por_nivel: votosPorNivel },
      { onConflict: 'usuario_id,categoria_id' },
    );
  if (error) throw error;
}

export { mensajeError };
