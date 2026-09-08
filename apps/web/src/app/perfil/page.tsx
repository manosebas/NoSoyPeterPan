import { fuerzaDeRama, VOTOS_POR_NIVEL_DEFECTO } from '@nspp/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { Barra } from '@/components/juego/Barra';
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
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 py-8">
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-linea bg-white text-lg font-semibold text-humo">
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
              {juego.votos.length} {juego.votos.length === 1 ? 'voto' : 'votos'} por la persona que
              quieres ser
            </p>
          </div>
        </div>

        {vivas.length === 0 ? (
          <p className="mt-10 text-lg">
            Tus ramas están en cero. La primera fortaleza aparece cuando marcas algo en{' '}
            <Link href="/hoy" className="underline underline-offset-4">
              Hoy
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="mt-10 text-sm text-humo">
              Esto no mide lo que te falta. Mide lo que ya construiste, y no baja.
            </p>

            <ul className="mt-6 space-y-7">
              {vivas.map(({ categoria, fuerza, meta, abiertos }) => (
                <li key={categoria.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-base font-semibold" style={{ color: categoria.color }}>
                      {categoria.nombre}
                    </h2>
                    <span className="text-xs text-humo">
                      Nivel {fuerza.nivel} · {fuerza.total} {fuerza.total === 1 ? 'voto' : 'votos'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <Barra fraccion={fuerza.fraccion} color={categoria.color} />
                  </div>

                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-humo">
                    <span>
                      {fuerza.enNivel} de {meta} para el nivel {fuerza.nivel + 1}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{textoActividad(fuerza.diasQuieta)}</span>
                    {abiertos > 0 && (
                      <>
                        <span aria-hidden>·</span>
                        <span>
                          {abiertos} {abiertos === 1 ? 'objetivo abierto' : 'objetivos abiertos'}
                        </span>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}

        {ultimos.length > 0 && (
          <section className="mt-12 border-t border-linea pt-8">
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
          <section className="mt-12 border-t border-linea pt-8">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
              Sin tocar
            </h2>
            <p className="mt-3 text-sm text-humo">
              {dormidas.map((r) => r.categoria.nombre).join(' · ')}
            </p>
            <p className="mt-2 text-xs text-humo">
              No todas las ramas tienen que crecer a la vez. Pero conviene saber cuáles llevan años
              esperando.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
