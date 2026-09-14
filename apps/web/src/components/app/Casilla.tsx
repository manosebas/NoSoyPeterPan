'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { marcaObjetivo, mensajeError } from '@/lib/acciones';

/**
 * La casilla de una hoja. Solo la llevan los objetivos sin desglose: uno con
 * hijos se cumple cuando se cumplen ellos, y la base lo impone.
 */
export function Casilla({
  id,
  cumplido,
  color,
  etiqueta,
}: {
  id: string;
  cumplido: boolean;
  color: string;
  etiqueta: string;
}) {
  const router = useRouter();
  const [enVuelo, empieza] = useTransition();
  const [optimista, setOptimista] = useState(cumplido);
  const [error, setError] = useState<string | null>(null);

  async function alternar() {
    const siguiente = !optimista;
    setOptimista(siguiente);
    setError(null);

    try {
      await marcaObjetivo(id, siguiente);
      empieza(() => router.refresh());
    } catch (e) {
      setOptimista(!siguiente);
      setError(mensajeError(e, 'No se pudo guardar.'));
    }
  }

  return (
    <>
      <button
        type="button"
        role="checkbox"
        aria-checked={optimista}
        aria-label={etiqueta}
        disabled={enVuelo}
        onClick={alternar}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors"
        style={
          optimista
            ? { backgroundColor: color, borderColor: color }
            : { borderColor: 'var(--color-linea)' }
        }
      >
        {optimista && (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="#fff" strokeWidth="2.5">
            <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </>
  );
}
