import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { FormularioAjustes } from '@/components/FormularioAjustes';
import { MetasCategoria } from '@/components/juego/MetasCategoria';
import { PruebaApi } from '@/components/PruebaApi';
import { cargaJuego } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Ajustes — No Soy Peter Pan' };

export default async function AjustesPagina() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/ajustes');

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="mb-10 mt-1 text-sm text-humo">Cómo entras y cómo crece cada rama.</p>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
            Cómo sube tu barra
          </h2>
          <p className="mt-3 text-sm text-humo">
            Cuántos objetivos cumplidos llenan la barra de una rama y la suben de nivel. Al
            gimnasio se va todos los días; de trabajo no se cambia todos los días.
          </p>
          <div className="mt-4">
            <MetasCategoria
              usuarioId={juego.usuarioId}
              categorias={juego.categorias}
              metas={juego.metas}
            />
          </div>
        </section>

        <section className="mt-12 border-t border-linea pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Tu cuenta</h2>
          <div className="mt-6">
            <FormularioAjustes emailActual={sesion.email ?? ''} />
          </div>
        </section>

        <section className="mt-12 border-t border-linea pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
            Diagnóstico
          </h2>
          <p className="mt-4 font-mono text-xs text-humo">
            {process.env.VERCEL_ENV ?? 'sin ambiente'} ·{' '}
            {process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'sin commit'}
          </p>
          <div className="mt-4">
            <PruebaApi />
          </div>
        </section>

        <section className="mt-12 border-t border-linea pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Sesión</h2>
          <form action="/auth/salir" method="post" className="mt-4">
            <button
              type="submit"
              className="rounded-full border border-linea px-6 py-3 text-sm font-semibold text-humo transition-colors hover:border-tinta hover:text-tinta"
            >
              Salir
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
