import { construyeArbol } from '@nspp/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { ElegirFoco } from '@/components/app/ElegirFoco';
import { Habitos } from '@/components/app/Habitos';
import { HoyNo } from '@/components/app/HoyNo';
import { Pendientes } from '@/components/app/Pendientes';
import { TarjetaHoy } from '@/components/app/TarjetaHoy';
import { Pagina } from '@/components/Pagina';
import { cargaDatos, hoyISO, porId } from '@/lib/datos';
import { armaFoco, manana as diaSiguiente, type Linea } from '@/lib/foco';
import { textoDia } from '@/lib/formato';
import { cargaHoy } from '@/lib/hoy';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Hoy — No Soy Peter Pan' };

const FECHA = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * Hoy no muestra todo lo que vence pronto: muestra lo vencido y el foco del
 * dia, el siguiente paso de cada objetivo hasta llenar un cupo. Asi siempre hay
 * algo que hacer, nunca demasiado, y al terminar manana hay mas. Las reglas
 * viven en `lib/foco.ts`.
 */
export default async function Hoy({
  searchParams,
}: {
  searchParams: Promise<{ mas?: string; elegir?: string }>;
}) {
  const hoy = hoyISO();
  const [sesion, datos, datosHoy, parametros] = await Promise.all([
    obtenerSesionConPerfil(),
    cargaDatos(),
    cargaHoy(hoy),
    searchParams,
  ]);
  if (!sesion || !datos) redirect('/entrar?siguiente=/hoy');

  const { pasosPorDia, modo } = datos.foco;
  // "Dame otro" en modo automatico: cuantos pasos de mas se pidieron hoy.
  const extra = Math.max(0, Math.min(20, Number(parametros.mas) || 0));
  const categorias = porId(datos.categorias);

  const foco = armaFoco({
    raices: construyeArbol(datos.objetivos),
    votos: datos.votos,
    hoy,
    pasosPorDia,
    modo,
    elegidos: datosHoy.elegidos,
    extra,
  });

  const manana = diaSiguiente(hoy);
  const porHacer = foco.vencidos.length + foco.enFoco.length;
  const eligio = datosHoy.elegidos.size > 0;
  // En modo elegir se elige al entrar, si queda cupo, o al pedir otro.
  const tocaElegir =
    modo === 'elegir' &&
    foco.candidatos.length > 0 &&
    (parametros.elegir === '1' || (!eligio && foco.cupoLibre > 0));
  const focoListo = !tocaElegir && foco.enFoco.length === 0;

  function tarjeta(linea: Linea, tipo: 'vencido' | 'foco' | 'hecho') {
    return (
      <TarjetaHoy
        key={linea.nodo.id}
        nodo={linea.nodo}
        categoria={categorias.get(linea.nodo.categoriaId)}
        camino={linea.camino}
        fecha={tipo === 'hecho' ? 'hecho hoy · un voto' : textoDia(linea.nodo.venceEl, hoy)}
        urgente={tipo === 'vencido'}
        accion={
          tipo === 'foco' ? <HoyNo id={linea.nodo.id} hoy={hoy} manana={manana} /> : undefined
        }
      />
    );
  }

  return (
    <Pagina>
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Hoy</h1>
        <p className="mt-1 text-sm text-humo first-letter:uppercase">{FECHA.format(new Date())}</p>

        {/* Lo que construye a la izquierda; lo que solo estorba, a un lado. */}
        <div className="mt-10 grid min-w-0 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
              De tus objetivos
            </h2>

            {datos.objetivos.length === 0 ? (
              <div className="mt-4 rounded-xl border border-linea bg-white p-6">
                <p className="text-lg">Todavía no le dijiste a nadie hacia dónde vas.</p>
                <p className="mt-2 text-sm text-humo">
                  Escribe el primero de tus objetivos grandes. Después lo partimos hasta que quepa
                  en un martes cualquiera.
                </p>
                <Link
                  href="/mapa"
                  className="mt-5 inline-block rounded-full bg-tinta px-6 py-3 text-sm font-semibold text-papel transition-opacity hover:opacity-80"
                >
                  Empezar el mapa
                </Link>
              </div>
            ) : (
              <>
                <p className="mt-2 text-xs text-humo">
                  {porHacer > 0
                    ? `${porHacer} ${porHacer === 1 ? 'paso' : 'pasos'} para hoy. Cada uno vale un voto.`
                    : foco.hechosHoy.length > 0
                      ? 'Tu día está hecho. Cada paso fue un voto.'
                      : 'Nada pendiente por ahora.'}
                </p>

                {/* Lo vencido va primero, en color y sin "Hoy no": esconderlo
                    seria maquillar el atraso (regla 7). Ocupa cupo del dia. */}
                {foco.vencidos.length > 0 && (
                  <div className="mt-6">
                    <Bloque etiqueta="Vencido" cuenta={foco.vencidos.length} acento />
                    <div className="mt-3 space-y-3">
                      {foco.vencidos.map((l) => tarjeta(l, 'vencido'))}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <Bloque etiqueta="Tu foco" cuenta={foco.hechosHoy.length + foco.enFoco.length} />

                  {tocaElegir && (
                    <div className="mt-3">
                      <ElegirFoco
                        usuarioId={datos.usuarioId}
                        hoy={hoy}
                        candidatos={foco.candidatos}
                        cupo={eligio ? Math.min(3, foco.candidatos.length) : foco.cupoLibre}
                        categorias={Object.fromEntries(categorias)}
                        sumando={eligio}
                      />
                    </div>
                  )}

                  {(foco.enFoco.length > 0 || foco.hechosHoy.length > 0) && (
                    <div className="mt-3 space-y-3">
                      {foco.enFoco.map((l) => tarjeta(l, 'foco'))}
                      {foco.hechosHoy.map((l) => tarjeta(l, 'hecho'))}
                    </div>
                  )}

                  {focoListo && (
                    <div className="mt-3 rounded-xl border border-dashed border-linea p-4 text-sm text-humo">
                      {foco.vencidos.length >= pasosPorDia && foco.candidatos.length > 0 ? (
                        <p>Lo vencido llena tu día. Ponte al día y vuelven los pasos nuevos.</p>
                      ) : foco.candidatos.length > 0 ? (
                        <>
                          <p>Tu foco de hoy está cumplido. Mañana hay más.</p>
                          <Link
                            href={modo === 'elegir' ? '/hoy?elegir=1' : `/hoy?mas=${extra + 1}`}
                            className="mt-2 inline-block text-tinta underline underline-offset-4"
                          >
                            Dame otro
                          </Link>
                        </>
                      ) : (
                        <>
                          <p>
                            No hay pasos con fecha para avanzar. Entra a un objetivo y ponle fecha a
                            su siguiente paso.
                          </p>
                          <Link
                            href="/mapa"
                            className="mt-2 inline-block text-tinta underline underline-offset-4"
                          >
                            Ver el mapa
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          <aside className="min-w-0 space-y-10 border-t border-linea pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
                Hábitos
              </h2>
              <p className="mt-2 text-xs text-humo">Lo que haces cada día. Mañana vuelve sin marcar.</p>
              <div className="mt-4">
                <Habitos usuarioId={datos.usuarioId} hoy={hoy} habitos={datosHoy.habitos} />
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">To-do</h2>
              <p className="mt-2 text-xs text-humo">
                Lo que hay que hacer y no construye nada: sacar la basura, pagar la luz. No tiene
                rama ni cuenta como voto, y al marcarlo desaparece.
              </p>
              <div className="mt-4">
                <Pendientes usuarioId={datos.usuarioId} pendientes={datos.pendientes} />
              </div>
            </section>
          </aside>
        </div>
      </main>
    </Pagina>
  );
}

function Bloque({
  etiqueta,
  cuenta,
  acento = false,
}: {
  etiqueta: string;
  cuenta: number;
  acento?: boolean;
}) {
  return (
    <h3
      className={`text-xs font-semibold uppercase tracking-[0.2em] ${
        acento ? 'text-red-600' : 'text-humo'
      }`}
    >
      {etiqueta} · {cuenta}
    </h3>
  );
}
