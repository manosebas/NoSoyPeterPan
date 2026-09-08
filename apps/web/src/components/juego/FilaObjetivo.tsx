import { progreso, type Categoria, type DiasPlazo, type NodoObjetivo } from '@nspp/shared';
import Link from 'next/link';
import { Barra, Punto } from '@/components/juego/Barra';
import { Casilla } from '@/components/juego/Casilla';
import { textoFecha } from '@/lib/formato';

/**
 * Una linea de la lista. Con desglose muestra su avance; sin desglose, casilla.
 * Esa diferencia visual es toda la explicacion que necesita la regla: solo se
 * marca lo que ya no se puede partir.
 */
export function FilaObjetivo({
  nodo,
  categoria,
  contexto,
  dias,
}: {
  nodo: NodoObjetivo;
  categoria: Categoria | undefined;
  /** De donde cuelga. Se muestra en Hoy, donde se mezclan arboles distintos. */
  contexto?: string;
  dias?: DiasPlazo;
}) {
  const color = categoria?.color ?? '#71717a';
  const hoja = nodo.hijos.length === 0;
  const avance = progreso(nodo);
  const cumplido = hoja && nodo.completadoEn !== null;
  const sinFecha = nodo.venceEl === null;

  return (
    <li className="flex items-start gap-3 border-b border-linea py-3 last:border-b-0">
      <div className="pt-0.5">
        {hoja ? (
          <Casilla id={nodo.id} cumplido={cumplido} color={color} etiqueta={nodo.titulo} />
        ) : (
          <Punto color={color} titulo={categoria?.nombre} />
        )}
      </div>

      <Link href={`/objetivo/${nodo.id}`} className="group min-w-0 flex-1">
        <span
          className={`block truncate text-[15px] transition-colors group-hover:text-tinta ${
            cumplido ? 'text-humo line-through' : ''
          }`}
        >
          {nodo.titulo}
        </span>

        <span className="mt-1 flex items-center gap-2 text-xs text-humo">
          <span className={sinFecha ? 'text-humo/70 italic' : ''}>{textoFecha(nodo.venceEl, dias)}</span>
          {contexto && (
            <>
              <span aria-hidden>·</span>
              <span className="truncate">{contexto}</span>
            </>
          )}
          {!hoja && (
            <>
              <span aria-hidden>·</span>
              <span>
                {avance.cumplidas} de {avance.hojas}
              </span>
            </>
          )}
        </span>

        {!hoja && (
          <span className="mt-2 block max-w-40">
            <Barra fraccion={avance.fraccion} color={color} alto="h-1" />
          </span>
        )}
      </Link>

      {!hoja && (
        <span className="shrink-0 pt-0.5 text-xs text-humo" aria-label={`${nodo.hijos.length} pasos`}>
          › {nodo.hijos.length}
        </span>
      )}
    </li>
  );
}
