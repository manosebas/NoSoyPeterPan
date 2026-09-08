import Image from 'next/image';
import Link from 'next/link';
import { FRASE_DE_ORO } from '@nspp/shared';

const CADENA = ['Algún día', '5 años', '1 año', '90 días', 'Esta semana', 'Hoy'];

const CONTRASTES = [
  {
    peterPan: '«Hoy me desperté. ¿Qué tengo que hacer?»',
    tu: '«Sé hacia dónde quiero ir. ¿Qué tengo que hacer hoy para acercarme?»',
  },
];

const PARADOJAS = [
  ['Si nunca administras tu dinero', 'dependes del dinero.'],
  ['Si nunca cuidas tu cuerpo', 'dependes de las consecuencias.'],
  ['Si nunca construyes tu carrera', 'dependes de las oportunidades que aparezcan.'],
  ['Si nunca decides qué quieres', 'dependes de lo que los demás quieran para ti.'],
];

export default function Landing() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6">
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

      <main className="flex-1">
        <section className="py-16 sm:py-24">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-humo">
            Algún día no existe
          </p>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            Deja de vivir
            <br />
            por accidente.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-humo">
            Peter Pan vive aventura tras aventura, día tras día, sin trayectoria hacia ningún lado.
            Puedes estar ocupadísimo y que nada de eso construya la vida que querías. Este es un
            juego para salir de Nunca Jamás.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/entrar"
              className="rounded-full bg-tinta px-7 py-3 text-sm font-semibold text-papel transition-opacity hover:opacity-80"
            >
              Salir de Nunca Jamás
            </Link>
            <span className="text-sm text-humo">Se construye un martes cualquiera.</span>
          </div>
        </section>

        <section className="border-t border-linea py-14">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
            La conversión
          </h2>
          <ol className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-3">
            {CADENA.map((paso, i) => (
              <li key={paso} className="flex items-center gap-3">
                <span
                  className={
                    i === CADENA.length - 1
                      ? 'rounded-full bg-tinta px-4 py-1.5 text-sm font-semibold text-papel'
                      : 'rounded-full border border-linea px-4 py-1.5 text-sm'
                  }
                >
                  {paso}
                </span>
                {i < CADENA.length - 1 && <span aria-hidden className="text-humo">→</span>}
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-xl text-humo">
            Ninguna misión es huérfana. Cada acción del día responde a una sola pregunta:{' '}
            <em className="not-italic text-tinta">
              ¿a qué objetivo de mi vida está contribuyendo esto?
            </em>
          </p>
        </section>

        <section className="border-t border-linea py-14">
          {CONTRASTES.map((c) => (
            <div key={c.tu} className="grid gap-6 sm:grid-cols-2">
              <blockquote className="border-l-2 border-linea pl-5 text-humo">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em]">
                  El día decide por ti
                </span>
                {c.peterPan}
              </blockquote>
              <blockquote className="border-l-2 border-tinta pl-5">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-humo">
                  Decides tú
                </span>
                {c.tu}
              </blockquote>
            </div>
          ))}
        </section>

        <section className="border-t border-linea py-14">
          <h2 className="text-2xl font-bold tracking-tight">La libertad exige responsabilidad</h2>
          <dl className="mt-8 space-y-4">
            {PARADOJAS.map(([condicion, consecuencia]) => (
              <div key={condicion} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                <dt className="text-humo sm:w-2/5">{condicion},</dt>
                <dd className="font-medium sm:w-3/5">{consecuencia}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-lg font-medium">
            Crecer no significa dejar de jugar. Significa dejar de jugar con tu futuro.
          </p>
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
