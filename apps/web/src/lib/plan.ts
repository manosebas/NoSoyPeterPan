import type { PeriodoSuscripcion, Plan } from '@nspp/shared';
import { createClienteServidor } from '@/lib/supabase/server';

type FilaPlan = {
  id: string;
  nombre: string;
  descripcion: string;
  precio_usd: number | string;
  presupuesto_usd: number | string;
  activo: boolean;
};

type FilaPeriodo = {
  plan_id: string;
  precio_usd: number | string;
  presupuesto_usd: number | string;
  consumido_usd: number | string;
  inicia_el: string;
  termina_el: string;
};

export type EstadoPlan = {
  /** El plan con el que cuenta hoy. Sin periodo vigente, el gratuito. */
  actual: Plan | null;
  /** El mes en curso, si tiene uno. Sin el no hay consumo que mostrar. */
  periodo: PeriodoSuscripcion | null;
  /** Lo que se ofrece: los planes activos, del mas barato al mas caro. */
  ofrecidos: Plan[];
};

/**
 * Plan y periodo vigente de quien tiene la sesion. RLS ya filtra: la vista
 * solo devuelve sus propias filas.
 *
 * Devuelve null si las tablas no responden, por ejemplo en un ambiente donde
 * todavia no se aplico la migracion 0010. Ajustes no se cae por eso.
 */
export async function cargaPlan(): Promise<EstadoPlan | null> {
  const supabase = await createClienteServidor();

  const [planes, periodo] = await Promise.all([
    supabase
      .from('planes')
      .select('id, nombre, descripcion, precio_usd, presupuesto_usd, activo')
      .order('precio_usd')
      .order('presupuesto_usd')
      .returns<FilaPlan[]>(),
    supabase
      .from('suscripciones_estado')
      .select('plan_id, precio_usd, presupuesto_usd, consumido_usd, inicia_el, termina_el')
      .eq('estado', 'activa')
      .maybeSingle<FilaPeriodo>(),
  ]);

  if (planes.error || periodo.error) return null;

  const todos = planes.data.map(aPlan);
  const vigente = periodo.data ? aPeriodo(periodo.data) : null;
  const actual =
    todos.find((p) => p.id === vigente?.planId) ??
    todos.find((p) => p.activo && p.presupuestoUsd === 0 && p.precioUsd === 0) ??
    null;

  return { actual, periodo: vigente, ofrecidos: todos.filter((p) => p.activo) };
}

// PostgREST puede devolver `numeric` como texto para no perder precision.
function aPlan(f: FilaPlan): Plan {
  return {
    id: f.id,
    nombre: f.nombre,
    descripcion: f.descripcion,
    precioUsd: Number(f.precio_usd),
    presupuestoUsd: Number(f.presupuesto_usd),
    activo: f.activo,
  };
}

function aPeriodo(f: FilaPeriodo): PeriodoSuscripcion {
  return {
    planId: f.plan_id,
    precioUsd: Number(f.precio_usd),
    presupuestoUsd: Number(f.presupuesto_usd),
    consumidoUsd: Number(f.consumido_usd),
    iniciaEl: f.inicia_el,
    terminaEl: f.termina_el,
  };
}
