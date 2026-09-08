import { progreso, type Categoria, type NodoObjetivo } from '@nspp/shared';
import Link from 'next/link';
import { Barra } from '@/components/juego/Barra';
import { textoFecha } from '@/lib/formato';

/**
 * La cascada completa de un objetivo, indentada. Solo lectura: aqui se entiende
 * el arbol entero, se marca en Hoy y se desglosa en la pantalla del objetivo.
 */
export function Arbol({
  nodos,
  categorias,
  nivel = 0,
}: {
  nodos: NodoObjetivo[];
  categorias: Map<string, Categoria>;
  nivel?: number;
}) {
  return (
    <ul className={nivel === 0 ? '' : 'ml-3 border-l border-linea pl-4'}>
      {nodos.map((nodo) => {
        const avance = progreso(nodo);
        const hoja = nodo.hijos.length === 0;
        const cumplido = hoja && nodo.completadoEn !== null;
        const color = categorias.get(nodo.categoriaId)?.color ?? '#71717a';

        return (
          <li key={nodo.id} className="py-1.5">
            <Link href={`/objetivo/${nodo.id}`} className="group flex items-baseline gap-2">
              <span aria-hidden className="text-xs" style={{ color: cumplido ? color : undefined }}>
                {hoja ? (cumplido ? '☑' : '☐') : '▸'}
              </span>

              <span
                className={`min-w-0 flex-1 truncate text-sm transition-colors group-hover:text-tinta ${
                  cumplido ? 'text-humo line-through' : ''
                }`}
              >
                {nodo.titulo}
              </span>

              {!hoja && (
                <span className="flex shrink-0 items-center gap-2 text-xs text-humo">
                  <span className="hidden w-20 sm:block">
                    <Barra fraccion={avance.fraccion} color={color} alto="h-1" />
                  </span>
                  {avance.cumplidas} de {avance.hojas}
                </span>
              )}

              <span
                className={`shrink-0 text-xs ${
                  nodo.venceEl === null ? 'italic text-humo/70' : 'text-humo'
                }`}
              >
                {textoFecha(nodo.venceEl)}
              </span>
            </Link>

            {!hoja && <Arbol nodos={nodo.hijos} categorias={categorias} nivel={nivel + 1} />}
          </li>
        );
      })}
    </ul>
  );
}
