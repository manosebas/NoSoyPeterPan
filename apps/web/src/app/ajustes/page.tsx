import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { FormularioAjustes } from '@/components/FormularioAjustes';
import { FormularioPerfil } from '@/components/FormularioPerfil';
import { MetasCategoria } from '@/components/juego/MetasCategoria';
import { PanelAjustes, type SeccionAjustes } from '@/components/juego/PanelAjustes';
import { PlazosPorDefecto } from '@/components/juego/PlazosPorDefecto';
import { cargaJuego } from '@/lib/juego';
import { iniciales, nombreVisible, obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Ajustes — No Soy Peter Pan' };

export default async function AjustesPagina() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/ajustes');

  const nombre = nombreVisible(sesion.perfil, sesion.email);

  const secciones: SeccionAjustes[] = [
    {
      id: 'nivel',
      nombre: 'En qué nivel juegas la vida',
      resumen: 'Cuánto dura cada plazo y cuánto cuesta subir una rama.',
      contenido: (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-humo">
            Cuánto dura cada plazo
          </p>
          <p className="mt-2 text-sm text-humo">
            Largo plazo no significa lo mismo para todos. Cambiarlo no mueve ninguna fecha ya
            escrita.
          </p>
          <div className="mt-3">
            <PlazosPorDefecto usuarioId={juego.usuarioId} plazos={juego.plazos} />
          </div>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-humo">
            Cuántos votos llenan cada rama
          </p>
          <p className="mt-2 text-sm text-humo">
            Al gimnasio se va todos los días; de trabajo no se cambia todos los días.
          </p>
          <div className="mt-3">
            <MetasCategoria
              usuarioId={juego.usuarioId}
              categorias={juego.categorias}
              metas={juego.metas}
            />
          </div>
        </>
      ),
    },
    {
      id: 'perfil',
      nombre: 'Perfil',
      resumen: 'Tu foto, tu nombre y cómo entras.',
      contenido: (
        <>
          <FormularioPerfil
            usuarioId={sesion.usuarioId}
            nombreInicial={sesion.perfil?.nombre ?? ''}
            avatarInicial={sesion.perfil?.avatarUrl ?? null}
            iniciales={iniciales(nombre)}
          />

          <div className="mt-12 border-t border-linea pt-10">
            <FormularioAjustes emailActual={sesion.email ?? ''} />
          </div>
        </>
      ),
    },
    {
      id: 'salir',
      nombre: 'Salir',
      resumen: 'Cerrar la sesión en este navegador.',
      contenido: (
        <>
          <p className="text-sm text-humo">
            Tu Norte, tus ramas y tus votos siguen aquí cuando vuelvas.
          </p>
          <form action="/auth/salir" method="post" className="mt-6">
            <button
              type="submit"
              className="rounded-full border border-linea px-6 py-3 text-sm font-semibold text-humo transition-colors hover:border-tinta hover:text-tinta"
            >
              Cerrar sesión
            </button>
          </form>
        </>
      ),
    },
  ];

  return (
    // Altura fija y sin scroll de pagina: lo unico que se desplaza es la
    // seccion abierta, y solo si su contenido no cabe.
    <div className="mx-auto flex h-dvh max-w-3xl flex-col overflow-hidden px-6 py-8">
      <Cabecera sesion={sesion} />

      <main className="flex min-h-0 flex-1 flex-col pt-8">
        <h1 className="shrink-0 text-2xl font-bold tracking-tight">Ajustes</h1>

        <div className="mt-6 min-h-0 flex-1">
          <PanelAjustes secciones={secciones} />
        </div>
      </main>
    </div>
  );
}
