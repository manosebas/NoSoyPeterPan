import { progreso, type Categoria, type DiasPlazo, type NodoObjetivo } from '@nspp/shared';
import Link from 'next/link';
import { textoFecha } from '@/lib/formato';

/**
 * El desglose de un objetivo, con las lineas que unen padre e hijo.
 *
 * La linea vertical y el codo hacia cada fila es lo que hace legible la cascada:
 * sin ellas, seis niveles de indentacion son seis margenes que hay que medir a
 * ojo. La linea toma el color de la rama, asi que el arbol entero se lee de un
 * vistazo como perteneciente a una parte de tu vida.
 */
export function ArbolMapa({
  nodos,
  categorias,
  dias,
  color,
}: {
  nodos: NodoObjetivo[];
  categorias: Map<string, Categoria>;
  dias: DiasPlazo;
  /** Color heredado del objetivo raiz; un hijo con rama propia usa el suyo. */
  color: string;
}) {
  return (
    // Sangria corta en telefono: seis niveles a 4 de padding se comen la mitad
    // del ancho y al titulo no le queda donde caber.
    <ul className="ml-1 border-l pl-2.5 sm:ml-1.5 sm:pl-4" style={{ borderColor: `${color}33` }}>
      {nodos.map((nodo) => {
        const propio = categorias.get(nodo.categoriaId)?.color ?? color;
        const avance = progreso(nodo);
        const hoja = nodo.hijos.length === 0;
        const cumplido = hoja && nodo.completadoEn !== null;

        return (
          <li key={nodo.id} className="relative py-1">
            <span
              aria-hidden
              className="absolute -left-2.5 top-[1.15rem] h-px w-2 sm:-left-4 sm:w-3"
              style={{ backgroundColor: `${propio}55` }}
            />

            <Link
              href={`/objetivo/${nodo.id}`}
              className="group flex items-baseline gap-1.5 rounded-md px-1 py-1 transition-colors hover:bg-papel sm:gap-2 sm:px-2"
            >
              <span
                aria-hidden
                className="shrink-0 text-xs"
                style={{ color: cumplido ? propio : 'var(--color-humo)' }}
              >
                {hoja ? (cumplido ? '☑' : '☐') : '▸'}
              </span>

              <span
                className={`min-w-0 flex-1 truncate text-[13px] transition-colors sm:text-sm ${
                  cumplido ? 'text-humo line-through' : 'group-hover:text-tinta'
                }`}
              >
                {nodo.titulo}
              </span>

              {!hoja && (
                <span className="shrink-0 text-xs font-medium" style={{ color: propio }}>
                  {avance.cumplidas}/{avance.hojas}
                </span>
              )}

              {/* En telefono la fecha se calla: con seis niveles de sangria, el
                  icono, el avance y la fecha juntos no se encogen y empujan la
                  tarjeta fuera de la pantalla. La fecha se lee al entrar. */}
              <span
                className={`hidden shrink-0 whitespace-nowrap text-xs sm:inline ${
                  nodo.venceEl === null ? 'italic text-humo/70' : 'text-humo'
                }`}
              >
                {textoFecha(nodo.venceEl, dias)}
              </span>
            </Link>

            {!hoja && (
              <ArbolMapa
                nodos={nodo.hijos}
                categorias={categorias}
                dias={dias}
                color={propio}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
