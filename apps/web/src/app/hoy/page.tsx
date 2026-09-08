import { construyeArbol, type NodoObjetivo } from '@nspp/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { FilaObjetivo } from '@/components/juego/FilaObjetivo';
import { NuevoObjetivo } from '@/components/juego/NuevoObjetivo';
import { cargaJuego, hoyISO, porId } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Hoy — No Soy Peter Pan' };

const FECHA = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' });

/** Hojas que vencen hoy o antes, y las que se marcaron hoy. */
function tocaHoy(nodo: NodoObjetivo, hoy: string): boolean {
  if (nodo.hijos.length > 0) return false;
  if (nodo.completadoEn) return nodo.completadoEn.slice(0, 10) === hoy;
  return nodo.venceEl !== null && nodo.venceEl <= hoy;
}

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
  const arbol = construyeArbol(juego.objetivos);
  const lineas = recolecta(arbol, hoy);

  const sueltos = lineas.filter((l) => l.nodo.suelto);
  const delArbol = lineas.filter((l) => !l.nodo.suelto);
  const pendientes = lineas.filter((l) => !l.nodo.completadoEn).length;

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 py-8">
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Hoy</h1>
        <p className="mt-1 text-sm text-humo first-letter:uppercase">{FECHA.format(new Date())}</p>

        {juego.objetivos.length === 0 ? (
          <div className="mt-10 rounded-xl border border-linea bg-white p-8">
            <p className="text-lg">Todavía no le dijiste a nadie hacia dónde vas.</p>
            <p className="mt-2 text-humo">
              Escribe el primero de tus objetivos grandes. Después lo partimos hasta que quepa en
              un martes cualquiera.
            </p>
            <Link
              href="/mapa"
              className="mt-6 inline-block rounded-full bg-tinta px-6 py-3 text-sm font-semibold text-papel transition-opacity hover:opacity-80"
            >
              Empezar el mapa
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-6 text-sm text-humo">
              {pendientes === 0
                ? 'Nada pendiente para hoy. La espontaneidad también cuenta.'
                : `${pendientes} ${pendientes === 1 ? 'paso' : 'pasos'} para acercarte.`}
            </p>

            {delArbol.length > 0 && (
              <section className="mt-8">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
                  De tus objetivos
                </h2>
                <ul className="mt-2">
                  {delArbol.map(({ nodo, contexto }) => (
                    <FilaObjetivo
                      key={nodo.id}
                      nodo={nodo}
                      categoria={categorias.get(nodo.categoriaId)}
                      contexto={contexto ?? undefined}
                      dias={juego.plazos}
                    />
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-10">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
                Del día
              </h2>
              {sueltos.length > 0 && (
                <ul className="mt-2">
                  {sueltos.map(({ nodo }) => (
                    <FilaObjetivo
                      key={nodo.id}
                      nodo={nodo}
                      categoria={categorias.get(nodo.categoriaId)}
                      dias={juego.plazos}
                    />
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs text-humo">
                Lo que hay que hacer y no construye nada a cinco años. También existe.
              </p>
              <div className="mt-3">
                <NuevoObjetivo
                  usuarioId={juego.usuarioId}
                  padreId={null}
                  categorias={juego.categorias}
                  profundidad={0}
                  dias={juego.plazos}
                  suelto
                  etiqueta="algo de hoy"
                />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
