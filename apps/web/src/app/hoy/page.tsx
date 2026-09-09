import { construyeArbol, fechaDePlazo, type NodoObjetivo, type Objetivo } from '@nspp/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { HacerHoy } from '@/components/juego/HacerHoy';
import { Pendientes } from '@/components/juego/Pendientes';
import { TarjetaHoy } from '@/components/juego/TarjetaHoy';
import { Pagina } from '@/components/Pagina';
import { textoDia } from '@/lib/formato';
import { cargaJuego, hoyISO, porId } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Hoy — No Soy Peter Pan' };

const FECHA = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

/** En que bloque de Hoy cae una hoja, o en ninguno. */
type Grupo = 'vencido' | 'hoy' | 'semana';

/** Una hoja con el camino que explica por que esta ahi. */
type Linea = { nodo: NodoObjetivo; camino: Objetivo[]; grupo: Grupo };

/**
 * Solo entran hojas: un objetivo con desglose se cumple cuando se cumplen sus
 * pasos, no a mano. Lo sin fecha no entra nunca; eso es Nunca Jamas y vive en
 * el Mapa. Lo marcado hoy se queda hasta manana, para verlo tachado.
 */
function clasifica(nodo: NodoObjetivo, hoy: string, finSemana: string): Grupo | null {
  if (nodo.hijos.length > 0) return null;
  if (nodo.completadoEn) return nodo.completadoEn.slice(0, 10) === hoy ? 'hoy' : null;
  if (nodo.venceEl === null) return null;

  if (nodo.venceEl < hoy) return 'vencido';
  if (nodo.venceEl === hoy) return 'hoy';
  return nodo.venceEl <= finSemana ? 'semana' : null;
}

/** Recorre el arbol juntando lo que toca, con sus ancestros a cuestas. */
function recolecta(
  nodos: NodoObjetivo[],
  hoy: string,
  finSemana: string,
  ancestros: Objetivo[] = [],
): Linea[] {
  const salida: Linea[] = [];

  for (const nodo of nodos) {
    const grupo = clasifica(nodo, hoy, finSemana);
    if (grupo) salida.push({ nodo, camino: ancestros, grupo });
    salida.push(...recolecta(nodo.hijos, hoy, finSemana, [...ancestros, nodo]));
  }

  return salida;
}

/** Lo viejo primero, y lo ya hecho al final: deja de pedir nada. */
function ordena(lineas: Linea[]): Linea[] {
  return [...lineas].sort((a, b) => {
    const hechoA = a.nodo.completadoEn ? 1 : 0;
    const hechoB = b.nodo.completadoEn ? 1 : 0;
    if (hechoA !== hechoB) return hechoA - hechoB;
    return (a.nodo.venceEl ?? '').localeCompare(b.nodo.venceEl ?? '');
  });
}

export default async function Hoy() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/hoy');

  const hoy = hoyISO();
  const finSemana = fechaDePlazo('semana', juego.plazos);
  const categorias = porId(juego.categorias);

  const lineas = recolecta(construyeArbol(juego.objetivos), hoy, finSemana);
  const vencidas = ordena(lineas.filter((l) => l.grupo === 'vencido'));
  const deHoy = ordena(lineas.filter((l) => l.grupo === 'hoy'));
  const deSemana = ordena(lineas.filter((l) => l.grupo === 'semana'));

  // Lo que la semana trae no se cuenta como deuda de hoy: todavia no vence.
  const pendientes = [...vencidas, ...deHoy].filter((l) => !l.nodo.completadoEn).length;
  const vacio = lineas.length === 0;

  function tarjeta(linea: Linea, urgente = false, conCasilla = true, traible = false) {
    return (
      <TarjetaHoy
        key={linea.nodo.id}
        nodo={linea.nodo}
        categoria={categorias.get(linea.nodo.categoriaId)}
        camino={linea.camino}
        fecha={linea.nodo.completadoEn ? 'hecho hoy · un voto' : textoDia(linea.nodo.venceEl, hoy)}
        urgente={urgente && !linea.nodo.completadoEn}
        conCasilla={conCasilla}
        accion={traible ? <HacerHoy id={linea.nodo.id} hoy={hoy} /> : undefined}
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
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
              De tus objetivos
            </h2>

            {vacio ? (
              <div className="mt-4 rounded-xl border border-linea bg-white p-6">
                {juego.objetivos.length === 0 ? (
                  <>
                    <p className="text-lg">Todavía no le dijiste a nadie hacia dónde vas.</p>
                    <p className="mt-2 text-sm text-humo">
                      Escribe el primero de tus objetivos grandes. Después lo partimos hasta que
                      quepa en un martes cualquiera.
                    </p>
                    <Link
                      href="/mapa"
                      className="mt-5 inline-block rounded-full bg-tinta px-6 py-3 text-sm font-semibold text-papel transition-opacity hover:opacity-80"
                    >
                      Empezar el mapa
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-humo">
                      Nada de tus objetivos vence esta semana. Si quieres avanzar igual, entra a uno
                      y pártelo en un paso que quepa en esta tarde.
                    </p>
                    <Link
                      href="/mapa"
                      className="mt-4 inline-block text-sm underline underline-offset-4"
                    >
                      Ver el mapa
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <>
                <p className="mt-2 text-xs text-humo">
                  {pendientes === 0
                    ? 'Todo lo de hoy está hecho. Cada uno fue un voto.'
                    : `${pendientes} ${pendientes === 1 ? 'paso' : 'pasos'} para acercarte. Cada uno vale un voto.`}
                </p>

                {/* Lo vencido va primero y se dice en color. Esconderlo entre lo
                    de hoy seria maquillar el atraso: regla 7 de CLAUDE.md. */}
                {vencidas.length > 0 && (
                  <div className="mt-6">
                    <Bloque etiqueta="Vencido" cuenta={vencidas.length} acento />
                    <div className="mt-3 space-y-3">{vencidas.map((l) => tarjeta(l, true))}</div>
                  </div>
                )}

                {deHoy.length > 0 && (
                  <div className="mt-8">
                    <Bloque etiqueta="Hoy" cuenta={deHoy.length} />
                    <div className="mt-3 space-y-3">{deHoy.map((l) => tarjeta(l))}</div>
                  </div>
                )}

                {/* Plegado y sin casillas: se mira, no se marca. Si se pudiera
                    marcar desde aqui, Hoy dejaria de ser hoy. */}
                {deSemana.length > 0 && (
                  <details className="mt-8 border-t border-linea pt-4">
                    <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.2em] text-humo transition-colors hover:text-tinta">
                      Esta semana · {deSemana.length}
                    </summary>
                    <p className="mt-2 text-xs text-humo">
                      Todavía no vence. Si lo vas a hacer hoy, tráelo: esperar a que se venza
                      para hacerlo es dejar que el calendario decida por ti.
                    </p>
                    <div className="mt-3 space-y-3">
                      {deSemana.map((l) => tarjeta(l, false, false, true))}
                    </div>
                  </details>
                )}
              </>
            )}
          </section>

          <section className="border-t border-linea pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">To-do</h2>
            <p className="mt-2 text-xs text-humo">
              Lo que hay que hacer y no construye nada: sacar la basura, pagar la luz. No tiene rama
              ni cuenta como voto, y al marcarlo desaparece.
            </p>

            <div className="mt-4">
              <Pendientes usuarioId={juego.usuarioId} pendientes={juego.pendientes} />
            </div>
          </section>
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
