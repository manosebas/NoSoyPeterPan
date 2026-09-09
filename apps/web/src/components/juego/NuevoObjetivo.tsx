'use client';

import {
  fechaDePlazo,
  leePlazo,
  plazoDebajoDe,
  plazoPorDefecto,
  type Categoria,
  type DiasPlazo,
} from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CamposObjetivo, recorta, type Eleccion } from '@/components/juego/CamposObjetivo';
import { Modal } from '@/components/juego/Modal';
import { creaObjetivo, mensajeError } from '@/lib/acciones';

/**
 * Alta de un objetivo. En el mapa se abre como modal desde el boton esquinero;
 * dentro de un objetivo, como formulario en linea para desglosarlo.
 */
export function NuevoObjetivo({
  usuarioId,
  padreId,
  padreVenceEl,
  categoriaHeredada,
  categorias,
  profundidad,
  dias,
  etiqueta,
  titulo = 'Nuevo objetivo',
  comoModal = false,
  destacado = false,
}: {
  usuarioId: string;
  padreId: string | null;
  padreVenceEl?: string | null;
  /** Con rama heredada no se pregunta la categoria: la pone el padre. */
  categoriaHeredada?: string;
  categorias: Categoria[];
  profundidad: number;
  dias: DiasPlazo;
  /** Texto del boton que abre el formulario. */
  etiqueta: string;
  titulo?: string;
  comoModal?: boolean;
  destacado?: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  // El plazo llega elegido un escalon por debajo del padre: lo que cuelga de
  // algo siempre vence antes que ese algo. Sin padre con fecha no hay de donde
  // deducirlo y se cae en la altura del arbol.
  const [plazo, setPlazo] = useState<Eleccion>(() => plazoInicial(padreVenceEl, dias, profundidad));
  const [categoriaId, setCategoriaId] = useState(categoriaHeredada ?? categorias[0]?.id ?? 'salud');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cierra() {
    setAbierto(false);
    setError(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (texto.trim() === '') return;

    setGuardando(true);
    setError(null);

    try {
      await creaObjetivo({
        usuarioId,
        padreId,
        categoriaId: categoriaHeredada ?? categoriaId,
        titulo: texto,
        venceEl: plazo === 'sin_fecha' ? null : recorta(fechaDePlazo(plazo, dias), padreVenceEl),
      });

      setTexto('');
      cierra();
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo crear.'));
    } finally {
      setGuardando(false);
    }
  }

  const campos = (
    <form onSubmit={enviar}>
      <CamposObjetivo
        titulo={texto}
        onTitulo={setTexto}
        categoriaId={categoriaId}
        onCategoria={categoriaHeredada ? undefined : setCategoriaId}
        categorias={categorias}
        plazo={plazo}
        onPlazo={setPlazo}
        dias={dias}
        topeFecha={padreVenceEl}
        autoFoco
      />

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={cierra}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-humo transition-colors hover:text-tinta"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando || texto.trim() === ''}
          className="rounded-full bg-tinta px-5 py-2.5 text-sm font-semibold text-papel transition-opacity hover:opacity-80 disabled:opacity-30"
        >
          {guardando ? 'Un momento…' : 'Agregar'}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className={
          destacado
            ? 'rounded-full bg-tinta px-5 py-2.5 text-sm font-semibold text-papel transition-opacity hover:opacity-80'
            : 'w-full rounded-lg border border-dashed border-linea px-4 py-3 text-left text-sm text-humo transition-colors hover:border-tinta hover:text-tinta'
        }
      >
        {destacado ? etiqueta : `+ ${etiqueta}`}
      </button>

      {abierto &&
        (comoModal ? (
          <Modal titulo={titulo} onCerrar={cierra}>
            {campos}
          </Modal>
        ) : (
          <div className="mt-3 rounded-lg border border-linea bg-white p-4">{campos}</div>
        ))}
    </>
  );
}

/** El plazo que aparece marcado al abrir el formulario. */
function plazoInicial(
  padreVenceEl: string | null | undefined,
  dias: DiasPlazo,
  profundidad: number,
): Eleccion {
  const padre = leePlazo(padreVenceEl ?? null, dias);
  // Raiz, o padre en Nunca Jamas: no hay escalon del cual bajar.
  if (padre === 'sin_fecha') return plazoPorDefecto(profundidad);
  // Vencido no es un plazo, es una deuda: lo que cuelga de eso se hace ya.
  if (padre === 'vencido') return 'semana';
  return plazoDebajoDe(padre);
}
