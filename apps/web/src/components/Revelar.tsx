'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Revela a su hijo cuando entra en pantalla: un fade y una subida corta.
 * `retraso` escalona bloques seguidos para que lleguen por turno y el texto
 * se lea con ritmo, en vez de aparecer todo de golpe.
 *
 * Si el sistema pide menos movimiento, el bloque nace visible y sin transicion:
 * la animacion es sabor, nunca el unico camino al contenido.
 */
export function Revelar({
  children,
  retraso = 0,
  className = '',
}: {
  children: React.ReactNode;
  retraso?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((entrada) => entrada.isIntersecting)) return;
        setVisible(true);
        observador.disconnect();
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    );

    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${retraso}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
