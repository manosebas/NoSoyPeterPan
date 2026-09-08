'use client';

import { useState } from 'react';

export type SeccionAjustes = {
  id: string;
  nombre: string;
  resumen: string;
  contenido: React.ReactNode;
};

/**
 * Ajustes en dos columnas: la lista de secciones a la izquierda y solo la que
 * elegiste a la derecha. Todo junto era una pagina larga donde configurar una
 * cosa obligaba a pasar por todas las demas.
 *
 * En movil la lista se convierte en pantalla completa y la seccion la reemplaza,
 * con un boton para volver: dos columnas no caben, y media columna no sirve.
 */
export function PanelAjustes({ secciones }: { secciones: SeccionAjustes[] }) {
  const [activa, setActiva] = useState<string | null>(null);
  const abierta = secciones.find((s) => s.id === activa) ?? null;

  return (
    <div className="flex h-full min-h-0 gap-8">
      {/* Lista: siempre visible en escritorio, se esconde en movil al abrir. */}
      <nav className={`w-full shrink-0 md:block md:w-64 ${abierta ? 'hidden' : ''}`}>
        <ul className="space-y-1">
          {secciones.map((s) => {
            const seleccionada = s.id === abierta?.id;

            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiva(s.id)}
                  className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${
                    seleccionada ? 'bg-tinta text-papel' : 'hover:bg-white'
                  }`}
                >
                  <span className="block text-sm font-medium">{s.nombre}</span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      seleccionada ? 'text-papel/70' : 'text-humo'
                    }`}
                  >
                    {s.resumen}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className={`min-h-0 flex-1 overflow-y-auto pr-1 ${abierta ? '' : 'hidden md:block'}`}>
        {abierta ? (
          <>
            <button
              type="button"
              onClick={() => setActiva(null)}
              className="mb-4 inline-flex items-center gap-1.5 text-xs text-humo transition-colors hover:text-tinta md:hidden"
            >
              <span aria-hidden>←</span> Ajustes
            </button>

            <h2 className="text-lg font-semibold tracking-tight">{abierta.nombre}</h2>
            <p className="mt-1 text-sm text-humo">{abierta.resumen}</p>

            <div className="mt-6 pb-4">{abierta.contenido}</div>
          </>
        ) : (
          <p className="pt-2 text-sm text-humo">Elige qué quieres configurar.</p>
        )}
      </section>
    </div>
  );
}
