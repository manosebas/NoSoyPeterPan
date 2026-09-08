import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { FormularioAjustes } from '@/components/FormularioAjustes';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Ajustes — No Soy Peter Pan' };

export default async function AjustesPagina() {
  const sesion = await obtenerSesionConPerfil();
  if (!sesion) redirect('/entrar?siguiente=/ajustes');

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <Cabecera sesion={sesion} titulo="Ajustes" />

      <main className="flex-1 py-10">
        <p className="mb-10 text-humo">Cómo entras. Lo demás vive en tu perfil.</p>

        <FormularioAjustes emailActual={sesion.email ?? ''} />

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
