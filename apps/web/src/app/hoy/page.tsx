import { construyeArbol, type NodoObjetivo } from '@nspp/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { FilaObjetivo } from '@/components/juego/FilaObjetivo';
import { Pendientes } from '@/components/juego/Pendientes';
import { Pagina } from '@/components/Pagina';
import { cargaJuego, hoyISO, porId } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Hoy — No Soy Peter Pan' };

const FECHA = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * Que del arbol toca hoy: las hojas que vencen hoy o antes, y las que se
 * marcaron hoy, para verlas tachadas antes de que desaparezcan manana.
 */
function tocaHoy(nodo: NodoObjetivo, hoy: string): boolean {
  if (nodo.hijos.length > 0) return false;
  if (nodo.completadoEn) return nodo.completadoEn.slice(0, 10) === hoy;
  return nodo.venceEl !== null && nodo.venceEl <= hoy;
}

/** Recorre el arbol juntando lo de hoy, con el objetivo grande del que cuelga. */
function recolecta(nodos: NodoObjetivo[], hoy: string, raiz: string | null = null) {
  const salida: { nodo: NodoObjetivo; contexto: string | null }[] = [];

  for (const nodo of nodos) {
    if (tocaHoy(nodo, hoy)) salida.push({ nodo, contexto: raiz });
    salida.push(...recolecta(nodo.hijos, hoy, raiz ?? nodo.titulo));
  }

  return salida;
}

export default async function Hoy() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/hoy');

  const hoy = hoyISO();
  const categorias = porId(juego.categorias);
  const lineas = recolecta(construyeArbol(juego.objetivos), hoy);
  const pendientes = lineas.filter((l) => !l.nodo.completadoEn).length;

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

            {lineas.length === 0 ? (
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
                      Nada de tus objetivos vence hoy. Si quieres avanzar igual, entra a uno y
                      pártelo en un paso que quepa en esta tarde.
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

                <ul className="mt-3">
                  {lineas.map(({ nodo, contexto }) => (
                    <FilaObjetivo
                      key={nodo.id}
                      nodo={nodo}
                      categoria={categorias.get(nodo.categoriaId)}
                      contexto={contexto ?? undefined}
                      dias={juego.plazos}
                    />
                  ))}
                </ul>
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
