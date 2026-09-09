import type { Categoria, Objetivo, NodoObjetivo } from '@nspp/shared';
import Link from 'next/link';
import { Casilla } from '@/components/juego/Casilla';

/**
 * Un paso del dia. A diferencia de una fila del mapa, esta tarjeta carga con la
 * respuesta a "por que estoy haciendo esto": la rama y el camino entero hasta
 * el objetivo grande del que cuelga. En Hoy se mezclan arboles distintos, y sin
 * ese contexto la pantalla vuelve a ser un checklist sin direccion.
 */
export function TarjetaHoy({
  nodo,
  categoria,
  camino,
  fecha,
  urgente = false,
  conCasilla = true,
}: {
  nodo: NodoObjetivo;
  categoria: Categoria | undefined;
  /** Del objetivo grande al padre inmediato. Sin el propio nodo. */
  camino: Objetivo[];
  /** Como se dice su fecha aqui: "vence hoy", "venció hace 12 días". */
  fecha: string;
  /** Lo vencido se dice en color, no en gris: regla 7 del CLAUDE.md. */
  urgente?: boolean;
  conCasilla?: boolean;
}) {
  const color = categoria?.color ?? '#71717a';
  const cumplido = nodo.completadoEn !== null;

  return (
    <article
      className="flex items-start gap-3 rounded-xl border border-linea bg-white p-4"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {conCasilla && (
        <div className="pt-0.5">
          <Casilla id={nodo.id} cumplido={cumplido} color={color} etiqueta={nodo.titulo} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <Link href={`/objetivo/${nodo.id}`} className="group block">
          <h3
            className={`text-[15px] font-medium leading-snug transition-opacity group-hover:opacity-70 ${
              cumplido ? 'text-humo line-through' : ''
            }`}
          >
            {nodo.titulo}
          </h3>
        </Link>

        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-xs text-humo">
          <span className="font-medium" style={{ color }}>
            {categoria?.nombre}
          </span>
          {camino.map((paso) => (
            <span key={paso.id} className="flex items-center gap-x-1.5">
              <span aria-hidden>›</span>
              <Link href={`/objetivo/${paso.id}`} className="transition-colors hover:text-tinta">
                {paso.titulo}
              </Link>
            </span>
          ))}
        </p>

        <p className={`mt-1.5 text-xs ${urgente ? 'font-medium text-red-600' : 'text-humo'}`}>
          {fecha}
        </p>
      </div>
    </article>
  );
}
