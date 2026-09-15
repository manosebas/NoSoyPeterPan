'use client';

import type { ModoFoco } from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { guardaFoco, mensajeError } from '@/lib/acciones';

const MODOS: Array<{ clave: ModoFoco; nombre: string; explica: string }> = [
  {
    clave: 'automatico',
    nombre: 'Automático',
    explica: 'Hoy arma tu foco solo: lo que vence antes y las ramas que llevan días quietas.',
  },
  {
    clave: 'elegir',
    nombre: 'Elegir yo',
    explica: 'Cada día, al entrar, eliges tus pasos entre los que tocan.',
  },
];

/** Cuantos pasos entran al foco de Hoy y quien los escoge. */
export function FocoDiario({
  usuarioId,
  pasosPorDia,
  modo,
}: {
  usuarioId: string;
  pasosPorDia: number;
  modo: ModoFoco;
}) {
  const router = useRouter();
  const [pasos, setPasos] = useState(pasosPorDia);
  const [actual, setActual] = useState(modo);
  const [error, setError] = useState<string | null>(null);

  async function guarda(siguiente: { pasosPorDia: number; modo: ModoFoco }) {
    setError(null);
    try {
      await guardaFoco(usuarioId, siguiente);
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar.'));
    }
  }

  function cambiaPasos(valor: number) {
    const acotado = Math.min(10, Math.max(1, valor));
    setPasos(acotado);
    return guarda({ pasosPorDia: acotado, modo: actual });
  }

  return (
    <div>
      <div className="flex items-center gap-3 py-2">
        <span className="flex-1 text-sm">Pasos por día</span>
        <button
          type="button"
          onClick={() => cambiaPasos(pasos - 1)}
          disabled={pasos <= 1}
          aria-label="Uno menos"
          className="h-8 w-8 rounded-full border border-linea text-humo transition-colors hover:border-tinta hover:text-tinta disabled:opacity-30"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold tabular-nums">{pasos}</span>
        <button
          type="button"
          onClick={() => cambiaPasos(pasos + 1)}
          disabled={pasos >= 10}
          aria-label="Uno más"
          className="h-8 w-8 rounded-full border border-linea text-humo transition-colors hover:border-tinta hover:text-tinta disabled:opacity-30"
        >
          +
        </button>
      </div>
      <p className="text-xs text-humo">Lo vencido cuenta dentro de estos pasos.</p>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {MODOS.map((m) => (
          <button
            key={m.clave}
            type="button"
            onClick={() => {
              setActual(m.clave);
              void guarda({ pasosPorDia: pasos, modo: m.clave });
            }}
            className={`rounded-xl border p-3 text-left transition-colors ${
              actual === m.clave ? 'border-tinta' : 'border-linea hover:border-humo'
            }`}
          >
            <span className="block text-sm font-medium">{m.nombre}</span>
            <span className="mt-1 block text-xs text-humo">{m.explica}</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
