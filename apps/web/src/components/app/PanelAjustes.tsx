'use client';

import { useEffect, useState } from 'react';

export type SeccionAjustes = {
  id: string;
  nombre: string;
  resumen: string;
  /** Una barra bajo el resumen, de 0 a 100, visible sin abrir la seccion. */
  medidor?: { etiqueta: string; porcentaje: number };
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

  // En escritorio la primera seccion nace abierta, porque la columna de la
  // derecha estaria vacia esperando un click. En telefono no: ahi la seccion
  // tapa la lista entera, y entrar a Ajustes sin ver que hay es peor que
  // elegir. Se decide en el cliente, que es donde se sabe el ancho.
  useEffect(() => {
    if (!window.matchMedia('(min-width: 768px)').matches) return;
    setActiva((previa) => previa ?? secciones[0]?.id ?? null);
  }, [secciones]);

  return (
    <div className="flex h-full min-h-0 gap-8">
      {/* Lista: siempre visible en escritorio, se esconde en movil al abrir. */}
      <nav className={`w-full shrink-0 md:block md:w-72 ${abierta ? 'hidden' : ''}`}>
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

                  {s.medidor && (
                    <span className="mt-2.5 block">
                      <span
                        className={`flex justify-between text-[11px] ${
                          seleccionada ? 'text-papel/70' : 'text-humo'
                        }`}
                      >
                        <span>{s.medidor.etiqueta}</span>
                        <span>{s.medidor.porcentaje}%</span>
                      </span>
                      <span
                        role="progressbar"
                        aria-label={s.medidor.etiqueta}
                        aria-valuenow={s.medidor.porcentaje}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className={`mt-1 block h-1 overflow-hidden rounded-full ${
                          seleccionada ? 'bg-papel/20' : 'bg-linea'
                        }`}
                      >
                        <span
                          className={`block h-full rounded-full transition-[width] duration-500 ${
                            seleccionada ? 'bg-papel' : 'bg-tinta'
                          }`}
                          style={{ width: `${s.medidor.porcentaje}%` }}
                        />
                      </span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className={`min-h-0 flex-1 overflow-y-auto pr-1 ${abierta ? '' : 'hidden md:block'}`}>
        {abierta && (
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
        )}
      </section>
    </div>
  );
}
