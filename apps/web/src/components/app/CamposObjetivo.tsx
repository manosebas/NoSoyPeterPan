'use client';

import {
  fechaDePlazo,
  PLAZOS,
  textoDuracion,
  type Categoria,
  type DiasPlazo,
  type Plazo,
} from '@nspp/shared';

export type Eleccion = Plazo | 'sin_fecha';

const FECHA = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' });

/** Lo que cabe en `objetivos.detalle`: lo impone la base, no la UI. */
export const TOPE_DETALLE = 2000;

/** La misma pregunta al crear y al editar: si difieren, una de las dos miente. */
export const PIDE_DETALLE =
  'Cuéntalo como se lo contarías a alguien que te va a ayudar: para qué lo quieres, fechas, con quién, cuánto tienes y qué ya intentaste. «Ir a Miami» no dice nada. «Viaje sorpresa en familia del 29 de diciembre al 7 de enero, somos 4, presupuesto de 5.000 dólares» sí.';

/** Por que importa el detalle, dicho en una linea visible y no en el placeholder. */
export const POR_QUE_DETALLE =
  'Es lo que más importa. Con un buen detalle la IA te arma un desglose de verdad; sin él, uno genérico.';

/**
 * Los campos de un objetivo: que es, de que se trata, a que rama aporta y para
 * cuando. Los comparten el modal del mapa y el formulario de desglose, para
 * que crear se sienta igual en los dos lados.
 */
export function CamposObjetivo({
  titulo,
  onTitulo,
  detalle,
  onDetalle,
  categoriaId,
  onCategoria,
  categorias,
  plazo,
  onPlazo,
  dias,
  topeFecha,
  autoFoco = false,
}: {
  titulo: string;
  onTitulo: (valor: string) => void;
  detalle: string;
  onDetalle: (valor: string) => void;
  /** Sin `onCategoria` no se pregunta la rama: se hereda del padre. */
  categoriaId?: string;
  onCategoria?: (id: string) => void;
  categorias: Categoria[];
  plazo: Eleccion;
  onPlazo: (plazo: Eleccion) => void;
  dias: DiasPlazo;
  /** Fecha del padre: un paso no puede vencer despues del objetivo que lo contiene. */
  topeFecha?: string | null;
  autoFoco?: boolean;
}) {
  const fecha = plazo === 'sin_fecha' ? null : recorta(fechaDePlazo(plazo, dias), topeFecha);

  return (
    <div>
      <input
        autoFocus={autoFoco}
        type="text"
        value={titulo}
        maxLength={200}
        placeholder="¿Qué quieres lograr?"
        onChange={(e) => onTitulo(e.target.value)}
        className="w-full border-0 border-b border-linea bg-transparent px-0 pb-2 text-base outline-none placeholder:text-humo focus:border-tinta"
      />

      {/* Opcional, pero es lo unico que sabra de este objetivo quien no eres tu
          hoy: tu yo de dentro de un mes, o la IA cuando lo desglose. */}
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-humo">Detalle</p>
      <p className="mt-1 text-xs text-humo">{POR_QUE_DETALLE}</p>
      <textarea
        value={detalle}
        rows={4}
        maxLength={TOPE_DETALLE}
        placeholder={PIDE_DETALLE}
        onChange={(e) => onDetalle(e.target.value)}
        // 16px en movil: por debajo de eso iOS hace zoom al enfocar y deja la
        // pagina descuadrada.
        className="mt-2 w-full resize-none rounded-lg border border-linea bg-transparent p-3 text-base leading-relaxed outline-none placeholder:text-humo/70 focus:border-tinta sm:text-sm"
      />

      {onCategoria && (
        <>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-humo">Rama</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {categorias.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onCategoria(c.id)}
                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
                style={
                  categoriaId === c.id
                    ? { borderColor: c.color, color: c.color }
                    : { borderColor: 'var(--color-linea)', color: 'var(--color-humo)' }
                }
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.nombre}
              </button>
            ))}
          </div>
        </>
      )}

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-humo">Plazo</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PLAZOS.map((p) => (
          <button
            key={p.clave}
            type="button"
            onClick={() => onPlazo(p.clave)}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              plazo === p.clave ? 'border-tinta text-tinta' : 'border-linea text-humo hover:text-tinta'
            }`}
          >
            {p.etiqueta}
            {p.clave !== 'hoy' && (
              <span className="ml-1.5 text-humo">{textoDuracion(p.clave, dias)}</span>
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPlazo('sin_fecha')}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            plazo === 'sin_fecha'
              ? 'border-tinta text-tinta'
              : 'border-linea text-humo hover:text-tinta'
          }`}
        >
          Sin fecha
        </button>
      </div>

      <p className="mt-3 text-xs text-humo">
        {fecha ? (
          <>Queda para el {FECHA.format(new Date(`${fecha}T00:00:00`))}.</>
        ) : (
          <>Sin fecha vive en Nunca Jamás hasta que le pongas una.</>
        )}
      </p>
    </div>
  );
}

/** La fecha de un hijo nunca pasa la de su padre: la base lo rechaza. */
export function recorta(fecha: string, tope?: string | null): string {
  return tope && fecha > tope ? tope : fecha;
}
