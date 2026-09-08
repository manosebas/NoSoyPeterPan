'use client';

import { useEffect, useRef } from 'react';

/**
 * Ventana modal. Se cierra con Escape, con el fondo o con su boton; el foco
 * entra al abrir para que el teclado no se quede atras.
 */
export function Modal({
  titulo,
  onCerrar,
  children,
}: {
  titulo: string;
  onCerrar: () => void;
  children: React.ReactNode;
}) {
  const caja = useRef<HTMLDivElement>(null);

  // El cierre vive en una ref para que el efecto de abajo corra una sola vez.
  // Con `onCerrar` en las dependencias se re-ejecutaba en cada tecla y devolvia
  // el foco al contenedor: se podia escribir una sola letra por vez.
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;

  useEffect(() => {
    function alEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') cerrar.current();
    }

    document.addEventListener('keydown', alEscape);
    // El fondo no se desplaza mientras el modal esta abierto.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Solo si adentro no hay ya algo enfocado: el campo con autoFocus manda.
    if (!caja.current?.contains(document.activeElement)) {
      caja.current?.focus({ preventScroll: true });
    }

    return () => {
      document.removeEventListener('keydown', alEscape);
      document.body.style.overflow = overflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/30 p-0 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        className="w-full max-w-md rounded-t-2xl border border-linea bg-white p-6 outline-none sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-mr-1 -mt-1 rounded-full p-1 text-humo transition-colors hover:text-tinta"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/** Confirmacion de algo que no se puede deshacer. */
export function ModalConfirmar({
  titulo,
  descripcion,
  textoConfirmar,
  ocupado = false,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  descripcion: string;
  textoConfirmar: string;
  ocupado?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <Modal titulo={titulo} onCerrar={onCancelar}>
      <p className="text-sm text-humo">{descripcion}</p>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-humo transition-colors hover:text-tinta"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={ocupado}
          onClick={onConfirmar}
          className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {ocupado ? 'Un momento…' : textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
