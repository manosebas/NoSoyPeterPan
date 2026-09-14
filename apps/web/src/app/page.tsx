import Image from 'next/image';
import Link from 'next/link';
import { FRASE_DE_ORO } from '@nspp/shared';
import { DemoCascada } from '@/components/DemoCascada';
import { Revelar } from '@/components/Revelar';

const CADENA = ['Algún día', '5 años', '1 año', '90 días', 'Esta semana', 'Hoy'];

export default function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-6 sm:px-10">
      <section className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" priority />
            <span className="text-sm font-semibold tracking-tight">No Soy Peter Pan</span>
          </div>
          <Link
            href="/entrar"
            className="rounded-full border border-tinta px-5 py-2 text-sm font-medium transition-colors hover:bg-tinta hover:text-papel"
          >
            Entrar
          </Link>
        </header>

        <div className="flex flex-1 flex-col justify-center py-12">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-humo">
            Algún día no existe
          </p>
          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:items-end lg:gap-16">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
              ¿Tu vida tiene
              <br />
              dirección?
            </h1>
            <div className="lg:pb-3">
              <p className="max-w-md text-lg leading-relaxed text-humo">
                Te despiertas y el día empieza a decidir por ti. Llegas a la noche habiendo hecho
                mil cosas, sin saber si alguna te acercó a la vida que quieres.
              </p>
              <Link
                href="/entrar"
                className="mt-8 inline-block rounded-full bg-tinta px-7 py-3 text-sm font-semibold text-papel transition-opacity hover:opacity-80"
              >
                Salir de Nunca Jamás
              </Link>
            </div>
          </div>
        </div>

        <div aria-hidden className="pb-8 text-right text-humo">
          ↓
        </div>
      </section>

      <main>
        <section className="border-t border-linea py-24 sm:py-32">
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <Revelar>
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo lg:sticky lg:top-12">
                Nunca Jamás
              </h2>
            </Revelar>

            <div className="space-y-10 sm:space-y-14">
              <Revelar>
                <p className="max-w-2xl text-lg leading-relaxed text-humo sm:text-xl">
                  Peter Pan se niega rotundamente a crecer. Huye de las responsabilidades y teme al
                  compromiso y al fracaso. Deja que cada día decida por él, sin preocuparse por
                  hacia dónde va.
                </p>
              </Revelar>

              <Revelar retraso={120}>
                <p className="max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
                  Y a veces nosotros hacemos exactamente lo mismo.
                </p>
              </Revelar>

              <Revelar retraso={240}>
                <p className="max-w-2xl text-lg leading-relaxed text-humo sm:text-xl">
                  El trabajo, los mensajes, los pendientes, los problemas, lo urgente. Puedes estar
                  ocupadísimo y que nada de eso construya la vida que querías.
                </p>
              </Revelar>

              <Revelar retraso={120}>
                <p className="max-w-2xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
                  No Soy Peter Pan es una herramienta para cambiar eso.
                </p>
              </Revelar>

              <Revelar retraso={240}>
                <p className="max-w-2xl text-lg leading-relaxed text-humo sm:text-xl">
                  Decide hacia dónde quieres ir. Convierte tus objetivos en acciones.{' '}
                  <em className="not-italic font-medium text-tinta">
                    Lo que hagas hoy, construye tu mañana.
                  </em>
                </p>
              </Revelar>
            </div>
          </div>
        </section>

        <section className="border-t border-linea py-24 sm:py-32">
          <Revelar>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
              La conversión
            </h2>
          </Revelar>

          <ol className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-linea bg-linea sm:grid-cols-3 lg:grid-cols-6">
            {CADENA.map((paso, i) => {
              const ultimo = i === CADENA.length - 1;
              return (
                <li key={paso} className={ultimo ? 'bg-tinta text-papel' : 'bg-papel'}>
                  <Revelar retraso={i * 90} className="flex h-full flex-col justify-between p-5">
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        ultimo ? 'text-papel/60' : 'text-humo'
                      }`}
                    >
                      0{i + 1}
                    </span>
                    <span className="mt-8 block text-base font-semibold tracking-tight">
                      {paso}
                    </span>
                  </Revelar>
                </li>
              );
            })}
          </ol>

          <Revelar retraso={120}>
            <p className="mt-14 max-w-3xl text-2xl font-bold leading-[1.25] tracking-tight sm:text-3xl">
              Nada se hace porque sí. Cada acción de tu día debe responder a una pregunta:{' '}
              <em className="font-medium text-humo">
                ¿esto me acerca a alguno de mis objetivos?
              </em>
            </p>
          </Revelar>

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-linea bg-linea sm:grid-cols-2">
            <div className="bg-papel p-8 sm:p-10">
              <Revelar>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
                  Vivir reaccionando
                </span>
                <p className="mt-5 text-xl leading-snug text-humo sm:text-2xl">
                  «¿Qué tengo que hacer hoy?»
                </p>
              </Revelar>
            </div>
            <div className="bg-tinta p-8 text-papel sm:p-10">
              <Revelar retraso={140}>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-papel/60">
                  Vivir con dirección
                </span>
                <p className="mt-5 text-xl font-medium leading-snug sm:text-2xl">
                  «¿Qué puedo hacer hoy para acercarme a los objetivos que tengo?»
                </p>
              </Revelar>
            </div>
          </div>
        </section>

        <section className="border-t border-linea py-24 sm:py-32">
          <Revelar>
            <DemoCascada />
          </Revelar>
        </section>

        <section className="border-t border-linea py-14">
          <blockquote className="text-xl font-medium leading-relaxed tracking-tight sm:text-2xl">
            «{FRASE_DE_ORO}»
          </blockquote>
        </section>

        <section className="border-t border-linea py-16 text-center">
          <p className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tu yo de hoy es responsable
            <br />
            de la vida que recibe tu yo del futuro.
          </p>
          <Link
            href="/entrar"
            className="mt-10 inline-block rounded-full bg-tinta px-8 py-3.5 text-sm font-semibold text-papel transition-opacity hover:opacity-80"
          >
            Empezar hoy
          </Link>
        </section>
      </main>

      <footer className="border-t border-linea py-8 text-sm text-humo">
        No Soy Peter Pan — Un juego para salir de Nunca Jamás.
      </footer>
    </div>
  );
}
