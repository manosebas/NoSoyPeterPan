import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { FormularioAjustes } from '@/components/FormularioAjustes';
import { FormularioPerfil } from '@/components/FormularioPerfil';
import { MetasCategoria } from '@/components/juego/MetasCategoria';
import { PlazosPorDefecto } from '@/components/juego/PlazosPorDefecto';
import { cargaJuego } from '@/lib/juego';
import { iniciales, nombreVisible, obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Ajustes — No Soy Peter Pan' };

export default async function AjustesPagina() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/ajustes');

  const nombre = nombreVisible(sesion.perfil, sesion.email);

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-6 py-8">
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
            En qué nivel juegas la vida
          </h2>
          <p className="mt-3 text-sm text-humo">
            Cuánto dura cada plazo para ti y cuántos objetivos cumplidos hacen crecer una rama. Al
            gimnasio se va todos los días; de trabajo no se cambia todos los días.
          </p>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-humo">
            Cuánto dura cada plazo
          </p>
          <div className="mt-3">
            <PlazosPorDefecto usuarioId={juego.usuarioId} plazos={juego.plazos} />
          </div>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-humo">
            Cuántos votos llenan cada rama
          </p>
          <div className="mt-3">
            <MetasCategoria
              usuarioId={juego.usuarioId}
              categorias={juego.categorias}
              metas={juego.metas}
            />
          </div>
        </section>

        <section className="mt-14 border-t border-linea pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Perfil</h2>
          <p className="mt-3 text-sm text-humo">Tu cara, tu nombre y cómo entras.</p>

          <div className="mt-6">
            <FormularioPerfil
              usuarioId={sesion.usuarioId}
              nombreInicial={sesion.perfil?.nombre ?? ''}
              avatarInicial={sesion.perfil?.avatarUrl ?? null}
              iniciales={iniciales(nombre)}
            />
          </div>

          <div className="mt-12">
            <FormularioAjustes emailActual={sesion.email ?? ''} />
          </div>
        </section>

        <section className="mt-14 border-t border-linea pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Salir</h2>
          <form action="/auth/salir" method="post" className="mt-4">
            <button
              type="submit"
              className="rounded-full border border-linea px-6 py-3 text-sm font-semibold text-humo transition-colors hover:border-tinta hover:text-tinta"
            >
              Cerrar sesión
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
