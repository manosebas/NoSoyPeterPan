import { construyeArbol, fuerzaDeRama, progreso, VOTOS_POR_NIVEL_DEFECTO } from '@nspp/shared';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { Barra } from '@/components/juego/Barra';
import { textoActividad } from '@/lib/formato';
import { cargaJuego } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Tus ramas — No Soy Peter Pan' };

export default async function Ramas() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/ramas');

  const arbol = construyeArbol(juego.objetivos);

  const ramas = juego.categorias.map((categoria) => {
    const meta = juego.metas[categoria.id] ?? VOTOS_POR_NIVEL_DEFECTO;
    const propios = juego.objetivos.filter((o) => o.categoriaId === categoria.id);
    const pendientes = propios.filter((o) => !o.completadoEn).length;

    return {
      categoria,
      meta,
      pendientes,
      fuerza: fuerzaDeRama(
        juego.votos.filter((v) => v.categoriaId === categoria.id),
        meta,
      ),
      // Cuanto avance acumulan sus arboles ahora mismo, que es otra cosa que la
      // fuerza: esto sube y baja, la fuerza solo sube.
      abiertos: arbol.filter((r) => r.categoriaId === categoria.id).length,
    };
  });

  const vivas = ramas.filter((r) => r.fuerza.total > 0 || r.pendientes > 0);
  const dormidas = ramas.filter((r) => r.fuerza.total === 0 && r.pendientes === 0);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 py-8">
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Tus ramas</h1>
        <p className="mt-1 text-sm text-humo">
          Cada objetivo cumplido es un voto. La barra sube y no baja: esto no mide lo que te falta,
          mide lo que ya construiste.
        </p>

        {vivas.length === 0 ? (
          <p className="mt-8 text-lg">
            Ninguna rama tiene votos todavía. El primero se emite marcando algo en{' '}
            <Link href="/hoy" className="underline underline-offset-4">
              Hoy
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-8 space-y-8">
            {vivas.map(({ categoria, fuerza, meta, pendientes }) => (
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
                  {pendientes > 0 && (
                    <>
                      <span aria-hidden>·</span>
                      <span>
                        {pendientes} {pendientes === 1 ? 'objetivo abierto' : 'objetivos abiertos'}
                      </span>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
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

        <p className="mt-12 text-xs text-humo">
          ¿Cuántos votos llenan tu barra? Se ajusta rama por rama en{' '}
          <Link href="/ajustes" className="underline underline-offset-4">
            Ajustes
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
