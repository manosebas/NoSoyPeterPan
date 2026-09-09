'use client';

import { useEffect, useState } from 'react';

export type ModoMapa = 'cascada' | 'ramas';

const MODOS: { clave: ModoMapa; etiqueta: string; explica: string }[] = [
  { clave: 'cascada', etiqueta: 'Cascada', explica: 'Por plazo, con el desglose completo.' },
  { clave: 'ramas', etiqueta: 'Categorías', explica: 'Por parte de tu vida, con su fuerza.' },
];

const LLAVE = 'nspp:vista-mapa';

/**
 * Los dos modos del mapa. El mismo arbol mirado desde distinta altura: por
 * cuando (cascada) y por que parte de tu vida (categorias).
 *
 * El modo elegido se recuerda en este navegador; si no se puede leer, se
 * empieza por cascada y no pasa nada.
 */
export function VistaMapa({ cascada, ramas }: { cascada: React.ReactNode; ramas: React.ReactNode }) {
  const [modo, setModo] = useState<ModoMapa>('cascada');

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(LLAVE);
      // Lo guardado puede ser un modo que ya no existe: se ignora.
      if (guardado === 'cascada' || guardado === 'ramas') setModo(guardado);
    } catch {
      // Navegador sin almacenamiento: se queda en cascada.
    }
  }, []);

  function elige(nuevo: ModoMapa) {
    setModo(nuevo);
    try {
      localStorage.setItem(LLAVE, nuevo);
    } catch {
      // Da igual: es una preferencia, no un dato.
    }
  }

  const actual = MODOS.find((m) => m.clave === modo);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full border border-linea p-1 text-sm">
          {MODOS.map((m) => (
            <button
              key={m.clave}
              type="button"
              onClick={() => elige(m.clave)}
              aria-pressed={modo === m.clave}
              className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                modo === m.clave ? 'bg-tinta text-papel' : 'text-humo hover:text-tinta'
              }`}
            >
              {m.etiqueta}
            </button>
          ))}
        </div>

        <p className="text-xs text-humo">{actual?.explica}</p>
      </div>

      <div className="mt-8">
        {modo === 'cascada' && cascada}
        {modo === 'ramas' && ramas}
      </div>
    </>
  );
}
