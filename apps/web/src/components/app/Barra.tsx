/** Barra de progreso. El color lo pone la rama; el fondo es siempre el mismo. */
export function Barra({
  fraccion,
  color,
  alto = 'h-2',
}: {
  fraccion: number;
  color: string;
  alto?: string;
}) {
  const porcentaje = Math.round(Math.min(1, Math.max(0, fraccion)) * 100);

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-linea ${alto}`}
      role="progressbar"
      aria-valuenow={porcentaje}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${porcentaje}%`, backgroundColor: color }}
      />
    </div>
  );
}

/** Punto de color: la firma de una rama cuando no cabe su nombre. */
export function Punto({ color, titulo }: { color: string; titulo?: string }) {
  return (
    <span
      title={titulo}
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}
