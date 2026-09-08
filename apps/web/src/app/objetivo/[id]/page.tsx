import {
  camino,
  construyeArbol,
  leePlazo,
  progreso,
  textoDuracion,
  type NodoObjetivo,
} from '@nspp/shared';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { AjustesObjetivo } from '@/components/juego/AjustesObjetivo';
import { Barra } from '@/components/juego/Barra';
import { Casilla } from '@/components/juego/Casilla';
import { FilaObjetivo } from '@/components/juego/FilaObjetivo';
import { NuevoObjetivo } from '@/components/juego/NuevoObjetivo';
import { Pagina } from '@/components/Pagina';
import { NOMBRE_PLAZO, textoFecha } from '@/lib/formato';
import { cargaJuego, porId } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Objetivo — No Soy Peter Pan' };

function buscar(nodos: NodoObjetivo[], id: string): NodoObjetivo | null {
  for (const nodo of nodos) {
    if (nodo.id === id) return nodo;
    const encontrado = buscar(nodo.hijos, id);
    if (encontrado) return encontrado;
  }
  return null;
}

export default async function Objetivo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect(`/entrar?siguiente=/objetivo/${id}`);

  const nodo = buscar(construyeArbol(juego.objetivos), id);
  if (!nodo) notFound();

  const categorias = porId(juego.categorias);
  const categoria = categorias.get(nodo.categoriaId);
  const color = categoria?.color ?? '#71717a';
  const avance = progreso(nodo);
  const hoja = nodo.hijos.length === 0;

  const lectura = leePlazo(nodo.venceEl, juego.plazos);
  const migas = camino(juego.objetivos, id).slice(0, -1);
  const padre = juego.objetivos.find((o) => o.id === nodo.padreId) ?? null;
  const volverA = padre ? `/objetivo/${padre.id}` : '/mapa';

  return (
    <Pagina>
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <Link
          href="/mapa"
          className="inline-flex items-center gap-1.5 text-xs text-humo transition-colors hover:text-tinta"
        >
          <span aria-hidden>←</span> Volver al mapa
        </Link>

        {/* Las migas son la respuesta permanente a "por que estoy haciendo esto". */}
        <nav className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-humo">
          <span style={{ color }}>{categoria?.nombre}</span>
          {migas.map((m) => (
            <span key={m.id} className="flex items-center gap-1.5">
              <span aria-hidden>›</span>
              <Link href={`/objetivo/${m.id}`} className="transition-colors hover:text-tinta">
                {m.titulo}
              </Link>
            </span>
          ))}
        </nav>

        <div className="mt-3 flex items-start gap-3">
          {hoja && (
            <div className="pt-2">
              <Casilla
                id={nodo.id}
                cumplido={nodo.completadoEn !== null}
                color={color}
                etiqueta={`Marcar ${nodo.titulo}`}
              />
            </div>
          )}

          <h1
            className={`flex-1 text-2xl font-bold tracking-tight ${
              nodo.completadoEn ? 'text-humo line-through' : ''
            }`}
          >
            {nodo.titulo}
          </h1>

          <div className="shrink-0 pt-0.5">
            <AjustesObjetivo
              id={nodo.id}
              categoriaId={nodo.categoriaId}
              venceEl={nodo.venceEl}
              padreVenceEl={padre?.venceEl ?? null}
              tieneHijos={!hoja}
              categorias={juego.categorias}
              dias={juego.plazos}
              volverA={volverA}
            />
          </div>
        </div>

        {/* El desglose manda; la ficha del objetivo acompana a un lado. */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          <section>
            {nodo.hijos.length > 0 ? (
              <>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
                  Su desglose
                </h2>
                <ul className="mt-2">
                  {nodo.hijos.map((hijo) => (
                    <FilaObjetivo
                      key={hijo.id}
                      nodo={hijo}
                      categoria={categorias.get(hijo.categoriaId)}
                      dias={juego.plazos}
                    />
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-humo">
                Sin desglose. Tal como está, se marca de una vez; si no cabe en un día, pártelo.
              </p>
            )}

            <div className="mt-6">
              {nodo.profundidad < 5 ? (
                <NuevoObjetivo
                  usuarioId={juego.usuarioId}
                  padreId={nodo.id}
                  padreVenceEl={nodo.venceEl}
                  categoriaHeredada={nodo.categoriaId}
                  categorias={juego.categorias}
                  profundidad={nodo.profundidad + 1}
                  dias={juego.plazos}
                  etiqueta={hoja ? 'partir esto en pasos' : 'otro paso'}
                />
              ) : (
                <p className="text-sm text-humo">
                  Seis niveles bastan. Esto ya es algo que puedes hacer hoy.
                </p>
              )}
            </div>
          </section>

          <aside className="border-t border-linea pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {!hoja && (
              <>
                <Barra fraccion={avance.fraccion} color={color} />
                <p className="mt-2 text-sm">
                  {avance.cumplidas} de {avance.hojas} pasos
                  <span className="text-humo"> · {Math.round(avance.fraccion * 100)}%</span>
                </p>
              </>
            )}

            <dl className={`space-y-3 text-sm ${hoja ? '' : 'mt-6 border-t border-linea pt-6'}`}>
              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-humo">Para cuándo</dt>
                <dd className={nodo.venceEl === null ? 'italic text-humo' : ''}>
                  {textoFecha(nodo.venceEl, juego.plazos)}
                </dd>
              </div>

              {lectura !== 'sin_fecha' && lectura !== 'vencido' && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-humo">Plazo</dt>
                  <dd>
                    {NOMBRE_PLAZO[lectura]}
                    <span className="text-humo"> · {textoDuracion(lectura, juego.plazos)}</span>
                  </dd>
                </div>
              )}

              <div>
                <dt className="text-xs uppercase tracking-[0.16em] text-humo">Rama</dt>
                <dd style={{ color }}>{categoria?.nombre}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </main>
    </Pagina>
  );
}
