import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Saldo de IA de cada persona. Lee y escribe con service_role: el navegador no
 * tiene permiso sobre `suscripciones`, y asi nadie se regala saldo.
 */

export type Saldo =
  | { estado: 'con_saldo'; restanteUsd: number }
  | { estado: 'sin_plan' }
  | { estado: 'sin_saldo' };

export async function consultaSaldo(admin: SupabaseClient, usuarioId: string): Promise<Saldo> {
  const { data, error } = await admin
    .from('suscripciones_estado')
    .select('presupuesto_usd, restante_usd')
    .eq('usuario_id', usuarioId)
    .eq('estado', 'activa')
    .maybeSingle<{ presupuesto_usd: number | string; restante_usd: number | string }>();

  if (error) throw error;
  // Sin periodo vigente se es Free, y Free no trae IA.
  if (!data || Number(data.presupuesto_usd) <= 0) return { estado: 'sin_plan' };

  const restanteUsd = Number(data.restante_usd);
  return restanteUsd > 0 ? { estado: 'con_saldo', restanteUsd } : { estado: 'sin_saldo' };
}

/** Descuenta lo gastado del periodo vigente. La suma es atomica en la base. */
export async function cobra(admin: SupabaseClient, usuarioId: string, costoUsd: number): Promise<void> {
  if (costoUsd <= 0) return;
  const { error } = await admin.rpc('suma_consumo', { p_usuario: usuarioId, p_costo: costoUsd });
  if (error) throw error;
}
