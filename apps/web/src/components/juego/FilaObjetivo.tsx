'use client';

import { progreso, type Categoria, type DiasPlazo, type NodoObjetivo } from '@nspp/shared';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Barra, Punto } from '@/components/juego/Barra';
import { Casilla } from '@/components/juego/Casilla';
import { textoFecha } from '@/lib/formato';

/** Cuantos nietos se asoman antes de mandar a "Ver todos". */
const ASOMAN = 6;

/**
 * Una linea de la lista. Con desglose muestra su avance; sin desglose, casilla.
 * Esa diferencia visual es toda la explicacion que necesita la regla: solo se
 * marca lo que ya no se puede partir.
 *
 * Con `conVistaPrevia`, una fila que tiene desglose lo asoma sin cambiar de
 * pantalla: en desktop al pasar el mouse, en telefono al tocarla. Asi se baja
 * un nivel para mirar y se vuelve, que es lo que uno hace de verdad.
 */
export function FilaObjetivo({
  nodo,
  categoria,
  categorias,
  dias,
  conVistaPrevia = false,
}: {
  nodo: NodoObjetivo;
  categoria: Categoria | undefined;
  /** Para pintar cada nieto con su propia rama si se cambio de la del padre. */
  categorias?: Map<string, Categoria>;
  dias?: DiasPlazo;
  conVistaPrevia?: boolean;
}) {
  const color = categoria?.color ?? '#71717a';
  const hoja = nodo.hijos.length === 0;
  const avance = progreso(nodo);
  const cumplido = hoja && nodo.completadoEn !== null;
  const sinFecha = nodo.venceEl === null;

  const previa = conVistaPrevia && !hoja;
  const [abierta, setAbierta] = useState(false);
  const fila = useRef<HTMLLIElement>(null);

  // Fuera del panel se cierra: en telefono no hay "salir con el mouse".
  useEffect(() => {
    if (!abierta) return;

    function alTocarFuera(e: PointerEvent) {
      if (!fila.current?.contains(e.target as Node)) setAbierta(false);
    }
    function alEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setAbierta(false);
    }

    document.addEventListener('pointerdown', alTocarFuera);
    document.addEventListener('keydown', alEscape);
    return () => {
      document.removeEventListener('pointerdown', alTocarFuera);
      document.removeEventListener('keydown', alEscape);
    };
  }, [abierta]);

  /**
   * En desktop el titulo navega y el panel es cosa del hover. Donde no hay
   * hover, el primer toque asoma el desglose y el segundo si entra.
   */
  function alTocarTitulo(e: React.MouseEvent) {
    if (!previa || abierta) return;
    if (window.matchMedia('(hover: hover)').matches) return;
    e.preventDefault();
    setAbierta(true);
  }

  return (
    <li
      ref={fila}
      className="relative border-b border-linea last:border-b-0"
      onPointerEnter={(e) => previa && e.pointerType === 'mouse' && setAbierta(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setAbierta(false)}
      onFocus={() => previa && setAbierta(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setAbierta(false);
      }}
    >
      <div className="flex items-start gap-3 py-3">
        <div className="pt-0.5">
          {hoja ? (
            <Casilla id={nodo.id} cumplido={cumplido} color={color} etiqueta={nodo.titulo} />
          ) : (
            <Punto color={color} titulo={categoria?.nombre} />
          )}
        </div>

        <Link
          href={`/objetivo/${nodo.id}`}
          onClick={alTocarTitulo}
          className="group min-w-0 flex-1"
        >
          <span
            className={`block truncate text-[15px] transition-colors group-hover:text-tinta ${
              cumplido ? 'text-humo line-through' : ''
            }`}
          >
            {nodo.titulo}
          </span>

          <span className="mt-1 flex items-center gap-2 text-xs text-humo">
            <span className={sinFecha ? 'text-humo/70 italic' : ''}>
              {textoFecha(nodo.venceEl, dias)}
            </span>
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
          <span
            className="shrink-0 pt-0.5 text-xs text-humo"
            aria-label={`${nodo.hijos.length} pasos`}
          >
            › {nodo.hijos.length}
          </span>
        )}
      </div>

      {previa && abierta && (
        // Pegado a la fila, sin margen: un hueco de por medio y el mouse
        // cruzandolo cerraria el panel justo antes de llegar.
        <div className="absolute left-0 right-0 top-full z-30 pt-1">
          <div className="rounded-xl border border-linea bg-white p-2 shadow-lg">
            <ul>
              {nodo.hijos.slice(0, ASOMAN).map((nieto) => {
                const suyo = categorias?.get(nieto.categoriaId)?.color ?? color;
                const suHoja = nieto.hijos.length === 0;
                const suCumplido = suHoja && nieto.completadoEn !== null;

                return (
                  <li key={nieto.id}>
                    <Link
                      href={`/objetivo/${nieto.id}`}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-papel"
                    >
                      <span
                        aria-hidden
                        className="shrink-0 text-xs"
                        style={{ color: suCumplido ? suyo : 'var(--color-humo)' }}
                      >
                        {suHoja ? (suCumplido ? '☑' : '☐') : '▸'}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate text-sm ${
                          suCumplido ? 'text-humo line-through' : ''
                        }`}
                      >
                        {nieto.titulo}
                      </span>
                      {!suHoja && (
                        <span className="shrink-0 text-xs text-humo">{nieto.hijos.length}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <Link
              href={`/objetivo/${nodo.id}`}
              className="mt-1 block border-t border-linea px-2 pt-2 text-xs font-medium text-humo transition-colors hover:text-tinta"
            >
              Ver todos ({nodo.hijos.length}) →
            </Link>
          </div>
        </div>
      )}
    </li>
  );
}
