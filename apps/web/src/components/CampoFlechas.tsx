'use client';

import { useEffect, useRef } from 'react';

/**
 * Campo de flechas que apuntan al cursor, detras del hero.
 *
 * Es el logo hecho fondo: todo el plano girando hacia donde estas. Dice la tesis
 * sin una palabra, que es justo lo que el hero necesita.
 *
 * PARA QUITARLO: borrar este archivo y las dos lineas que lo usan en
 * `app/page.tsx` (el import y el `<CampoFlechas />`). No toca nada mas: no hay
 * dependencias nuevas, ni estilos globales, ni estado compartido.
 *
 * Rendimiento: un canvas y un solo bucle para todas las flechas, en vez de un
 * nodo del DOM con su propio muelle por flecha. Y antes de dibujar nada mide la
 * maquina: si no da, no se monta, y si el ritmo cae en marcha, se apaga solo.
 */

/** Separacion entre flechas. Mas alto, menos flechas y mas barato. */
const ESPACIO = 58;
/** Tope duro: en un monitor grande, la rejilla completa no vale lo que cuesta. */
const TOPE = 520;
/** Cuanto se acerca una flecha a su angulo objetivo en cada frame. */
const SUAVIDAD = 0.12;
/** Por debajo de esto se considera que la maquina no da y se apaga. */
const FPS_MINIMO = 40;
/** Frames que se miran antes de juzgar. */
const FRAMES_DE_PRUEBA = 90;

/**
 * Si esta maquina puede con el efecto. Se pregunta antes de crear nada.
 *
 * El puntero fino es el corte importante y no es una suposicion sobre potencia:
 * las flechas siguen al cursor, y en una pantalla tactil no hay cursor que
 * seguir. Sin el, el efecto no existe, solo cuesta.
 */
function laMaquinaDa(): boolean {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!window.matchMedia('(pointer: fine)').matches) return false;
  if (window.innerWidth < 1024) return false;

  const nucleos = navigator.hardwareConcurrency;
  if (typeof nucleos === 'number' && nucleos < 4) return false;

  // Solo Chromium la expone; donde no existe, no se castiga al dispositivo.
  const memoria = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof memoria === 'number' && memoria < 4) return false;

  return true;
}

export function CampoFlechas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current || !laMaquinaDa()) return;

    const contexto = ref.current.getContext('2d', { alpha: true });
    if (!contexto) return;

    // Copias con tipo ya sin null: TypeScript no arrastra el descarte de arriba
    // a las funciones de abajo, y sin esto cada uso vuelve a ser "posiblemente
    // null".
    const lienzo: HTMLCanvasElement = ref.current;
    const pincel: CanvasRenderingContext2D = contexto;

    let ancho = 0;
    let alto = 0;
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let angulos = new Float32Array(0);

    // Mientras el raton no ha entrado, todas miran al centro.
    let ratonX = 0;
    let ratonY = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function rejilla() {
      const caja = lienzo.getBoundingClientRect();
      ancho = caja.width;
      alto = caja.height;

      lienzo.width = Math.floor(ancho * dpr);
      lienzo.height = Math.floor(alto * dpr);
      pincel.setTransform(dpr, 0, 0, dpr, 0, 0);

      const columnas = Math.ceil(ancho / ESPACIO) + 1;
      const filas = Math.ceil(alto / ESPACIO) + 1;
      const total = Math.min(columnas * filas, TOPE);

      xs = new Float32Array(total);
      ys = new Float32Array(total);
      angulos = new Float32Array(total);

      // Rejilla centrada: los margenes sobrantes quedan iguales a los dos lados.
      const margenX = (ancho - (columnas - 1) * ESPACIO) / 2;
      const margenY = (alto - (filas - 1) * ESPACIO) / 2;

      ratonX = ancho / 2;
      ratonY = alto / 2;

      let i = 0;
      for (let f = 0; f < filas && i < total; f += 1) {
        for (let c = 0; c < columnas && i < total; c += 1) {
          const x = margenX + c * ESPACIO;
          const y = margenY + f * ESPACIO;
          xs[i] = x;
          ys[i] = y;
          angulos[i] = Math.atan2(ratonY - y, ratonX - x);
          i += 1;
        }
      }
    }

    function dibuja(): boolean {
      pincel.clearRect(0, 0, ancho, alto);
      pincel.strokeStyle = 'rgba(10, 10, 10, 0.22)';
      pincel.lineWidth = 1.4;
      pincel.lineCap = 'round';
      pincel.lineJoin = 'round';

      let enMovimiento = false;

      for (let i = 0; i < xs.length; i += 1) {
        const x = xs[i] ?? 0;
        const y = ys[i] ?? 0;
        const previo = angulos[i] ?? 0;
        const objetivo = Math.atan2(ratonY - y, ratonX - x);

        // Por el camino corto: sin esto, cruzar el eje da una vuelta entera.
        let giro = objetivo - previo;
        while (giro < -Math.PI) giro += Math.PI * 2;
        while (giro > Math.PI) giro -= Math.PI * 2;

        if (Math.abs(giro) > 0.002) enMovimiento = true;
        const angulo = previo + giro * SUAVIDAD;
        angulos[i] = angulo;

        const cos = Math.cos(angulo);
        const sen = Math.sin(angulo);
        const largo = 7;
        const punta = 3.2;

        const x2 = x + cos * largo;
        const y2 = y + sen * largo;

        pincel.beginPath();
        pincel.moveTo(x - cos * largo, y - sen * largo);
        pincel.lineTo(x2, y2);
        pincel.moveTo(x2, y2);
        pincel.lineTo(x2 - cos * punta - sen * punta, y2 - sen * punta + cos * punta);
        pincel.moveTo(x2, y2);
        pincel.lineTo(x2 - cos * punta + sen * punta, y2 - sen * punta - cos * punta);
        pincel.stroke();
      }

      return enMovimiento;
    }

    let vivo = true;
    let cuadro = 0;
    let frames = 0;
    let desde = performance.now();
    let quieto = false;

    function apaga() {
      vivo = false;
      cancelAnimationFrame(cuadro);
      pincel.clearRect(0, 0, ancho, alto);
      window.removeEventListener('mousemove', alMover);
      window.removeEventListener('mouseout', alSalir);
      observador.disconnect();
    }

    function bucle() {
      if (!vivo) return;

      const enMovimiento = dibuja();

      // Ya convergieron y nadie mueve el raton: se deja de pintar hasta que algo
      // pase. Un fondo decorativo no tiene por que gastar bateria quieto.
      if (!enMovimiento) {
        quieto = true;
        return;
      }

      frames += 1;
      if (frames === FRAMES_DE_PRUEBA) {
        const fps = (frames * 1000) / (performance.now() - desde);
        if (fps < FPS_MINIMO) {
          // La maquina paso el examen de papel pero no el de verdad.
          apaga();
          return;
        }
        frames = 0;
        desde = performance.now();
      }

      cuadro = requestAnimationFrame(bucle);
    }

    function despierta() {
      if (!vivo || !quieto) return;
      quieto = false;
      frames = 0;
      desde = performance.now();
      cuadro = requestAnimationFrame(bucle);
    }

    function alMover(e: MouseEvent) {
      const caja = lienzo.getBoundingClientRect();
      ratonX = e.clientX - caja.left;
      ratonY = e.clientY - caja.top;
      despierta();
    }

    function alSalir() {
      ratonX = ancho / 2;
      ratonY = alto / 2;
      despierta();
    }

    const observador = new ResizeObserver(() => {
      rejilla();
      despierta();
    });

    rejilla();
    observador.observe(lienzo);
    window.addEventListener('mousemove', alMover, { passive: true });
    window.addEventListener('mouseout', alSalir);
    cuadro = requestAnimationFrame(bucle);

    return apaga;
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      // A todo el ancho de la ventana, no al del contenedor: el hero se lee
      // centrado pero el campo llega hasta los bordes.
      className="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-screen -translate-x-1/2"
    />
  );
}
