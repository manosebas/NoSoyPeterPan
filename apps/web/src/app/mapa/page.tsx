import {
  construyeArbol,
  fuerzaDeRama,
  leePlazo,
  textoDuracion,
  VOTOS_POR_NIVEL_DEFECTO,
  type DiasPlazo,
  type LecturaPlazo,
  type NodoObjetivo,
} from '@nspp/shared';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { Barra } from '@/components/juego/Barra';
import { NuevoObjetivo } from '@/components/juego/NuevoObjetivo';
import { TarjetaRaiz } from '@/components/juego/TarjetaRaiz';
import { VistaMapa } from '@/components/juego/VistaMapa';
import { Pagina } from '@/components/Pagina';
import { cargaJuego, porId } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'El Mapa — No Soy Peter Pan' };

/** Una seccion por plazo. Lo vencido se lee como lo mas urgente que hay. */
const SECCIONES = [
  { clave: 'largo', etiqueta: 'Largo plazo', explica: 'Quién quieres ser cuando esto sea normal.' },
  {
    clave: 'mediano',
    etiqueta: 'Mediano plazo',
    explica: 'Lo que tiene que ser verdad en el camino.',
  },
  { clave: 'corto', etiqueta: 'Corto plazo', explica: 'Lo que se empieza ahora y se termina pronto.' },
  { clave: 'semana', etiqueta: 'Esta semana', explica: 'Lo que decide si el resto avanza o no.' },
  { clave: 'sin_fecha', etiqueta: 'Sin fecha', explica: 'Nunca Jamás: lo que dijiste que algún día.' },
] as const;

export default async function Mapa() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/mapa');

  const categorias = porId(juego.categorias);

  // Solo raices: lo que cuelga de un objetivo se ve dentro de su arbol, no
  // repetido en la seccion de su plazo.
  const raices = construyeArbol(juego.objetivos);

  const porPlazo = SECCIONES.map((s) => ({
    ...s,
    raices: raices.filter((r) => encajaEn(r, s.clave, juego.plazos)),
  }));

  const porRama = juego.categorias
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
    <Pagina>
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">El Mapa</h1>
            <p className="mt-1 text-sm text-humo">
              De los {textoDuracion('largo', juego.plazos)} al paso de esta semana. Toca cualquiera
              para partirlo en pasos más chicos.
            </p>
          </div>

          <NuevoObjetivo
            usuarioId={juego.usuarioId}
            padreId={null}
            categorias={juego.categorias}
            profundidad={0}
            dias={juego.plazos}
            comoModal
            destacado
            etiqueta="Agregar objetivo"
          />
        </div>

        {raices.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-linea p-10 text-center">
            <p className="text-lg">El mapa está en blanco.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-humo">
              Escribe lo que quieres que sea verdad dentro de unos años. Sin miedo a que suene
              grande: para eso existe el desglose.
            </p>
          </div>
        ) : (
          <VistaMapa
            cascada={
              <div className="grid gap-x-10 gap-y-10 lg:grid-cols-2">
                {porPlazo.map((seccion) => (
                  <section key={seccion.clave}>
                    <EncabezadoSeccion
                      etiqueta={seccion.etiqueta}
                      explica={seccion.explica}
                      cuenta={seccion.raices.length}
                      duracion={
                        seccion.clave === 'sin_fecha'
                          ? null
                          : textoDuracion(seccion.clave, juego.plazos)
                      }
                    />

                    {seccion.raices.length === 0 ? (
                      <Vacia />
                    ) : (
                      <div className="mt-4 space-y-3">
                        {seccion.raices.map((raiz) => (
                          <TarjetaRaiz
                            key={raiz.id}
                            raiz={raiz}
                            categoria={categorias.get(raiz.categoriaId)}
                            categorias={categorias}
                            dias={juego.plazos}
                          />
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            }
            ramas={
              <div className="space-y-12">
                {porRama.map(({ categoria, raices: propias, fuerza }) => (
                  <section key={categoria.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h2
                        className="text-sm font-semibold uppercase tracking-[0.18em]"
                        style={{ color: categoria.color }}
                      >
                        {categoria.nombre}
                      </h2>
                      <span className="text-xs text-humo">
                        Nivel {fuerza.nivel} · {fuerza.total}{' '}
                        {fuerza.total === 1 ? 'voto' : 'votos'} · {propias.length}{' '}
                        {propias.length === 1 ? 'objetivo' : 'objetivos'}
                      </span>
                    </div>

                    <div className="mt-3">
                      <Barra fraccion={fuerza.fraccion} color={categoria.color} alto="h-1" />
                    </div>

                    <div className="mt-5 grid gap-3 lg:grid-cols-2">
                      {propias.map((raiz) => (
                        <TarjetaRaiz
                          key={raiz.id}
                          raiz={raiz}
                          categoria={categoria}
                          categorias={categorias}
                          dias={juego.plazos}
                          mostrarRama={false}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            }
            tablero={
              // Columnas: la unica vista donde se compara cuanto pesa cada plazo.
              <div className="-mx-6 overflow-x-auto px-6 pb-2">
                <div className="grid min-w-[64rem] grid-cols-5 gap-4">
                  {porPlazo.map((seccion) => (
                    <section key={seccion.clave}>
                      <div className="flex items-baseline justify-between gap-2 border-b border-linea pb-2">
                        <h2 className="text-xs font-semibold uppercase tracking-[0.16em]">
                          {seccion.etiqueta}
                        </h2>
                        <span className="text-xs text-humo">{seccion.raices.length}</span>
                      </div>

                      <div className="mt-3 space-y-3">
                        {seccion.raices.length === 0 ? (
                          <Vacia />
                        ) : (
                          seccion.raices.map((raiz) => (
                            <TarjetaRaiz
                              key={raiz.id}
                              raiz={raiz}
                              categoria={categorias.get(raiz.categoriaId)}
                              categorias={categorias}
                              dias={juego.plazos}
                              compacta
                            />
                          ))
                        )}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            }
          />
        )}
      </main>
    </Pagina>
  );
}

function EncabezadoSeccion({
  etiqueta,
  explica,
  cuenta,
  duracion,
}: {
  etiqueta: string;
  explica: string;
  cuenta: number;
  duracion: string | null;
}) {
  return (
    <div className="border-b border-linea pb-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
          {etiqueta}
          {duracion && (
            <span className="ml-2 font-normal normal-case tracking-normal text-humo">
              {duracion}
            </span>
          )}
        </h2>
        <span className="rounded-full bg-linea px-2 py-0.5 text-[11px] font-medium text-humo">
          {cuenta}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-humo">{explica}</p>
    </div>
  );
}

function Vacia() {
  return (
    <p className="mt-4 rounded-lg border border-dashed border-linea px-4 py-6 text-center text-xs text-humo">
      Nada aquí todavía.
    </p>
  );
}

/** En que seccion cae una raiz. Lo vencido reclama atencion: va a esta semana. */
function encajaEn(raiz: NodoObjetivo, seccion: LecturaPlazo, dias: DiasPlazo): boolean {
  const lectura = leePlazo(raiz.venceEl, dias);
  if (lectura === 'vencido') return seccion === 'semana';
  return lectura === seccion;
}
