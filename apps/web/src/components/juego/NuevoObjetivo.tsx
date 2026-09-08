'use client';

import { fechaDePlazo, plazoPorDefecto, PLAZOS, type Categoria, type Plazo } from '@nspp/shared';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { creaObjetivo, mensajeError } from '@/lib/acciones';

type Eleccion = Plazo | 'sin_fecha';

/**
 * Alta de un objetivo. Sirve para las tres cosas que se crean: una raiz nueva,
 * el desglose de un objetivo y algo suelto del dia.
 *
 * El plazo llega elegido segun la altura del arbol, porque mientras mas abajo
 * mas cerca esta la fecha. Se puede cambiar siempre.
 */
export function NuevoObjetivo({
  usuarioId,
  padreId,
  padreVenceEl,
  categoriaHeredada,
  categorias,
  profundidad,
  suelto = false,
  etiqueta,
  abiertoAlInicio = false,
}: {
  usuarioId: string;
  padreId: string | null;
  padreVenceEl?: string | null;
  categoriaHeredada?: string;
  categorias: Categoria[];
  profundidad: number;
  suelto?: boolean;
  etiqueta: string;
  abiertoAlInicio?: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(abiertoAlInicio);
  const [titulo, setTitulo] = useState('');
  const [plazo, setPlazo] = useState<Eleccion>(suelto ? 'semana' : plazoPorDefecto(profundidad));
  const [categoriaId, setCategoriaId] = useState(categoriaHeredada ?? categorias[0]?.id ?? 'salud');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fechaElegida(): string | null {
    if (plazo === 'sin_fecha') return null;
    if (suelto) return new Date().toISOString().slice(0, 10);

    const propuesta = fechaDePlazo(plazo);
    // Un paso no puede vencer despues del objetivo del que cuelga: la base lo
    // rechaza, asi que aqui se recorta antes de que sea un error.
    return padreVenceEl && propuesta > padreVenceEl ? padreVenceEl : propuesta;
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (titulo.trim() === '') return;

    setGuardando(true);
    setError(null);

    try {
      await creaObjetivo({
        usuarioId,
        padreId,
        categoriaId: categoriaHeredada ?? categoriaId,
        titulo,
        venceEl: fechaElegida(),
        suelto,
      });

      setTitulo('');
      if (!abiertoAlInicio) setAbierto(false);
      router.refresh();
    } catch (e) {
      setError(mensajeError(e, 'No se pudo crear.'));
    } finally {
      setGuardando(false);
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="w-full rounded-lg border border-dashed border-linea px-4 py-3 text-left text-sm text-humo transition-colors hover:border-tinta hover:text-tinta"
      >
        + {etiqueta}
      </button>
    );
  }

  return (
    <form onSubmit={enviar} className="rounded-lg border border-linea bg-white p-4">
      <input
        autoFocus
        type="text"
        value={titulo}
        maxLength={200}
        placeholder={etiqueta}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full border-0 bg-transparent p-0 text-base outline-none placeholder:text-humo"
      />

      {!categoriaHeredada && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoriaId(c.id)}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors"
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
      )}

      {!suelto && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[...PLAZOS, { clave: 'sin_fecha' as const, etiqueta: 'Sin fecha' }].map((p) => (
            <button
              key={p.clave}
              type="button"
              onClick={() => setPlazo(p.clave as Eleccion)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                plazo === p.clave
                  ? 'border-tinta text-tinta'
                  : 'border-linea text-humo hover:text-tinta'
              }`}
            >
              {p.etiqueta}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          disabled={guardando || titulo.trim() === ''}
          className="rounded-full bg-tinta px-5 py-2 text-sm font-semibold text-papel transition-opacity hover:opacity-80 disabled:opacity-30"
        >
          {guardando ? 'Un momento…' : 'Agregar'}
        </button>
        {!abiertoAlInicio && (
          <button
            type="button"
            onClick={() => {
              setAbierto(false);
              setError(null);
            }}
            className="px-2 text-sm text-humo transition-colors hover:text-tinta"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
