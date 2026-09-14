'use client';

import {
  fechaDePlazo,
  PLAZOS,
  type DiasPlazo,
  type PasoPropuesto,
  type Plazo,
  type PropuestaDesglose,
} from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { recorta } from '@/components/app/CamposObjetivo';
import { Modal } from '@/components/app/Modal';
import { creaDesglose, mensajeError, type PasoNuevo } from '@/lib/acciones';
import { postApi } from '@/lib/api';

export type DisponibilidadIA = 'con_ia' | 'sin_plan' | 'sin_saldo';

type PasoEditable = PasoPropuesto & { elegido: boolean };

type Fase = 'cerrado' | 'pensando' | 'eligiendo' | 'guardando';

const FRASES = [
  'Leyendo tu objetivo…',
  'Buscando por dónde empezar…',
  'Partiéndolo en pasos…',
  'Bajándolo hasta hoy…',
];

/**
 * Desglose con IA. La IA propone un arbol; la persona marca, desmarca y
 * corrige en vivo, y al guardar entra al mapa exactamente como lo dejo. Nada
 * toca la base hasta ese momento.
 */
export function DesgloseIA({
  objetivoId,
  usuarioId,
  categoriaId,
  venceEl,
  ordenInicial,
  dias,
  disponibilidad,
}: {
  objetivoId: string;
  usuarioId: string;
  /** Los pasos heredan la rama del objetivo. */
  categoriaId: string;
  /** Tope de fecha para los pasos directos. */
  venceEl: string | null;
  /** Donde empiezan los pasos nuevos entre los hijos que ya tiene. */
  ordenInicial: number;
  dias: DiasPlazo;
  disponibilidad: DisponibilidadIA;
}) {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>('cerrado');
  const [error, setError] = useState<string | null>(null);
  const [observacion, setObservacion] = useState<string | null>(null);
  const [pasos, setPasos] = useState<PasoEditable[]>([]);

  const elegidos = pasos.filter((p) => p.elegido);
  const faltaTitulo = elegidos.some((p) => p.titulo.trim() === '');

  async function desglosar() {
    setFase('pensando');
    setError(null);
    try {
      const propuesta = await postApi<PropuestaDesglose>('/api/ia/desglose', { objetivoId });
      setObservacion(propuesta.observacion);
      setPasos(propuesta.pasos.map((p) => ({ ...p, elegido: true })));
      setFase('eligiendo');
    } catch (e) {
      setError(mensajeError(e, 'La IA no respondió. Intenta de nuevo.'));
      setFase('cerrado');
    }
  }

  function cambia(ref: string, campos: Partial<PasoEditable>) {
    setPasos((previos) => previos.map((p) => (p.ref === ref ? { ...p, ...campos } : p)));
  }

  /**
   * Desmarcar un paso desmarca su rama: un hijo sin padre quedaria huerfano.
   * Marcarlo marca su camino hacia arriba, por la misma razon.
   */
  function elige(ref: string, elegido: boolean) {
    setPasos((previos) => {
      const afectados = new Set([ref]);
      if (elegido) {
        let padre = previos.find((p) => p.ref === ref)?.padre ?? null;
        while (padre) {
          afectados.add(padre);
          padre = previos.find((p) => p.ref === padre)?.padre ?? null;
        }
      } else {
        // Los padres vienen antes que sus hijos: una pasada basta.
        for (const p of previos) if (p.padre && afectados.has(p.padre)) afectados.add(p.ref);
      }
      return previos.map((p) => (afectados.has(p.ref) ? { ...p, elegido } : p));
    });
  }

  async function guardar() {
    setFase('guardando');
    setError(null);

    const ids = new Map<string, string>();
    const fechas = new Map<string, string>();
    const hermanos = new Map<string | null, number>();

    const nuevos: PasoNuevo[] = elegidos.map((paso) => {
      const id = crypto.randomUUID();
      ids.set(paso.ref, id);

      const topePadre = paso.padre ? (fechas.get(paso.padre) ?? null) : venceEl;
      const venceElPaso = recorta(fechaDePlazo(paso.plazo, dias), topePadre);
      fechas.set(paso.ref, venceElPaso);

      const posicion = hermanos.get(paso.padre) ?? 0;
      hermanos.set(paso.padre, posicion + 1);

      return {
        id,
        padreId: paso.padre ? ids.get(paso.padre)! : objetivoId,
        titulo: paso.titulo,
        detalle: paso.detalle,
        venceEl: venceElPaso,
        orden: paso.padre ? posicion : ordenInicial + posicion,
      };
    });

    try {
      await creaDesglose(usuarioId, categoriaId, nuevos);
      setFase('cerrado');
      setPasos([]);
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo guardar el desglose.'));
      setFase('eligiendo');
    }
  }

  function descarta() {
    setFase('cerrado');
    setPasos([]);
    setError(null);
  }

  return (
    <div>
      <button
        type="button"
        disabled={disponibilidad !== 'con_ia' || fase !== 'cerrado'}
        onClick={desglosar}
        className="inline-flex items-center gap-2 rounded-full border border-tinta px-4 py-2 text-sm font-medium transition-colors hover:bg-tinta hover:text-papel disabled:border-linea disabled:text-humo disabled:hover:bg-transparent"
      >
        <span aria-hidden>✦</span> Desglosar con IA
      </button>

      {disponibilidad === 'sin_plan' && (
        <p className="mt-2 text-xs text-humo">La IA viene con los planes Básico y Pro.</p>
      )}
      {disponibilidad === 'sin_saldo' && (
        <p className="mt-2 text-xs text-humo">Se te acabó la IA de este mes.</p>
      )}
      {error && fase === 'cerrado' && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {fase === 'pensando' && (
        // Mientras piensa no se cierra: la llamada ya esta en camino y se cobra igual.
        <Modal titulo="Desglosar con IA" onCerrar={() => {}}>
          <Pensando />
        </Modal>
      )}

      {(fase === 'eligiendo' || fase === 'guardando') && (
        <Modal titulo="Tu desglose" onCerrar={fase === 'guardando' ? () => {} : descarta} ancho>
          <p className="text-sm text-humo">
            Quédate con lo que te sirve. Corrige lo que quieras: nada se guarda hasta que lo
            agregues.
          </p>

          {observacion && (
            <p className="mt-4 rounded-lg border border-linea bg-papel p-3 text-sm leading-relaxed">
              {observacion}
            </p>
          )}

          <div className="mt-5">
            <Rama pasos={pasos} padre={null} nivel={0} onCambia={cambia} onElige={elige} />
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-between gap-3 border-t border-linea bg-white px-6 pt-4">
            <button
              type="button"
              disabled={fase === 'guardando'}
              onClick={descarta}
              className="text-sm text-humo transition-colors hover:text-tinta disabled:opacity-40"
            >
              Descartar
            </button>
            <button
              type="button"
              disabled={fase === 'guardando' || elegidos.length === 0 || faltaTitulo}
              onClick={guardar}
              className="rounded-full bg-tinta px-5 py-2.5 text-sm font-semibold text-papel transition-opacity hover:opacity-80 disabled:opacity-30"
            >
              {fase === 'guardando'
                ? 'Guardando…'
                : `Agregar ${elegidos.length} ${elegidos.length === 1 ? 'paso' : 'pasos'} al mapa`}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Pensando() {
  const [frase, setFrase] = useState(0);

  useEffect(() => {
    const reloj = setInterval(() => setFrase((f) => (f + 1) % FRASES.length), 2600);
    return () => clearInterval(reloj);
  }, []);

  return (
    <div className="flex flex-col items-center py-10 text-center" role="status" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-tinta"
            style={{ animationDelay: `${i * 180}ms` }}
          />
        ))}
      </div>
      <p className="mt-5 text-sm text-humo">{FRASES[frase]}</p>
    </div>
  );
}

/** Los hijos de `padre`, cada uno con su propia rama debajo. */
function Rama({
  pasos,
  padre,
  nivel,
  onCambia,
  onElige,
}: {
  pasos: PasoEditable[];
  padre: string | null;
  nivel: number;
  onCambia: (ref: string, campos: Partial<PasoEditable>) => void;
  onElige: (ref: string, elegido: boolean) => void;
}) {
  const hijos = pasos.filter((p) => p.padre === padre);
  if (hijos.length === 0) return null;

  return (
    <ul className={nivel > 0 ? 'ml-3 border-l border-linea pl-4 sm:ml-4' : ''}>
      {hijos.map((paso) => (
        <li key={paso.ref} className="py-2">
          <div className={`flex items-start gap-3 ${paso.elegido ? '' : 'opacity-40'}`}>
            <input
              type="checkbox"
              checked={paso.elegido}
              onChange={(e) => onElige(paso.ref, e.target.checked)}
              aria-label={`Incluir ${paso.titulo}`}
              className="mt-1.5 h-4 w-4 shrink-0 accent-tinta"
            />

            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={paso.titulo}
                maxLength={200}
                disabled={!paso.elegido}
                onChange={(e) => onCambia(paso.ref, { titulo: e.target.value })}
                className="w-full border-0 border-b border-transparent bg-transparent px-0 py-0.5 text-base font-medium outline-none focus:border-tinta sm:text-[15px]"
              />
              <textarea
                value={paso.detalle}
                rows={2}
                maxLength={2000}
                disabled={!paso.elegido}
                onChange={(e) => onCambia(paso.ref, { detalle: e.target.value })}
                className="mt-0.5 w-full resize-none border-0 border-b border-transparent bg-transparent px-0 text-base leading-relaxed text-humo outline-none focus:border-linea sm:text-sm"
              />
              <select
                value={paso.plazo}
                disabled={!paso.elegido}
                onChange={(e) => onCambia(paso.ref, { plazo: e.target.value as Plazo })}
                className="mt-1 rounded-full border border-linea bg-transparent px-2.5 py-0.5 text-xs text-humo outline-none focus:border-tinta"
              >
                {PLAZOS.map((p) => (
                  <option key={p.clave} value={p.clave}>
                    {p.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Rama pasos={pasos} padre={paso.ref} nivel={nivel + 1} onCambia={onCambia} onElige={onElige} />
        </li>
      ))}
    </ul>
  );
}
