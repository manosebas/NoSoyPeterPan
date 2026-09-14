'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * El manifiesto se escribe solo al llegar a el, letra por letra, y se queda.
 * No hay loop: esto no es una demo, es una declaracion. Se lee una vez y ahi
 * se queda, con la firma apareciendo al final.
 *
 * Con prefers-reduced-motion aparece entero de una: la frase importa mas que
 * el efecto.
 */

const PARRAFOS: { texto: string; fuerte?: boolean }[] = [
  { texto: 'Tenemos una vida. Solo una.' },
  {
    texto:
      'Entonces, ¿por qué no correr como si estuviéramos en llamas hacia nuestros sueños más salvajes?',
  },
  { texto: 'Tenemos una sola oportunidad en esto.' },
  { texto: 'Yo quiero que la gente me vea y diga: «Ese tipo está loco».' },
  { texto: 'Bien.' },
  {
    texto:
      'Prefiero que me llamen loco. Soñador. Que me digan que estoy apuntando demasiado alto.',
  },
  { texto: 'Pero nunca conformista.' },
  {
    texto:
      'Porque si solo tengo una oportunidad en esta vida, no pienso pasarla intentando encajar, jugando a lo seguro o viviendo una vida que no elegí.',
  },
  { texto: 'Tenemos una sola oportunidad.' },
  { texto: 'Y estamos hechos para destacar.', fuerte: true },
];

const LETRA = 16;
const ENTRE_PARRAFOS = 260;
const ANTES_DE_FIRMAR = 500;

export function FraseEscrita() {
  const ref = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(false);
  const [escritos, setEscritos] = useState<number[]>(() => PARRAFOS.map(() => 0));
  const [enCurso, setEnCurso] = useState(-1);
  const [firmado, setFirmado] = useState(false);

  const completo = () => {
    setEscritos(PARRAFOS.map((p) => p.texto.length));
    setEnCurso(-1);
    setFirmado(true);
  };

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      completo();
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((entrada) => entrada.isIntersecting)) return;
        setActivo(true);
        observador.disconnect();
      },
      { threshold: 0.2 },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!activo) return;

    let cancelado = false;
    const relojes: ReturnType<typeof setTimeout>[] = [];
    const espera = (ms: number) =>
      new Promise<void>((listo) => {
        relojes.push(setTimeout(listo, ms));
      });

    const escribir = async () => {
      for (let p = 0; p < PARRAFOS.length; p += 1) {
        const parrafo = PARRAFOS[p];
        if (!parrafo) return;

        setEnCurso(p);

        for (let i = 1; i <= parrafo.texto.length; i += 1) {
          await espera(LETRA);
          if (cancelado) return;
          setEscritos((previos) => previos.map((n, j) => (j === p ? i : n)));
        }

        await espera(ENTRE_PARRAFOS);
        if (cancelado) return;
      }

      setEnCurso(-1);
      await espera(ANTES_DE_FIRMAR);
      if (cancelado) return;
      setFirmado(true);
    };

    void escribir();

    return () => {
      cancelado = true;
      relojes.forEach(clearTimeout);
    };
  }, [activo]);

  return (
    <div ref={ref} className="max-w-3xl">
      <blockquote className="space-y-5 text-xl leading-relaxed tracking-tight sm:text-2xl">
        {PARRAFOS.map((parrafo, i) => {
          // El parrafo aun sin empezar no ocupa lugar: el bloque crece con lo
          // escrito, como si alguien lo estuviera tecleando de verdad.
          const letras = escritos[i] ?? 0;
          if (letras === 0 && enCurso !== i) return null;

          return (
            <p key={parrafo.texto} className={parrafo.fuerte ? 'font-bold' : 'text-humo'}>
              {parrafo.texto.slice(0, letras)}
              {enCurso === i && (
                <span
                  aria-hidden
                  className="ml-0.5 inline-block h-5 w-px translate-y-0.5 animate-pulse bg-tinta"
                />
              )}
            </p>
          );
        })}
      </blockquote>

      <p
        className={`mt-8 text-sm font-medium transition-opacity duration-700 ${
          firmado ? 'opacity-100' : 'opacity-0'
        }`}
      >
        — M
      </p>
    </div>
  );
}
