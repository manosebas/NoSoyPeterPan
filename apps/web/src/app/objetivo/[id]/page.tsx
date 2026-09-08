import { camino, construyeArbol, progreso, type NodoObjetivo } from '@nspp/shared';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { AjustesObjetivo } from '@/components/juego/AjustesObjetivo';
import { Barra } from '@/components/juego/Barra';
import { Casilla } from '@/components/juego/Casilla';
import { FilaObjetivo } from '@/components/juego/FilaObjetivo';
import { NuevoObjetivo } from '@/components/juego/NuevoObjetivo';
import { textoFecha } from '@/lib/formato';
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

  const migas = camino(juego.objetivos, id).slice(0, -1);
  const padre = juego.objetivos.find((o) => o.id === nodo.padreId) ?? null;
  const volverA = padre ? `/objetivo/${padre.id}` : '/mapa';

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 py-8">
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        {/* Las migas son la respuesta permanente a "por que estoy haciendo esto". */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-humo">
          <Link href="/mapa" className="transition-colors hover:text-tinta">
            {categoria?.nombre ?? 'Mapa'}
          </Link>
          {migas.map((m) => (
            <span key={m.id} className="flex items-center gap-1.5">
              <span aria-hidden>›</span>
              <Link href={`/objetivo/${m.id}`} className="transition-colors hover:text-tinta">
                {m.titulo}
              </Link>
            </span>
          ))}
        </nav>

        <div className="mt-4 flex items-start gap-3">
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
            className={`text-2xl font-bold tracking-tight ${
              nodo.completadoEn ? 'text-humo line-through' : ''
            }`}
          >
            {nodo.titulo}
          </h1>
        </div>

        <p className="mt-2 flex items-center gap-2 text-sm text-humo">
          <span className={nodo.venceEl === null ? 'italic' : ''}>{textoFecha(nodo.venceEl)}</span>
          <span aria-hidden>·</span>
          <span>{categoria?.nombre}</span>
          {nodo.suelto && (
            <>
              <span aria-hidden>·</span>
              <span>del día</span>
            </>
          )}
        </p>

        {!hoja && (
          <div className="mt-6">
            <Barra fraccion={avance.fraccion} color={color} />
            <p className="mt-2 text-sm text-humo">
              {avance.cumplidas} de {avance.hojas} pasos · {Math.round(avance.fraccion * 100)}%
            </p>
          </div>
        )}

        {nodo.hijos.length > 0 && (
          <ul className="mt-8">
            {nodo.hijos.map((hijo) => (
              <FilaObjetivo key={hijo.id} nodo={hijo} categoria={categorias.get(hijo.categoriaId)} />
            ))}
          </ul>
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
              etiqueta={hoja ? 'partir esto en pasos' : 'otro paso'}
            />
          ) : (
            <p className="text-sm text-humo">
              Seis niveles bastan. Esto ya es algo que puedes hacer hoy.
            </p>
          )}
        </div>

        <div className="mt-10 border-t border-linea pt-6">
          <AjustesObjetivo
            id={nodo.id}
            categoriaId={nodo.categoriaId}
            venceEl={nodo.venceEl}
            padreVenceEl={padre?.venceEl ?? null}
            tieneHijos={!hoja}
            categorias={juego.categorias}
            volverA={volverA}
          />
        </div>
      </main>
    </div>
  );
}
