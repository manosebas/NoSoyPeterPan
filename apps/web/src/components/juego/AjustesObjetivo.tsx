'use client';

import { fechaDePlazo, PLAZOS, type Categoria, type Plazo } from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { actualizaObjetivo, borraObjetivo, mensajeError } from '@/lib/acciones';

/**
 * Lo que se puede cambiar de un objetivo ya creado: a que rama aporta, para
 * cuando es, y si sigue existiendo. Va plegado porque no es lo que se viene a
 * hacer aqui: la pantalla es para desglosar y marcar.
 */
export function AjustesObjetivo({
  id,
  categoriaId,
  venceEl,
  padreVenceEl,
  tieneHijos,
  categorias,
  volverA,
}: {
  id: string;
  categoriaId: string;
  venceEl: string | null;
  padreVenceEl: string | null;
  tieneHijos: boolean;
  categorias: Categoria[];
  volverA: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function corre(accion: () => Promise<void>) {
    setOcupado(true);
    setError(null);
    try {
      await accion();
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar.'));
    } finally {
      setOcupado(false);
    }
  }

  function cambiaPlazo(plazo: Plazo | 'sin_fecha') {
    if (plazo === 'sin_fecha') return corre(() => actualizaObjetivo(id, { venceEl: null }));

    // La base rechaza un paso que vence despues de su objetivo: se recorta antes.
    const propuesta = fechaDePlazo(plazo);
    const fecha = padreVenceEl && propuesta > padreVenceEl ? padreVenceEl : propuesta;
    return corre(() => actualizaObjetivo(id, { venceEl: fecha }));
  }

  async function borrar() {
    const aviso = tieneHijos
      ? 'Esto borra el objetivo y todo su desglose. ¿Seguro?'
      : '¿Borrar este objetivo?';
    if (!window.confirm(aviso)) return;

    setOcupado(true);
    try {
      await borraObjetivo(id);
      router.push(volverA);
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo borrar.'));
      setOcupado(false);
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-xs text-humo underline underline-offset-4 transition-colors hover:text-tinta"
      >
        Ajustar
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-linea bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Rama</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {categorias.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={ocupado}
            onClick={() => corre(() => actualizaObjetivo(id, { categoriaId: c.id }))}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40"
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
      {tieneHijos && (
        <p className="mt-2 text-xs text-humo">
          Su desglose se muda contigo, salvo lo que ya tenga rama propia.
        </p>
      )}

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-humo">Para cuándo</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[...PLAZOS, { clave: 'sin_fecha' as const, etiqueta: 'Sin fecha' }].map((p) => (
          <button
            key={p.clave}
            type="button"
            disabled={ocupado}
            onClick={() => cambiaPlazo(p.clave as Plazo | 'sin_fecha')}
            className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40 ${
              (p.clave === 'sin_fecha') === (venceEl === null)
                ? 'border-tinta text-tinta'
                : 'border-linea text-humo hover:text-tinta'
            }`}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex items-center justify-between border-t border-linea pt-4">
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="text-sm text-humo transition-colors hover:text-tinta"
        >
          Cerrar
        </button>
        <button
          type="button"
          disabled={ocupado}
          onClick={borrar}
          className="text-sm text-red-600 transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          Borrar
        </button>
      </div>
    </div>
  );
}
