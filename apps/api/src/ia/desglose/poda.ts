import { PLAZOS, type PasoPropuesto, type Plazo, type PropuestaDesglose } from '@nspp/shared';
import type { ContextoDesglose } from './contexto.js';
import { TOPE_DETALLE, TOPE_TITULO, type RespuestaDesglose } from './respuesta.js';

/**
 * Deja la respuesta de la IA lista para la web. El schema garantiza la forma,
 * no las reglas del arbol: eso se revisa aqui.
 *
 * Lo que no cumple se descarta con toda su rama en vez de tirar la propuesta
 * entera. Un plazo demasiado largo no se descarta: se acorta al del padre.
 *
 * Funcion pura: no lee la base ni la red.
 */
export function podaPropuesta(
  respuesta: RespuestaDesglose,
  contexto: Pick<ContextoDesglose, 'plazosPermitidos' | 'nivelesDisponibles'>,
): PropuestaDesglose {
  const orden = PLAZOS.map((p) => p.clave);
  const permitidos = contexto.plazosPermitidos.map((p) => p.clave);
  // El plazo mas largo que puede tener un paso directo del objetivo.
  const techoRaiz = permitidos[0] ?? 'hoy';

  const aceptados = new Map<string, { nivel: number; plazo: Plazo }>();
  const pasos: PasoPropuesto[] = [];

  for (const paso of respuesta.pasos) {
    const ref = paso.ref.trim();
    const titulo = paso.titulo.trim().slice(0, TOPE_TITULO);
    if (!ref || !titulo || aceptados.has(ref)) continue;

    // Un padre desconocido o que viene despues deja al paso huerfano.
    const padre = paso.padre === null ? null : aceptados.get(paso.padre);
    if (paso.padre !== null && !padre) continue;

    const nivel = (padre?.nivel ?? 0) + 1;
    if (nivel > contexto.nivelesDisponibles) continue;

    const techo = padre?.plazo ?? techoRaiz;
    const plazo = orden.indexOf(paso.plazo) < orden.indexOf(techo) ? techo : paso.plazo;

    aceptados.set(ref, { nivel, plazo });
    pasos.push({
      ref,
      padre: paso.padre,
      titulo,
      detalle: paso.detalle.trim().slice(0, TOPE_DETALLE),
      plazo,
    });
  }

  const observacion = respuesta.observacion?.trim();
  return { observacion: observacion ? observacion : null, pasos };
}
