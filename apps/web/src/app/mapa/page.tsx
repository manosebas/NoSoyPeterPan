import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { PruebaApi } from '@/components/PruebaApi';
import { obtenerSesionConPerfil } from '@/lib/perfil';

// Depende de la sesión del usuario: nunca se prerenderiza en build.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'El Mapa — No Soy Peter Pan' };

export default async function Mapa() {
  const sesion = await obtenerSesionConPerfil();

  // El middleware ya protege esta ruta; esto cubre el caso de carrera.
  if (!sesion) redirect('/entrar?siguiente=/mapa');

  // Vercel expone estas dos en build. Sirven para saber que version estas viendo
  // cuando prod y preview se parecen demasiado.
  const ambiente = process.env.VERCEL_ENV ?? 'sin ambiente';
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'sin commit';

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <Cabecera sesion={sesion} titulo="El Mapa" />

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
          <p className="mt-4 font-mono text-xs text-humo">
            {ambiente} · {commit}
          </p>
          <div className="mt-4">
            <PruebaApi />
          </div>
        </section>
      </main>
    </div>
  );
}
