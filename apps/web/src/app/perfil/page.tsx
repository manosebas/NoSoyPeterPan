import { fuerzaDeRama, VOTOS_POR_NIVEL_DEFECTO } from '@nspp/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { Barra } from '@/components/juego/Barra';
import { Pagina } from '@/components/Pagina';
import { textoActividad } from '@/lib/formato';
import { cargaJuego } from '@/lib/juego';
import { iniciales, nombreVisible, obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Tus fortalezas — No Soy Peter Pan' };

const FECHA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });

export default async function Perfil() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/perfil');

  const nombre = nombreVisible(sesion.perfil, sesion.email);

  const ramas = juego.categorias
    .map((categoria) => {
      const meta = juego.metas[categoria.id] ?? VOTOS_POR_NIVEL_DEFECTO;
      return {
        categoria,
        meta,
        fuerza: fuerzaDeRama(
          juego.votos.filter((v) => v.categoriaId === categoria.id),
          meta,
        ),
        abiertos: juego.objetivos.filter((o) => o.categoriaId === categoria.id && !o.completadoEn)
          .length,
      };
    })
    .sort((a, b) => b.fuerza.total - a.fuerza.total || a.categoria.orden - b.categoria.orden);

  const vivas = ramas.filter((r) => r.fuerza.total > 0 || r.abiertos > 0);
  const dormidas = ramas.filter((r) => r.fuerza.total === 0 && r.abiertos === 0);

  const ultimos = [...juego.votos]
    .sort((a, b) => b.emitidoEn.localeCompare(a.emitidoEn))
    .slice(0, 6);

  return (
    <Pagina>
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6 border-b border-linea pb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-linea bg-white text-lg font-semibold text-humo">
              {sesion.perfil?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sesion.perfil.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                iniciales(nombre)
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">{nombre}</h1>
              <p className="mt-1 text-sm text-humo">
                Esto no mide lo que te falta. Mide lo que ya construiste, y no baja.
              </p>
            </div>
          </div>

          <p className="text-sm text-humo">
            <span className="text-2xl font-bold tracking-tight text-tinta">
              {juego.votos.length}
            </span>{' '}
            {juego.votos.length === 1 ? 'voto' : 'votos'} por la persona que quieres ser
          </p>
        </header>

        {vivas.length === 0 ? (
          <p className="mt-10 max-w-xl text-lg">
            Tus ramas están en cero. La primera fortaleza aparece cuando marcas algo en{' '}
            <Link href="/hoy" className="underline underline-offset-4">
              Hoy
            </Link>
            .
          </p>
        ) : (
          // Tarjetas: en dos columnas, el texto suelto no se lee como una rejilla.
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {vivas.map(({ categoria, fuerza, meta, abiertos }) => (
              <li key={categoria.id} className="rounded-xl border border-linea bg-white p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-base font-semibold" style={{ color: categoria.color }}>
                    {categoria.nombre}
                  </h2>
                  <span className="shrink-0 text-xs text-humo">Nivel {fuerza.nivel}</span>
                </div>

                <div className="mt-3">
                  <Barra fraccion={fuerza.fraccion} color={categoria.color} />
                </div>

                <p className="mt-2.5 text-xs text-humo">
                  {fuerza.enNivel} de {meta} para el nivel {fuerza.nivel + 1} ·{' '}
                  {fuerza.total === 1 ? '1 voto' : `${fuerza.total} votos`} en total
                </p>
                <p className="mt-1 text-xs text-humo">
                  {textoActividad(fuerza.diasQuieta)}
                  {abiertos > 0 && (
                    <> · {abiertos === 1 ? '1 objetivo abierto' : `${abiertos} objetivos abiertos`}</>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}

        {(ultimos.length > 0 || dormidas.length > 0) && (
          // Una sola regla para las dos columnas: antes cada seccion traia la
          // suya y quedaban dos rayas cortas a distinta altura.
          <div className="mt-12 grid gap-x-12 gap-y-10 border-t border-linea pt-8 lg:grid-cols-2">
            {ultimos.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
                  Lo último que construiste
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {ultimos.map((voto) => {
                    const categoria = juego.categorias.find((c) => c.id === voto.categoriaId);

                    return (
                      <li key={voto.id} className="flex items-baseline gap-3 text-sm">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: categoria?.color ?? '#71717a' }}
                        />
                        <span className="min-w-0 flex-1 truncate">{voto.titulo}</span>
                        <span className="shrink-0 text-xs text-humo">
                          {FECHA.format(new Date(voto.emitidoEn))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {dormidas.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
                  Sin tocar
                </h2>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {dormidas.map((r) => (
                    <li
                      key={r.categoria.id}
                      className="flex items-center gap-1.5 rounded-full border border-linea px-3 py-1 text-xs text-humo"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: r.categoria.color }}
                      />
                      {r.categoria.nombre}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-humo">
                  No todas las ramas tienen que crecer a la vez. Pero conviene saber cuáles llevan
                  años esperando.
                </p>
              </section>
            )}
          </div>
        )}
      </main>
    </Pagina>
  );
}
