'use client';

import { DIAS_PLAZO_DEFECTO, type DiasPlazo } from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { guardaPlazos, mensajeError } from '@/lib/acciones';

/** Cada plazo se escribe en la unidad en que se piensa, y se guarda en dias. */
const FILAS = [
  { clave: 'largo' as const, nombre: 'Largo plazo', unidad: 'años', porUnidad: 365, max: 50 },
  { clave: 'mediano' as const, nombre: 'Mediano plazo', unidad: 'meses', porUnidad: 30, max: 120 },
  { clave: 'corto' as const, nombre: 'Corto plazo', unidad: 'días', porUnidad: 1, max: 365 },
];

/**
 * Cuanto dura cada plazo. Largo plazo no significa lo mismo para todos: hay
 * vidas que se planean a diez anos y proyectos donde dos anos ya es lejisimos.
 *
 * Cambiarlo no mueve ninguna fecha ya escrita: solo cambia que dia se propone
 * al crear, y donde cae cada objetivo en el mapa.
 */
export function PlazosPorDefecto({
  usuarioId,
  plazos,
}: {
  usuarioId: string;
  plazos: DiasPlazo;
}) {
  const router = useRouter();
  const [valores, setValores] = useState<DiasPlazo>(plazos);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  async function guarda(siguiente: DiasPlazo) {
    // El orden lo exige la base: largo > mediano > corto.
    if (siguiente.largo <= siguiente.mediano || siguiente.mediano <= siguiente.corto) {
      setError('Largo tiene que ser más que mediano, y mediano más que corto.');
      return;
    }

    setError(null);
    try {
      await guardaPlazos(usuarioId, siguiente);
      setGuardado(true);
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar.'));
    }
  }

  return (
    <div>
      <ul className="divide-y divide-linea">
        {FILAS.map((fila) => {
          const enUnidad = Math.max(1, Math.round(valores[fila.clave] / fila.porUnidad));

          return (
            <li key={fila.clave} className="flex items-center gap-3 py-3">
              <span className="flex-1 text-sm">{fila.nombre}</span>

              <input
                type="number"
                min={1}
                max={fila.max}
                value={enUnidad}
                aria-label={`${fila.nombre} en ${fila.unidad}`}
                onChange={(e) => {
                  const cantidad = Math.max(1, Number(e.target.value) || 1);
                  setValores((v) => ({ ...v, [fila.clave]: cantidad * fila.porUnidad }));
                  setGuardado(false);
                }}
                onBlur={() => guarda(valores)}
                className="w-20 rounded-lg border border-linea bg-white px-2 py-1 text-sm outline-none focus:border-tinta"
              />

              <span className="w-12 text-xs text-humo">{fila.unidad}</span>
            </li>
          );
        })}
      </ul>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {guardado && !error && <p className="mt-3 text-xs text-humo">Guardado.</p>}

      <p className="mt-4 text-xs text-humo">
        De fábrica: {DIAS_PLAZO_DEFECTO.largo / 365} años, {DIAS_PLAZO_DEFECTO.mediano / 365} año y{' '}
        {DIAS_PLAZO_DEFECTO.corto} días. Cambiarlo no mueve ninguna fecha ya escrita.
      </p>
    </div>
  );
}
