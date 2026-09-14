/**
 * Lo que se ve mientras la pantalla siguiente llega. Repite el marco y la
 * cabecera reales para que la navegacion no parpadee ni salte: cambia el
 * contenido, no la pagina.
 *
 * Existe porque sin un limite de Suspense el App Router se queda mostrando la
 * pantalla anterior hasta que el servidor responde, y el click parece perdido.
 */

function Barra({ ancho, alto = 'h-4' }: { ancho: string; alto?: string }) {
  return <div className={`${alto} ${ancho} rounded bg-linea`} />;
}

export function Esqueleto({ filas = 4 }: { filas?: number }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-6 py-8">
      <header className="flex items-center justify-between gap-4 border-b border-linea pb-5">
        <div className="h-8 w-8 shrink-0 rounded bg-linea" />
        <div className="flex gap-2">
          <Barra ancho="w-16" alto="h-8" />
          <Barra ancho="w-16" alto="h-8" />
          <Barra ancho="w-16" alto="h-8" />
        </div>
        <div className="h-9 w-9 shrink-0 rounded-full bg-linea" />
      </header>

      <main className="flex-1 animate-pulse pt-8">
        <Barra ancho="w-44" alto="h-7" />

        <div className="mt-8 space-y-3">
          {Array.from({ length: filas }).map((_, i) => (
            <div key={i} className="rounded-xl border border-linea p-5">
              <Barra ancho="w-24" alto="h-3" />
              <div className="mt-3">
                <Barra ancho={i % 2 === 0 ? 'w-3/4' : 'w-1/2'} alto="h-5" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
