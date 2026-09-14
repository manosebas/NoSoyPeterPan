import type { Plan } from '@nspp/shared';
import { Barra } from '@/components/app/Barra';
import type { EstadoPlan } from '@/lib/plan';

const FECHA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' });

function precio(plan: Plan): string {
  if (plan.precioUsd === 0) return 'Gratis';
  const monto = Number.isInteger(plan.precioUsd) ? plan.precioUsd : plan.precioUsd.toFixed(2);
  return `$${monto} / mes`;
}

/**
 * Tu plan y los que hay. Todo sale de la tabla `planes`: agregar uno alli lo
 * muestra aqui sin tocar codigo.
 *
 * El consumo de IA se muestra en porcentaje y no en dolares: a nadie le sirve
 * saber que lleva $0.37, si que le queda la mitad del mes.
 */
export function SeccionPlan({ estado }: { estado: EstadoPlan | null }) {
  if (!estado?.actual) {
    return <p className="text-sm text-humo">Los planes todavía no están disponibles.</p>;
  }

  const { actual, periodo, ofrecidos } = estado;
  const otros = ofrecidos.filter((p) => p.id !== actual.id);
  const conIA = actual.presupuestoUsd > 0;

  const usado =
    periodo && periodo.presupuestoUsd > 0 ? periodo.consumidoUsd / periodo.presupuestoUsd : 0;
  const queda = Math.max(0, Math.round((1 - usado) * 100));

  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-humo">Tu plan</p>

      <div className="mt-3 rounded-xl border border-tinta p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-lg font-semibold tracking-tight">{actual.nombre}</p>
          <p className="text-sm text-humo">{precio(actual)}</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-humo">{actual.descripcion}</p>

        {conIA && periodo ? (
          <div className="mt-5 border-t border-linea pt-4">
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-medium">IA este mes</span>
              <span className="text-humo">Te queda el {queda}%</span>
            </div>
            <div className="mt-2">
              <Barra fraccion={usado} color="var(--color-tinta)" alto="h-1.5" />
            </div>
            <p className="mt-2 text-xs text-humo">
              El mes cierra el {FECHA.format(new Date(`${periodo.terminaEl}T00:00:00`))}.
            </p>
          </div>
        ) : (
          !conIA && <p className="mt-4 text-xs text-humo">Sin asistencia de IA.</p>
        )}
      </div>

      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-humo">Planes</p>

      {otros.length === 0 ? (
        <p className="mt-3 text-sm text-humo">Por ahora no hay otros planes.</p>
      ) : (
        <ul className="mt-3 grid gap-3 lg:grid-cols-2">
          {otros.map((plan) => {
            const mejora =
              plan.precioUsd > actual.precioUsd || plan.presupuestoUsd > actual.presupuestoUsd;

            return (
              <li key={plan.id} className="flex flex-col rounded-xl border border-linea p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-semibold tracking-tight">{plan.nombre}</p>
                  <p className="text-sm text-humo">{precio(plan)}</p>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-humo">{plan.descripcion}</p>
                <p className="mt-3 text-xs text-humo">
                  {plan.presupuestoUsd > 0 ? 'Incluye IA' : 'Sin IA'}
                </p>

                {/* Todavia no hay pagos: el boton existe para ver el flujo, no cobra. */}
                {mejora && (
                  <button
                    type="button"
                    className="mt-4 self-start rounded-full bg-tinta px-5 py-2 text-xs font-semibold text-papel transition-opacity hover:opacity-80"
                  >
                    Mejorar a {plan.nombre}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
