'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { actualizaObjetivo, mensajeError } from '@/lib/acciones';

/**
 * Trae un paso de esta semana al dia de hoy. Es la decision que el producto
 * pide todas las mananas: no esperar a que algo se venza para hacerlo.
 *
 * Solo mueve la fecha de este paso. Su padre no se entera: lo que se hace hoy
 * es la hoja, no el objetivo grande del que cuelga.
 */
export function HacerHoy({ id, hoy }: { id: string; hoy: string }) {
  const router = useRouter();
  const [pendiente, empieza] = useTransition();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function traer() {
    setGuardando(true);
    setError(null);
    try {
      await actualizaObjetivo(id, { venceEl: hoy });
      empieza(() => router.refresh());
    } catch (e) {
      setError(mensajeError(e, 'No se pudo mover.'));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="shrink-0 text-right">
      <button
        type="button"
        onClick={traer}
        disabled={guardando || pendiente}
        className="rounded-full border border-linea px-3 py-1 text-xs font-medium text-humo transition-colors hover:border-tinta hover:text-tinta disabled:opacity-40"
      >
        {guardando || pendiente ? 'Un momento…' : 'Hacer hoy'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
