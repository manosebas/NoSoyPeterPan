import Image from 'next/image';
import Link from 'next/link';
import { FRASE_DE_ORO } from '@nspp/shared';
import { Revelar } from '@/components/Revelar';

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
                  Peter Pan se niega rotundamente a crecer. No tiene responsabilidades, miedo al
                  compromiso, temor al fracaso, entre otras. Deja que cada día decida por él, sin
                  preocuparse por hacia dónde va.
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
