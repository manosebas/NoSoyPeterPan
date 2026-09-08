'use client';

import { mensajeError } from '@/lib/errores';
import { createClienteNavegador } from '@/lib/supabase/client';

/**
 * Escrituras del juego. Viven en el navegador y confian en RLS: la base
 * rechaza lo que no es tuyo, y los triggers cuidan las reglas del arbol.
 */

export type NuevoObjetivo = {
  usuarioId: string;
  padreId: string | null;
  categoriaId: string;
  titulo: string;
  venceEl: string | null;
};

export async function creaObjetivo(nuevo: NuevoObjetivo): Promise<void> {
  const supabase = createClienteNavegador();
  const { error } = await supabase.from('objetivos').insert({
    usuario_id: nuevo.usuarioId,
    padre_id: nuevo.padreId,
    categoria_id: nuevo.categoriaId,
    titulo: nuevo.titulo.trim(),
    vence_el: nuevo.venceEl,
  });
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
