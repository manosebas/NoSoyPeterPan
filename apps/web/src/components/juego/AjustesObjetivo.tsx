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
import { PIDE_DETALLE, recorta, TOPE_DETALLE } from '@/components/juego/CamposObjetivo';
import { Modal, ModalConfirmar } from '@/components/juego/Modal';
import { actualizaObjetivo, borraObjetivo, mensajeError } from '@/lib/acciones';

/**
 * Lo que se puede cambiar de un objetivo ya creado: de que se trata, a que
 * rama aporta, para cuando es, y si sigue existiendo. Vive detras del icono de ajustes porque no
 * es a lo que se viene: la pantalla es para desglosar y marcar.
 */
export function AjustesObjetivo({
  id,
  categoriaId,
  detalle,
  venceEl,
  padreVenceEl,
  tieneHijos,
  categorias,
  dias,
  volverA,
}: {
  id: string;
  categoriaId: string;
  detalle: string | null;
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
  const [texto, setTexto] = useState(detalle ?? '');

  const lectura = leePlazo(venceEl, dias);
  // Tras guardar, `router.refresh()` trae el detalle nuevo por prop y los dos
  // vuelven a coincidir: el boton se apaga solo, sin avisos que celebrar.
  const sinGuardar = texto.trim() !== (detalle ?? '');

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
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a7.7 7.7 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.5 6.5 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.5 6.5 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.9 6.9 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>

      {abierto && (
        <Modal titulo="Ajustar objetivo" onCerrar={() => setAbierto(false)}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">Detalle</p>
          <textarea
            value={texto}
            rows={4}
            maxLength={TOPE_DETALLE}
            placeholder={PIDE_DETALLE}
            onChange={(e) => setTexto(e.target.value)}
            className="mt-2 w-full resize-none rounded-lg border border-linea bg-transparent p-3 text-sm leading-relaxed outline-none placeholder:text-humo focus:border-tinta"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              disabled={ocupado || !sinGuardar}
              onClick={() => corre(() => actualizaObjetivo(id, { detalle: texto.trim() || null }))}
              className="rounded-full border border-linea px-4 py-1.5 text-xs font-medium transition-colors hover:border-tinta disabled:opacity-30"
            >
              Guardar detalle
            </button>
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-humo">Rama</p>
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
