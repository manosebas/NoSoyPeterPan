'use client';

import { VOTOS_POR_NIVEL_DEFECTO, type Categoria } from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { guardaMeta, mensajeError } from '@/lib/acciones';

/** Atajos: una por semana, una diaria de mes, dos meses, un trimestre. */
const ATAJOS = [12, 30, 60, 90];

/**
 * Cuantos objetivos cumplidos llenan la barra de cada rama.
 *
 * Es la unica perilla del juego, y existe porque el ritmo de cada rama es
 * distinto: al gimnasio se va todos los dias, de trabajo no se cambia todos
 * los dias.
 */
export function MetasCategoria({
  usuarioId,
  categorias,
  metas,
}: {
  usuarioId: string;
  categorias: Categoria[];
  metas: Record<string, number>;
}) {
  const router = useRouter();
  const [valores, setValores] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      categorias.map((c) => [c.id, metas[c.id] ?? VOTOS_POR_NIVEL_DEFECTO]),
    ),
  );
  const [guardado, setGuardado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function guarda(categoriaId: string, valor: number) {
    const limpio = Math.min(365, Math.max(5, Math.round(valor)));
    setValores((v) => ({ ...v, [categoriaId]: limpio }));
    setError(null);

    try {
      await guardaMeta(usuarioId, categoriaId, limpio);
      setGuardado(categoriaId);
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar.'));
    }
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <ul className="divide-y divide-linea">
        {categorias.map((c) => {
          const valor = valores[c.id] ?? VOTOS_POR_NIVEL_DEFECTO;

          return (
            <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: c.color }}
              />
              <span className="min-w-24 flex-1 truncate text-sm">{c.nombre}</span>

              <span className="flex shrink-0 items-center gap-1">
                {ATAJOS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => guarda(c.id, a)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      valor === a
                        ? 'border-tinta text-tinta'
                        : 'border-linea text-humo hover:text-tinta'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </span>

              <input
                type="number"
                min={5}
                max={365}
                value={valor}
                onChange={(e) =>
                  setValores((v) => ({ ...v, [c.id]: Number(e.target.value) || 0 }))
                }
                onBlur={(e) => guarda(c.id, Number(e.target.value) || VOTOS_POR_NIVEL_DEFECTO)}
                aria-label={`Votos por nivel en ${c.nombre}`}
                className="w-16 rounded-lg border border-linea bg-white px-2 py-1 text-sm outline-none focus:border-tinta"
              />

              {guardado === c.id && <span className="text-xs text-humo">guardado</span>}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-humo">
        Por defecto 30: una acción diaria durante un mes llena la barra y sube un nivel.
      </p>
    </div>
  );
}
