import { redirect } from 'next/navigation';
import { PruebaApi } from '@/components/PruebaApi';
import { createClienteServidor } from '@/lib/supabase/server';

// Depende de la sesión del usuario: nunca se prerenderiza en build.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'El Mapa — No Soy Peter Pan' };

export default async function Mapa() {
  const supabase = await createClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // El middleware ya protege esta ruta; esto cubre el caso de carrera.
  if (!user) redirect('/entrar?siguiente=/mapa');

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <header className="flex items-center justify-between border-b border-linea pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">El Mapa</h1>
          <p className="mt-1 text-sm text-humo">{user.email}</p>
        </div>
        <form action="/auth/salir" method="post">
          <button
            type="submit"
            className="rounded-full border border-linea px-5 py-2 text-sm font-medium text-humo transition-colors hover:border-tinta hover:text-tinta"
          >
            Salir
          </button>
        </form>
      </header>

      <main className="flex-1 space-y-12 py-10">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Tu Norte</h2>
          <p className="mt-4 text-lg">
            Todavía no defines hacia dónde vas. Sin Norte no hay Rutas, y sin Rutas las Misiones
            serían solo checklists.
          </p>
          <p className="mt-2 text-sm text-humo">
            Definir el Norte es el siguiente paso del producto.
          </p>
        </section>

        <section className="border-t border-linea pt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
            Diagnóstico
          </h2>
          <div className="mt-4">
            <PruebaApi />
          </div>
        </section>
      </main>
    </div>
  );
}
