'use client';

import type { Pendiente } from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { borraPendiente, creaPendiente, mensajeError } from '@/lib/acciones';

/**
 * Los to-do del dia: lo que hay que hacer y no construye nada.
 *
 * No tienen rama, ni fecha, ni progreso, y marcarlos los borra. Existen para
 * que la cabeza los suelte, no para medir nada.
 */
export function Pendientes({
  usuarioId,
  pendientes,
}: {
  usuarioId: string;
  pendientes: Pendiente[];
}) {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [guardando, setGuardando] = useState(false);
  // Los que ya se marcaron: se van de la lista antes de que responda la base.
  const [idos, setIdos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const visibles = pendientes.filter((p) => !idos.includes(p.id));

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim() === '') return;

    setGuardando(true);
    setError(null);

    try {
      await creaPendiente(usuarioId, texto);
      setTexto('');
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo agregar.'));
    } finally {
      setGuardando(false);
    }
  }

  async function tachar(id: string) {
    setIdos((v) => [...v, id]);
    setError(null);

    try {
      await borraPendiente(id);
      router.refresh();
    } catch (e) {
      setIdos((v) => v.filter((x) => x !== id));
      setError(mensajeError(e, 'No se pudo marcar.'));
    }
  }

  return (
    <div>
      {visibles.length > 0 && (
        <ul className="mb-3">
          {visibles.map((p) => (
            <li key={p.id} className="flex items-center gap-3 border-b border-linea py-2.5 last:border-b-0">
              <button
                type="button"
                role="checkbox"
                aria-checked={false}
                aria-label={`Listo: ${p.titulo}`}
                onClick={() => tachar(p.id)}
                className="h-5 w-5 shrink-0 rounded-md border border-linea transition-colors hover:border-tinta"
              />
              <span className="min-w-0 flex-1 truncate text-[15px]">{p.titulo}</span>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={agregar} className="flex items-center gap-2">
        <input
          type="text"
          value={texto}
          maxLength={200}
          disabled={guardando}
          placeholder="Algo que hacer y olvidar"
          onChange={(e) => setTexto(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-linea bg-white px-4 py-2.5 text-sm outline-none placeholder:text-humo focus:border-tinta"
        />
        <button
          type="submit"
          disabled={guardando || texto.trim() === ''}
          className="shrink-0 rounded-full border border-linea px-4 py-2.5 text-sm font-medium text-humo transition-colors hover:border-tinta hover:text-tinta disabled:opacity-30"
        >
          Agregar
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
