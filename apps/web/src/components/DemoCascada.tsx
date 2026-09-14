'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Demo que se juega solo: se escribe un objetivo de un año, se envía y de él
 * caen los tres plazos que lo aterrizan hasta hoy. Al terminar se borra y
 * vuelve a empezar.
 *
 * No explica la cascada con palabras: la dibuja. Quien mira entiende que de
 * cualquier objetivo que escriba van a salir los pasos, sin que se lo digan.
 *
 * Solo corre cuando está en pantalla, y con prefers-reduced-motion se planta
 * en el estado final: el mensaje se ve igual, sin movimiento.
 */

const OBJETIVO = 'Correr mi primera carrera de 10k';

const CASCADA = [
  { plazo: '90 días', texto: 'Poder correr 5 km sin parar' },
  { plazo: 'Esta semana', texto: 'Salir a correr 3 veces' },
  { plazo: 'Hoy', texto: 'Correr 20 minutos' },
];

const LETRA = 55;
const ANTES_DE_ENVIAR = 800;
const PULSACION = 260;
const GENERANDO = 1000;
const ENTRE_PASOS = 620;
const DESCANSO = 3400;
const BORRADO = 700;

type Fase = 'escribe' | 'envia' | 'genera' | 'revela';

export function DemoCascada() {
  const ref = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(false);
  const [quieto, setQuieto] = useState(false);
  const [letras, setLetras] = useState(0);
  const [fase, setFase] = useState<Fase>('escribe');
  const [pasos, setPasos] = useState(0);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setQuieto(true);
      setLetras(OBJETIVO.length);
      setFase('revela');
      setPasos(CASCADA.length);
      return;
    }

    // Pausa fuera de pantalla: una pestaña de fondo no gasta en repintar.
    const observador = new IntersectionObserver(
      (entradas) => setActivo(entradas.some((entrada) => entrada.isIntersecting)),
      { threshold: 0.25 },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!activo || quieto) return;

    let cancelado = false;
    const relojes: ReturnType<typeof setTimeout>[] = [];
    const espera = (ms: number) =>
      new Promise<void>((listo) => {
        relojes.push(setTimeout(listo, ms));
      });

    const jugar = async () => {
      while (!cancelado) {
        setFase('escribe');
        setPasos(0);
        setLetras(0);
        await espera(BORRADO);

        for (let i = 1; i <= OBJETIVO.length; i += 1) {
          await espera(LETRA);
          if (cancelado) return;
          setLetras(i);
        }

        await espera(ANTES_DE_ENVIAR);
        if (cancelado) return;
        setFase('envia');

        await espera(PULSACION);
        if (cancelado) return;
        setFase('genera');

        await espera(GENERANDO);
        if (cancelado) return;
        setFase('revela');

        for (let i = 1; i <= CASCADA.length; i += 1) {
          await espera(ENTRE_PASOS);
          if (cancelado) return;
          setPasos(i);
        }

        await espera(DESCANSO);
        if (cancelado) return;
      }
    };

    void jugar();

    return () => {
      cancelado = true;
      relojes.forEach(clearTimeout);
    };
  }, [activo, quieto]);

  const brotando = fase === 'genera' || fase === 'revela';

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`Ejemplo: del objetivo de un año «${OBJETIVO}» salen solos un objetivo de 90 días, uno de esta semana y uno de hoy.`}
      className="rounded-2xl border border-linea p-6 sm:p-10"
    >
      <div aria-hidden>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-humo">
          Objetivo a mediano plazo (1 año)
        </span>

        <div className="mt-4 flex items-stretch gap-3">
          <div className="flex min-h-14 flex-1 items-center rounded-xl border border-linea px-4 text-base sm:text-lg">
            <span className="font-medium">{OBJETIVO.slice(0, letras)}</span>
            {fase === 'escribe' && (
              <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-tinta" />
            )}
          </div>
          <div
            className={`flex shrink-0 items-center rounded-xl bg-tinta px-5 text-sm font-semibold text-papel transition-transform duration-150 ${
              fase === 'envia' ? 'scale-95' : 'scale-100'
            }`}
          >
            Enter
          </div>
        </div>

        <div className="flex h-10 items-center pl-6 sm:pl-8">
          <span
            className={`w-px origin-top bg-linea transition-all duration-500 ${
              brotando ? 'h-full opacity-100' : 'h-0 opacity-0'
            }`}
          />
          <span
            className={`-ml-[3px] h-1.5 w-1.5 rounded-full bg-tinta transition-opacity duration-300 ${
              fase === 'genera' ? 'animate-ping opacity-100' : 'opacity-0'
            }`}
          />
        </div>

        <div className="space-y-3">
          {CASCADA.map((paso, i) => {
            const visible = pasos > i;
            const ultimo = i === CASCADA.length - 1;

            return (
              <div
                key={paso.plazo}
                style={{ paddingLeft: `${i * 1.5}rem` }}
                className={`transition-all duration-500 ease-out ${
                  visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                }`}
              >
                <div
                  className={`flex flex-col gap-1 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:gap-5 ${
                    ultimo ? 'border-tinta bg-tinta text-papel' : 'border-linea'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase tracking-[0.2em] sm:w-28 sm:shrink-0 ${
                      ultimo ? 'text-papel/60' : 'text-humo'
                    }`}
                  >
                    {paso.plazo}
                  </span>
                  <span className="font-medium sm:text-lg">{paso.texto}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
