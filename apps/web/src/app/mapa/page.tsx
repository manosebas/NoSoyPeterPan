import {
  construyeArbol,
  leePlazo,
  textoDuracion,
  type DiasPlazo,
  type LecturaPlazo,
  type NodoObjetivo,
} from '@nspp/shared';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { Pagina } from '@/components/Pagina';
import { Arbol } from '@/components/juego/Arbol';
import { NuevoObjetivo } from '@/components/juego/NuevoObjetivo';
import { cargaJuego, porId } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'El Mapa — No Soy Peter Pan' };

/** Una seccion por plazo. Lo vencido se lee como lo mas urgente que hay. */
const SECCIONES = [
  { clave: 'largo', etiqueta: 'Largo plazo', explica: 'Quién quieres ser cuando esto sea normal.' },
  { clave: 'mediano', etiqueta: 'Mediano plazo', explica: 'Lo que tiene que ser verdad en el camino.' },
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

  return (
    <Pagina>
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <div className="flex items-start justify-between gap-4">
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

        {/* Dos columnas de secciones: el mapa entero cabe sin bajar tanto. */}
        <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-2">
        {SECCIONES.map((seccion) => {
          const propias = raices.filter((r) => encajaEn(r, seccion.clave, juego.plazos));

          return (
            <section key={seccion.clave}>
              <div className="flex items-baseline justify-between gap-4 border-b border-linea pb-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {seccion.etiqueta}
                  {seccion.clave !== 'sin_fecha' && (
                    <span className="ml-2 font-normal normal-case tracking-normal text-humo">
                      {textoDuracion(seccion.clave, juego.plazos)}
                    </span>
                  )}
                </h2>
                <span className="text-xs text-humo">
                  {propias.length === 0 ? 'vacío' : propias.length}
                </span>
              </div>

              <p className="mt-2 text-xs text-humo">{seccion.explica}</p>

              {propias.length > 0 && (
                <ul className="mt-5 space-y-6">
                  {propias.map((raiz) => {
                    const categoria = categorias.get(raiz.categoriaId);

                    return (
                      <li key={raiz.id}>
                        <p
                          className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: categoria?.color }}
                        >
                          {categoria?.nombre}
                        </p>
                        <Arbol nodos={[raiz]} categorias={categorias} dias={juego.plazos} />
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
        </div>
      </main>
    </Pagina>
  );
}

/** En que seccion cae una raiz. Lo vencido reclama atencion: va a esta semana. */
function encajaEn(raiz: NodoObjetivo, seccion: LecturaPlazo, dias: DiasPlazo): boolean {
  const lectura = leePlazo(raiz.venceEl, dias);
  if (lectura === 'vencido') return seccion === 'semana';
  return lectura === seccion;
}
