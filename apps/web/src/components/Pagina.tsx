/**
 * Marco de toda pantalla con sesion. Una sola medida para todas: antes cada
 * pagina elegia su ancho y la app se veia como tres apps distintas.
 *
 * `fija` deja la pagina en exactamente una pantalla, sin scroll propio, para
 * las que manejan su desplazamiento por dentro (Ajustes).
 */
export function Pagina({
  children,
  fija = false,
}: {
  children: React.ReactNode;
  fija?: boolean;
}) {
  return (
    <div
      className={`mx-auto flex w-full max-w-6xl flex-col px-6 py-8 ${
        fija ? 'h-dvh overflow-hidden' : 'min-h-dvh'
      }`}
    >
      {children}
    </div>
  );
}
