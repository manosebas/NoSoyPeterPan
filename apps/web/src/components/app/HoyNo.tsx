'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { mensajeError, pospone } from '@/lib/acciones';

/**
 * Saca un paso del foco hasta manana. No lo borra ni le cambia la fecha limite:
 * solo dice "hoy no". Lo vencido no lo lleva: eso no se pospone.
 */
export function HoyNo({ id, hoy, manana }: { id: string; hoy: string; manana: string }) {
  const router = useRouter();
  const [refrescando, refresca] = useTransition();
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function posponer() {
    setGuardando(true);
    setError(null);
    try {
      await pospone(id, manana, hoy);
      refresca(() => router.refresh());
    } catch (e) {
      setError(mensajeError(e, 'No se pudo mover.'));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={posponer}
        disabled={guardando || refrescando}
        className="rounded-full border border-linea px-3 py-1 text-xs font-medium text-humo transition-colors hover:border-tinta hover:text-tinta disabled:opacity-40"
      >
        {guardando || refrescando ? 'Un momento…' : 'Hoy no'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
