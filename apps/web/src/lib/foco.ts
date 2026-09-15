import type { ModoFoco, NodoObjetivo, Objetivo, Voto } from '@nspp/shared';

/** Una hoja con el camino que explica por que esta ahi. */
export type Linea = { nodo: NodoObjetivo; camino: Objetivo[] };

export type Foco = {
  /** Lo vencido sin hacer, lo mas viejo primero. No se pospone ni se esconde. */
  vencidos: Linea[];
  /** Lo marcado hoy. Se queda tachado ocupando su lugar hasta manana. */
  hechosHoy: Linea[];
  /** Lo que toca hacer hoy, sin hacer todavia. */
  enFoco: Linea[];
  /** El resto, en el orden en que entraria. De aqui salen "Dame otro" y la eleccion. */
  candidatos: Linea[];
  /** Lugares que quedan en el dia despues de lo vencido y lo hecho. */
  cupoLibre: number;
};

const DIA_MS = 86_400_000;

/**
 * Arma el foco del dia. Funcion pura: recibe el arbol y decide.
 *
 * Reglas:
 * - Lo vencido va siempre y ocupa cupo: el atraso se paga antes de sumar.
 * - Lo hecho hoy tambien ocupa cupo, para que el dia tenga un final.
 * - Cada objetivo raiz aporta su siguiente paso: la hoja sin hacer que vence
 *   primero, y en empate la que va antes en el desglose. Si sobra cupo, entra
 *   el segundo paso del mas urgente.
 * - Un objetivo que ya tiene algo vencido o hecho hoy ya aporto lo suyo.
 * - Se ordena por fecha limite y, en empate, por la rama con menos votos en la
 *   ultima semana: asi el foco rota entre ramas.
 * - Lo sin fecha es Nunca Jamas y no entra. Lo pospuesto espera su dia.
 */
export function armaFoco({
  raices,
  votos,
  hoy,
  pasosPorDia,
  modo,
  elegidos,
  extra = 0,
}: {
  raices: NodoObjetivo[];
  votos: Voto[];
  /** `YYYY-MM-DD`. */
  hoy: string;
  pasosPorDia: number;
  modo: ModoFoco;
  /** Modo elegir: ids escogidos para hoy. Vacio si todavia no eligio. */
  elegidos: Set<string>;
  /** Pasos de mas que se pidieron con "Dame otro". */
  extra?: number;
}): Foco {
  const vencidos: Linea[] = [];
  const hechosHoy: Linea[] = [];
  const colas: Array<{ raiz: NodoObjetivo; indice: number; pasos: Linea[]; ocupada: boolean }> =
    [];

  raices.forEach((raiz, indice) => {
    const pasos: Linea[] = [];
    let ocupada = false;

    for (const linea of hojas(raiz)) {
      const { nodo } = linea;
      if (nodo.completadoEn) {
        if (nodo.completadoEn.slice(0, 10) === hoy) {
          hechosHoy.push(linea);
          ocupada = true;
        }
        continue;
      }
      if (nodo.venceEl === null) continue;
      if (nodo.venceEl < hoy) {
        vencidos.push(linea);
        ocupada = true;
        continue;
      }
      if (nodo.pospuestoHasta && nodo.pospuestoHasta > hoy) continue;
      pasos.push(linea);
    }

    // Dentro de un objetivo manda la fecha, y en empate el orden del desglose
    // (sort es estable). Con fechas escalonadas coinciden; si no, lo que vence
    // antes no se queda escondido detras de un hermano hasta vencerse.
    pasos.sort((a, b) => a.nodo.venceEl!.localeCompare(b.nodo.venceEl!));
    colas.push({ raiz, indice, pasos, ocupada });
  });

  vencidos.sort((a, b) => a.nodo.venceEl!.localeCompare(b.nodo.venceEl!));

  // Votos de la ultima semana por rama: la que menos avanzo pasa adelante.
  const desde = new Date(Date.parse(`${hoy}T00:00:00Z`) - 7 * DIA_MS).toISOString();
  const recientes = new Map<string, number>();
  for (const voto of votos) {
    if (voto.emitidoEn >= desde) {
      recientes.set(voto.categoriaId, (recientes.get(voto.categoriaId) ?? 0) + 1);
    }
  }

  const ordenadas = colas
    .filter((c) => c.pasos.length > 0)
    .sort((a, b) => {
      const pa = a.pasos[0]!.nodo;
      const pb = b.pasos[0]!.nodo;
      return (
        pa.venceEl!.localeCompare(pb.venceEl!) ||
        (recientes.get(pa.categoriaId) ?? 0) - (recientes.get(pb.categoriaId) ?? 0) ||
        a.indice - b.indice
      );
    });

  // Por vueltas: el primer paso de cada objetivo, despues el segundo, y asi.
  // Un objetivo ya ocupado hoy empieza en la segunda vuelta.
  const todos: Linea[] = [];
  const vueltas = Math.max(0, ...ordenadas.map((c) => c.pasos.length + 1));
  for (let vuelta = 0; vuelta < vueltas; vuelta += 1) {
    for (const cola of ordenadas) {
      const paso = cola.pasos[vuelta - (cola.ocupada ? 1 : 0)];
      if (paso) todos.push(paso);
    }
  }

  const cupoLibre = Math.max(0, pasosPorDia - vencidos.length - hechosHoy.length);

  if (modo === 'elegir') {
    const enFoco = todos.filter((l) => elegidos.has(l.nodo.id));
    return {
      vencidos,
      hechosHoy,
      enFoco,
      candidatos: todos.filter((l) => !elegidos.has(l.nodo.id)),
      cupoLibre,
    };
  }

  const cuantos = cupoLibre + extra;
  return {
    vencidos,
    hechosHoy,
    enFoco: todos.slice(0, cuantos),
    candidatos: todos.slice(cuantos),
    cupoLibre,
  };
}

/** Las hojas de un arbol en el orden del desglose, con sus ancestros. */
function hojas(nodo: NodoObjetivo, ancestros: Objetivo[] = []): Linea[] {
  if (nodo.hijos.length === 0) return [{ nodo, camino: ancestros }];
  return nodo.hijos.flatMap((hijo) => hojas(hijo, [...ancestros, nodo]));
}

/** El dia siguiente a `hoy`, en `YYYY-MM-DD`. */
export function manana(hoy: string): string {
  return new Date(Date.parse(`${hoy}T00:00:00Z`) + DIA_MS).toISOString().slice(0, 10);
}
