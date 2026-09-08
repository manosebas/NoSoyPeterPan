'use client';

import {
  fechaDePlazo,
  leePlazo,
  PLAZOS,
  textoDuracion,
  type Categoria,
  type DiasPlazo,
  type Plazo,
} from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { recorta } from '@/components/juego/CamposObjetivo';
import { Modal, ModalConfirmar } from '@/components/juego/Modal';
import { actualizaObjetivo, borraObjetivo, mensajeError } from '@/lib/acciones';

/**
 * Lo que se puede cambiar de un objetivo ya creado: a que rama aporta, para
 * cuando es, y si sigue existiendo. Vive detras del icono de ajustes porque no
 * es a lo que se viene: la pantalla es para desglosar y marcar.
 */
export function AjustesObjetivo({
  id,
  categoriaId,
  venceEl,
  padreVenceEl,
  tieneHijos,
  categorias,
  dias,
  volverA,
}: {
  id: string;
  categoriaId: string;
  venceEl: string | null;
  padreVenceEl: string | null;
  tieneHijos: boolean;
  categorias: Categoria[];
  dias: DiasPlazo;
  volverA: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lectura = leePlazo(venceEl, dias);

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
    const fecha = recorta(fechaDePlazo(plazo, dias), padreVenceEl);
    return corre(() => actualizaObjetivo(id, { venceEl: fecha }));
  }

  async function borrar() {
    setOcupado(true);
    setError(null);
    try {
      await borraObjetivo(id);
      router.push(volverA);
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo borrar.'));
      setOcupado(false);
      setConfirmando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Ajustar objetivo"
        title="Ajustar"
        className="rounded-full border border-linea p-2 text-humo transition-colors hover:border-tinta hover:text-tinta"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="10" r="2.6" />
          <path d="M10 2.2v2M10 15.8v2M17.8 10h-2M4.2 10h-2M15.5 4.5l-1.4 1.4M5.9 14.1l-1.4 1.4M15.5 15.5l-1.4-1.4M5.9 5.9L4.5 4.5" strokeLinecap="round" />
        </svg>
      </button>

      {abierto && (
        <Modal titulo="Ajustar objetivo" onCerrar={() => setAbierto(false)}>
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

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-humo">
            Para cuándo
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PLAZOS.map((p) => (
              <button
                key={p.clave}
                type="button"
                disabled={ocupado}
                onClick={() => cambiaPlazo(p.clave)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40 ${
                  lectura === p.clave
                    ? 'border-tinta text-tinta'
                    : 'border-linea text-humo hover:text-tinta'
                }`}
              >
                {p.etiqueta}
                <span className="ml-1.5 text-humo">{textoDuracion(p.clave, dias)}</span>
              </button>
            ))}

            <button
              type="button"
              disabled={ocupado}
              onClick={() => cambiaPlazo('sin_fecha')}
              className={`rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40 ${
                lectura === 'sin_fecha'
                  ? 'border-tinta text-tinta'
                  : 'border-linea text-humo hover:text-tinta'
              }`}
            >
              Sin fecha
            </button>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex items-center justify-between border-t border-linea pt-4">
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
              onClick={() => setConfirmando(true)}
              className="text-sm text-red-600 transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Borrar objetivo
            </button>
          </div>
        </Modal>
      )}

      {confirmando && (
        <ModalConfirmar
          titulo="¿Borrar este objetivo?"
          descripcion={
            tieneHijos
              ? 'Se borra también todo su desglose, y los votos que ya emitió se quedan: lo que construiste no se deshace.'
              : 'No se puede deshacer. Si ya lo cumpliste, su voto se queda contigo.'
          }
          textoConfirmar="Borrar"
          ocupado={ocupado}
          onConfirmar={borrar}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </>
  );
}
