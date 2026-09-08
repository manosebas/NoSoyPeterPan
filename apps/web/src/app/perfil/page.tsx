import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { FormularioPerfil } from '@/components/FormularioPerfil';
import { iniciales, nombreVisible, obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Tu perfil — No Soy Peter Pan' };

export default async function PerfilPagina() {
  const sesion = await obtenerSesionConPerfil();
  if (!sesion) redirect('/entrar?siguiente=/perfil');

  const nombre = nombreVisible(sesion.perfil, sesion.email);

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-10">
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <h1 className="text-2xl font-bold tracking-tight">Tu perfil</h1>
        <p className="mb-10 mt-1 text-sm text-humo">Quién eres aquí. Tu cara y tu nombre, nada más.</p>

        <FormularioPerfil
          usuarioId={sesion.usuarioId}
          nombreInicial={sesion.perfil?.nombre ?? ''}
          avatarInicial={sesion.perfil?.avatarUrl ?? null}
          iniciales={iniciales(nombre)}
        />

        <section className="mt-12 border-t border-linea pt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Correo</h2>
          <p className="mt-3 text-sm">{sesion.email ?? '—'}</p>
          <p className="mt-2 text-sm text-humo">
            Se cambia en <a className="underline" href="/ajustes">Ajustes</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
