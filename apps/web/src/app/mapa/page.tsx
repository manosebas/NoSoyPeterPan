import { construyeArbol, leePlazo, PLAZOS, type NodoObjetivo, type Plazo } from '@nspp/shared';
import { redirect } from 'next/navigation';
import { Cabecera } from '@/components/Cabecera';
import { Arbol } from '@/components/juego/Arbol';
import { NuevoObjetivo } from '@/components/juego/NuevoObjetivo';
import { cargaJuego, porId } from '@/lib/juego';
import { obtenerSesionConPerfil } from '@/lib/perfil';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'El Mapa — No Soy Peter Pan' };

const INVITACION: Record<Plazo, string> = {
  largo: 'agrega un objetivo de largo plazo',
  mediano: 'agrega un objetivo de mediano plazo',
  corto: 'agrega un objetivo de corto plazo',
};

const EXPLICACION: Record<Plazo, string> = {
  largo: 'Quién quieres ser cuando esto ya sea normal para ti.',
  mediano: 'Lo que tiene que ser verdad en el camino.',
  corto: 'Lo que se puede empezar ahora y terminar pronto.',
};

export default async function Mapa() {
  const [sesion, juego] = await Promise.all([obtenerSesionConPerfil(), cargaJuego()]);
  if (!sesion || !juego) redirect('/entrar?siguiente=/mapa');

  const categorias = porId(juego.categorias);

  // Solo raices: lo que cuelga de un objetivo se ve dentro de su arbol, no
  // repetido en la seccion de su plazo. Los sueltos del dia viven en Hoy.
  const raices = construyeArbol(juego.objetivos).filter((n) => !n.suelto);

  const secciones = PLAZOS.map(({ clave, etiqueta }) => ({
    clave,
    etiqueta,
    raices: raices.filter((r) => encajaEn(r, clave, juego.plazos)),
  }));

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-8">
      <Cabecera sesion={sesion} />

      <main className="flex-1 py-10">
        <h1 className="text-2xl font-bold tracking-tight">El Mapa</h1>
        <p className="mt-1 text-sm text-humo">
          De los cinco años al paso de esta semana. Toca cualquiera para partirlo en pasos más
          chicos.
        </p>

        {secciones.map((seccion) => (
          <section key={seccion.clave} className="mt-12 first:mt-10">
            <div className="flex items-baseline justify-between gap-4 border-b border-linea pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em]">
                {seccion.etiqueta}
              </h2>
              <span className="text-xs text-humo">
                {seccion.raices.length === 0 ? 'vacío' : `${seccion.raices.length}`}
              </span>
            </div>

            <p className="mt-2 text-xs text-humo">{EXPLICACION[seccion.clave]}</p>

            {seccion.raices.length > 0 && (
              <ul className="mt-5 space-y-6">
                {seccion.raices.map((raiz) => {
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

            <div className="mt-5">
              <NuevoObjetivo
                usuarioId={juego.usuarioId}
                padreId={null}
                categorias={juego.categorias}
                profundidad={0}
                dias={juego.plazos}
                plazoFijo={seccion.clave}
                etiqueta={INVITACION[seccion.clave]}
              />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

/**
 * En que seccion cae una raiz.
 *
 * Lo vencido se lee como corto plazo, porque es lo que reclama atencion ya. Lo
 * que quedo sin fecha de antes se lee como largo: es exactamente lo que vive en
 * Nunca Jamas.
 */
function encajaEn(
  raiz: NodoObjetivo,
  plazo: Plazo,
  dias: Parameters<typeof leePlazo>[1],
): boolean {
  const lectura = leePlazo(raiz.venceEl, dias);
  if (lectura === 'vencido') return plazo === 'corto';
  if (lectura === 'sin_fecha') return plazo === 'largo';
  return lectura === plazo;
}
