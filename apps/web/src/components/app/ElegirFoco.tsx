'use client';

import type { Categoria } from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { eligeFoco, mensajeError } from '@/lib/acciones';
import type { Linea } from '@/lib/foco';

/** Cuantos candidatos se muestran para elegir. Mas que eso ya no es elegir, es leer. */
const A_LA_VISTA = 10;

/**
 * Modo elegir: la persona escoge los pasos de su dia entre los candidatos, ya
 * ordenados por urgencia y rotacion. Se puede elegir hasta el cupo del dia.
 */
export function ElegirFoco({
  usuarioId,
  hoy,
  candidatos,
  cupo,
  categorias,
  sumando = false,
}: {
  usuarioId: string;
  hoy: string;
  candidatos: Linea[];
  /** Cuantos se pueden escoger. */
  cupo: number;
  categorias: Record<string, Categoria>;
  /** Ya eligio hoy y esta sumando uno mas: el texto cambia, no la mecanica. */
  sumando?: boolean;
}) {
  const router = useRouter();
  const [refrescando, refresca] = useTransition();
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lleno = elegidos.length >= cupo;

  function alterna(id: string) {
    setElegidos((v) => (v.includes(id) ? v.filter((x) => x !== id) : lleno ? v : [...v, id]));
  }

  async function confirmar() {
    setGuardando(true);
    setError(null);
    try {
      await eligeFoco(usuarioId, elegidos, hoy);
      refresca(() => router.push('/hoy'));
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar tu elección.'));
      setGuardando(false);
    }
  }

  return (
    <div className="rounded-xl border border-linea bg-white p-4 sm:p-5">
      <p className="text-sm font-medium">
        {sumando ? 'Elige qué más haces hoy.' : `Elige ${cupo === 1 ? 'el paso' : `hasta ${cupo} pasos`} de hoy.`}
      </p>
      <p className="mt-1 text-xs text-humo">
        Van primero los que vencen antes y los de ramas que llevan días sin avanzar.
      </p>

      <ul className="mt-4 divide-y divide-linea">
        {candidatos.slice(0, A_LA_VISTA).map(({ nodo, camino }) => {
          const marcado = elegidos.includes(nodo.id);
          const categoria = categorias[nodo.categoriaId];
          const raiz = camino[0]?.titulo;

          return (
            <li key={nodo.id}>
              <label
                className={`flex cursor-pointer items-start gap-3 py-2.5 ${
                  !marcado && lleno ? 'cursor-not-allowed opacity-40' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={marcado}
                  disabled={!marcado && lleno}
                  onChange={() => alterna(nodo.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-tinta"
                />
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm leading-snug">{nodo.titulo}</span>
                  <span className="mt-0.5 block truncate text-xs text-humo">
                    <span style={{ color: categoria?.color }}>{categoria?.nombre}</span>
                    {raiz && <> · {raiz}</>}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-humo">
          {elegidos.length} de {cupo}
        </span>
        <button
          type="button"
          disabled={elegidos.length === 0 || guardando || refrescando}
          onClick={confirmar}
          className="rounded-full bg-tinta px-5 py-2 text-sm font-semibold text-papel transition-opacity hover:opacity-80 disabled:opacity-30"
        >
          {guardando || refrescando ? 'Un momento…' : sumando ? 'Sumar' : 'Empezar el día'}
        </button>
      </div>
    </div>
  );
}
