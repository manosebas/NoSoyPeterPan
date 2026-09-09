import { progreso, type Categoria, type DiasPlazo, type NodoObjetivo } from '@nspp/shared';
import Link from 'next/link';
import { ArbolMapa } from '@/components/juego/ArbolMapa';
import { Barra } from '@/components/juego/Barra';
import { textoFecha } from '@/lib/formato';

/**
 * Un objetivo raiz en el mapa. La franja de color a la izquierda dice a que
 * parte de tu vida pertenece antes de leer una sola palabra.
 */
export function TarjetaRaiz({
  raiz,
  categoria,
  categorias,
  dias,
  mostrarRama = true,
}: {
  raiz: NodoObjetivo;
  categoria: Categoria | undefined;
  categorias: Map<string, Categoria>;
  dias: DiasPlazo;
  mostrarRama?: boolean;
}) {
  const color = categoria?.color ?? '#71717a';
  const avance = progreso(raiz);
  const hoja = raiz.hijos.length === 0;
  const cumplido = hoja && raiz.completadoEn !== null;

  return (
    <article
      className="rounded-xl border border-linea bg-white p-4 transition-shadow hover:shadow-sm"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {mostrarRama && categoria && (
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color }}
        >
          {categoria.nombre}
        </p>
      )}

      <Link href={`/objetivo/${raiz.id}`} className="group block">
        <h3
          className={`mt-1 text-[15px] font-semibold leading-snug transition-colors ${
            cumplido ? 'text-humo line-through' : 'group-hover:opacity-70'
          }`}
        >
          {raiz.titulo}
        </h3>
      </Link>

      <div className="mt-3">
        <Barra fraccion={avance.fraccion} color={color} alto="h-1.5" />
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-humo">
        <span className="font-medium" style={{ color }}>
          {hoja ? (cumplido ? 'cumplido' : 'sin desglose') : `${avance.cumplidas} de ${avance.hojas}`}
        </span>
        <span aria-hidden>·</span>
        <span className={raiz.venceEl === null ? 'italic' : ''}>
          {textoFecha(raiz.venceEl, dias)}
        </span>
        {!hoja && (
          <>
            <span aria-hidden>·</span>
            <span>
              {raiz.hijos.length} {raiz.hijos.length === 1 ? 'paso' : 'pasos'}
            </span>
          </>
        )}
      </p>

      {!hoja && (
        <div className="mt-3 border-t border-linea pt-3">
          <ArbolMapa nodos={raiz.hijos} categorias={categorias} dias={dias} color={color} />
        </div>
      )}
    </article>
  );
}
