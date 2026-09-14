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
import { AjustesObjetivo } from '@/components/app/AjustesObjetivo';
import { Barra } from '@/components/app/Barra';
import { Casilla } from '@/components/app/Casilla';
import { FilaObjetivo } from '@/components/app/FilaObjetivo';
import { NuevoObjetivo } from '@/components/app/NuevoObjetivo';
import { Pagina } from '@/components/Pagina';
import { NOMBRE_PLAZO, textoFecha } from '@/lib/formato';
import { cargaDatos, porId } from '@/lib/datos';
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
  const [sesion, datos] = await Promise.all([obtenerSesionConPerfil(), cargaDatos()]);
  if (!sesion || !datos) redirect(`/entrar?siguiente=/objetivo/${id}`);

  const nodo = buscar(construyeArbol(datos.objetivos), id);
  if (!nodo) notFound();

  const categorias = porId(datos.categorias);
  const categoria = categorias.get(nodo.categoriaId);
  const color = categoria?.color ?? '#71717a';
  const avance = progreso(nodo);
  const hoja = nodo.hijos.length === 0;

  const lectura = leePlazo(nodo.venceEl, datos.plazos);
  const migas = camino(datos.objetivos, id).slice(0, -1);
  const padre = datos.objetivos.find((o) => o.id === nodo.padreId) ?? null;
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
            <span key={m.id} className="flex min-w-0 items-center gap-1.5">
              <span aria-hidden>›</span>
              <Link
                href={`/objetivo/${m.id}`}
                className="min-w-0 break-words transition-colors hover:text-tinta"
              >
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
            className={`min-w-0 flex-1 break-words text-2xl font-bold tracking-tight ${
              nodo.completadoEn ? 'text-humo line-through' : ''
            }`}
          >
            {nodo.titulo}
          </h1>

          <div className="shrink-0 pt-0.5">
            <AjustesObjetivo
              id={nodo.id}
              titulo={nodo.titulo}
              categoriaId={nodo.categoriaId}
              detalle={nodo.detalle}
              venceEl={nodo.venceEl}
              padreVenceEl={padre?.venceEl ?? null}
              tieneHijos={!hoja}
              categorias={datos.categorias}
              dias={datos.plazos}
              volverA={volverA}
            />
          </div>
        </div>

        {/* La ficha es informativa y no estorba: una linea chica bajo el titulo.
            La rama no se repite porque ya va en las migas, y en color. */}
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-humo">
          <span className={nodo.venceEl === null ? 'italic' : ''}>
            {textoFecha(nodo.venceEl, datos.plazos)}
          </span>
          {lectura !== 'sin_fecha' && lectura !== 'vencido' && lectura !== 'hoy' && (
            <>
              <span aria-hidden>·</span>
              <span>{NOMBRE_PLAZO[lectura]}</span>
              <span aria-hidden>·</span>
              <span>{textoDuracion(lectura, datos.plazos)}</span>
            </>
          )}
        </p>

        {nodo.detalle && (
          <p className="mt-4 max-w-prose whitespace-pre-line break-words text-sm leading-relaxed text-humo">
            {nodo.detalle}
          </p>
        )}

        {!hoja && (
          <div className="mt-5 max-w-sm">
            <Barra fraccion={avance.fraccion} color={color} />
            <p className="mt-2 text-sm">
              {avance.cumplidas} de {avance.hojas} pasos
              <span className="text-humo"> · {Math.round(avance.fraccion * 100)}%</span>
            </p>
          </div>
        )}

        {/* El desglose manda: se lleva todo el ancho. */}
        <div className="mt-8">
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
                      categorias={categorias}
                      dias={datos.plazos}
                      conVistaPrevia
                      hermanos={nodo.hijos.map((h) => h.id)}
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
                  usuarioId={datos.usuarioId}
                  padreId={nodo.id}
                  padreVenceEl={nodo.venceEl}
                  categoriaHeredada={nodo.categoriaId}
                  categorias={datos.categorias}
                  profundidad={nodo.profundidad + 1}
                  dias={datos.plazos}
                  etiqueta={hoja ? 'partir esto en pasos' : 'otro paso'}
                />
              ) : (
                <p className="text-sm text-humo">
                  Seis niveles bastan. Esto ya es algo que puedes hacer hoy.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </Pagina>
  );
}
