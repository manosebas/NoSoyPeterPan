import { construyeArbol, fuerzaDeRama, VOTOS_POR_NIVEL_DEFECTO } from '@nspp/shared';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { Arbol } from '@/components/juego/Arbol';
import { Barra } from '@/components/juego/Barra';
import { NuevoObjetivo } from '@/components/juego/NuevoObjetivo';
import { cargaJuego, porId } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'El Mapa — No Soy Peter Pan' };

export default async function Mapa() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/mapa');

  const categorias = porId(juego.categorias);
  const arbol = construyeArbol(juego.objetivos);

  // Las raices sueltas viven en Hoy: el mapa es para lo que construye algo.
  const raices = arbol.filter((n) => !n.suelto);

  const ramas = juego.categorias
    .map((categoria) => ({
      categoria,
      raices: raices.filter((r) => r.categoriaId === categoria.id),
      fuerza: fuerzaDeRama(
        juego.votos.filter((v) => v.categoriaId === categoria.id),
        juego.metas[categoria.id] ?? VOTOS_POR_NIVEL_DEFECTO,
      ),
    }))
    .filter((r) => r.raices.length > 0);

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-8">
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <h1 className="text-2xl font-bold tracking-tight">El Mapa</h1>
        <p className="mt-1 text-sm text-humo">
          Todo lo que estás construyendo, de los cinco años hasta el paso de esta semana.
        </p>

        {ramas.length === 0 ? (
          <p className="mt-8 text-lg">
            Aquí va lo que quieres que sea verdad dentro de unos años. Escríbelo sin miedo a que
            suene grande: para eso existe el desglose.
          </p>
        ) : (
          ramas.map(({ categoria, raices: propias, fuerza }) => (
            <section key={categoria.id} className="mt-10 border-t border-linea pt-8 first:border-t-0">
              <div className="flex items-center justify-between gap-4">
                <h2
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{ color: categoria.color }}
                >
                  {categoria.nombre}
                </h2>
                <span className="text-xs text-humo">
                  Nivel {fuerza.nivel} · {fuerza.total} {fuerza.total === 1 ? 'voto' : 'votos'}
                </span>
              </div>

              <div className="mt-3">
                <Barra fraccion={fuerza.fraccion} color={categoria.color} alto="h-1.5" />
              </div>

              <div className="mt-5">
                <Arbol nodos={propias} categorias={categorias} />
              </div>
            </section>
          ))
        )}

        <div className="mt-10">
          <NuevoObjetivo
            usuarioId={juego.usuarioId}
            padreId={null}
            categorias={juego.categorias}
            profundidad={0}
            etiqueta="un objetivo grande"
            abiertoAlInicio={raices.length === 0}
          />
        </div>
      </main>
    </div>
  );
}
