import type { Habito } from '@nspp/shared';
import { createClienteServidor } from '@/lib/supabase/server';

export type DatosHoy = {
  habitos: Habito[];
  /** Modo elegir: los pasos escogidos para hoy. Vacio si todavia no eligio. */
  elegidos: Set<string>;
};

/**
 * Lo que solo usa la pantalla Hoy: habitos y el foco elegido del dia. Vive
 * aparte de `cargaDatos` para no cargarlo en cada pantalla.
 *
 * Si las tablas no responden (la migracion 0012 sin aplicar), Hoy sigue en
 * pie sin habitos ni eleccion.
 */
export async function cargaHoy(hoy: string): Promise<DatosHoy> {
  const supabase = await createClienteServidor();

  const [habitos, hechos, foco] = await Promise.all([
    supabase
      .from('habitos')
      .select('id, titulo')
      .order('creado_en')
      .returns<{ id: string; titulo: string }[]>(),
    supabase
      .from('habitos_hechos')
      .select('habito_id')
      .eq('fecha', hoy)
      .returns<{ habito_id: string }[]>(),
    supabase.from('foco').select('objetivo_id').eq('fecha', hoy).returns<{ objetivo_id: string }[]>(),
  ]);

  const hechosHoy = new Set((hechos.data ?? []).map((h) => h.habito_id));

  return {
    habitos: (habitos.data ?? []).map((h) => ({
      id: h.id,
      titulo: h.titulo,
      hechoHoy: hechosHoy.has(h.id),
    })),
    elegidos: new Set((foco.data ?? []).map((f) => f.objetivo_id)),
  };
}
