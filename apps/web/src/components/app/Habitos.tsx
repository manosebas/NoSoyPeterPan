'use client';

import type { Habito } from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { borraHabito, creaHabito, marcaHabito, mensajeError } from '@/lib/acciones';

/**
 * Los habitos: tan simples como un to-do, pero vuelven sin marcar cada dia.
 * No tienen rama ni fecha, y no emiten voto.
 */
export function Habitos({
  usuarioId,
  hoy,
  habitos,
}: {
  usuarioId: string;
  hoy: string;
  habitos: Habito[];
}) {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [guardando, setGuardando] = useState(false);
  // Lo marcado se ve al instante; la base confirma despues.
  const [marcas, setMarcas] = useState<Record<string, boolean>>({});
  const [idos, setIdos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const visibles = habitos.filter((h) => !idos.includes(h.id));

  async function agregar(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim() === '') return;
    setGuardando(true);
    setError(null);
    try {
      await creaHabito(usuarioId, texto);
      setTexto('');
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo agregar.'));
    } finally {
      setGuardando(false);
    }
  }

  async function marcar(habito: Habito) {
    const hecho = !(marcas[habito.id] ?? habito.hechoHoy);
    setMarcas((m) => ({ ...m, [habito.id]: hecho }));
    setError(null);
    try {
      await marcaHabito(usuarioId, habito.id, hoy, hecho);
      router.refresh();
    } catch (e) {
      setMarcas((m) => ({ ...m, [habito.id]: !hecho }));
      setError(mensajeError(e, 'No se pudo marcar.'));
    }
  }

  async function quitar(id: string) {
    setIdos((v) => [...v, id]);
    setError(null);
    try {
      await borraHabito(id);
      router.refresh();
    } catch (e) {
      setIdos((v) => v.filter((x) => x !== id));
      setError(mensajeError(e, 'No se pudo quitar.'));
    }
  }

  return (
    <div>
      {visibles.length > 0 && (
        <ul className="mb-3">
          {visibles.map((h) => {
            const hecho = marcas[h.id] ?? h.hechoHoy;

            return (
              <li
                key={h.id}
                className="group flex items-center gap-3 border-b border-linea py-2.5 last:border-b-0"
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={hecho}
                  aria-label={h.titulo}
                  onClick={() => marcar(h)}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] transition-colors ${
                    hecho ? 'border-tinta bg-tinta text-papel' : 'border-linea hover:border-tinta'
                  }`}
                >
                  {hecho && '✓'}
                </button>
                <span
                  className={`min-w-0 flex-1 truncate text-[15px] ${hecho ? 'text-humo line-through' : ''}`}
                >
                  {h.titulo}
                </span>
                <button
                  type="button"
                  onClick={() => quitar(h.id)}
                  aria-label={`Quitar ${h.titulo}`}
                  title="Quitar hábito"
                  className="shrink-0 px-1 text-humo transition-opacity hover:text-tinta sm:opacity-0 sm:group-hover:opacity-100"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={agregar} className="flex items-center gap-2">
        <input
          type="text"
          value={texto}
          maxLength={200}
          disabled={guardando}
          placeholder="Algo que haces cada día"
          onChange={(e) => setTexto(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-linea bg-white px-4 py-2.5 text-base outline-none placeholder:text-humo focus:border-tinta sm:text-sm"
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
