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
    <ul className="ml-1.5 border-l pl-4" style={{ borderColor: `${color}33` }}>
      {nodos.map((nodo) => {
        const propio = categorias.get(nodo.categoriaId)?.color ?? color;
        const avance = progreso(nodo);
        const hoja = nodo.hijos.length === 0;
        const cumplido = hoja && nodo.completadoEn !== null;

        return (
          <li key={nodo.id} className="relative py-1">
            <span
              aria-hidden
              className="absolute -left-4 top-[1.15rem] h-px w-3"
              style={{ backgroundColor: `${propio}55` }}
            />

            <Link
              href={`/objetivo/${nodo.id}`}
              className="group flex items-baseline gap-2 rounded-md px-2 py-1 transition-colors hover:bg-papel"
            >
              <span
                aria-hidden
                className="shrink-0 text-xs"
                style={{ color: cumplido ? propio : 'var(--color-humo)' }}
              >
                {hoja ? (cumplido ? '☑' : '☐') : '▸'}
              </span>

              <span
                className={`min-w-0 flex-1 truncate text-sm transition-colors ${
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

              <span
                className={`shrink-0 text-xs ${
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
