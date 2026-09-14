import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { FormularioAjustes } from '@/components/FormularioAjustes';
import { FormularioPerfil } from '@/components/FormularioPerfil';
import { MetasCategoria } from '@/components/app/MetasCategoria';
import { PanelAjustes, type SeccionAjustes } from '@/components/app/PanelAjustes';
import { Pagina } from '@/components/Pagina';
import { PlazosPorDefecto } from '@/components/app/PlazosPorDefecto';
import { SeccionPlan } from '@/components/app/SeccionPlan';
import { cargaDatos } from '@/lib/datos';
import { iniciales, nombreVisible, obtenerSesionConPerfil } from '@/lib/perfil';
import { cargaPlan, restanteIA } from '@/lib/plan';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Ajustes — No Soy Peter Pan' };

export default async function AjustesPagina() {
  const [sesion, datos, plan] = await Promise.all([
    obtenerSesionConPerfil(),
    cargaDatos(),
    cargaPlan(),
  ]);
  if (!sesion || !datos) redirect('/entrar?siguiente=/ajustes');

  const nombre = nombreVisible(sesion.perfil, sesion.email);

  // La primera seccion es la que nace abierta en escritorio.
  const secciones: SeccionAjustes[] = [
    {
      id: 'plan',
      nombre: 'Plan',
      resumen: plan?.actual ? `Tienes ${plan.actual.nombre}.` : 'Tu plan y los que hay.',
      medidor: plan?.actual
        ? { etiqueta: 'Uso de IA restante', porcentaje: restanteIA(plan) }
        : undefined,
      contenido: <SeccionPlan estado={plan} />,
    },
    {
      id: 'nivel',
      nombre: 'Qué tan alto apuntas',
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
            <PlazosPorDefecto usuarioId={datos.usuarioId} plazos={datos.plazos} />
          </div>

          <p className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-humo">
            Cuántos votos llenan cada rama
          </p>
          <p className="mt-2 text-sm text-humo">
            Al gimnasio se va todos los días; de trabajo no se cambia todos los días.
          </p>
          <div className="mt-3">
            <MetasCategoria
              usuarioId={datos.usuarioId}
              categorias={datos.categorias}
              metas={datos.metas}
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

          <div className="mt-8 border-t border-linea pt-8">
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
    <Pagina fija>
      <Cabecera sesion={sesion} />

      <main className="flex min-h-0 flex-1 flex-col pt-8">
        <h1 className="shrink-0 text-2xl font-bold tracking-tight">Ajustes</h1>

        <div className="mt-6 min-h-0 flex-1">
          <PanelAjustes secciones={secciones} />
        </div>
      </main>
    </Pagina>
  );
}
