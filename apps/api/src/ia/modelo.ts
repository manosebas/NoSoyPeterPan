/**
 * Que modelo se usa y cuanto cuesta. Cambiar de modelo es tocar este archivo.
 *
 * Los precios son en dolares por millon de tokens y hay que copiarlos de
 * https://developers.openai.com/api/docs/pricing cada vez que se cambie el
 * modelo o OpenAI mueva sus tarifas: de aqui sale lo que se descuenta del
 * presupuesto de cada persona. Revisados el 2026-09-14.
 */
export const MODELO = {
  id: 'gpt-5.6-luna',
  /**
   * Cuanto piensa antes de responder. Los tokens de razonamiento se cobran
   * como salida: `low` alcanza para ordenar un desglose sin gastar de mas.
   */
  esfuerzo: 'low',
  /** Techo por llamada, razonamiento incluido. Acota lo que puede costar una. */
  maxTokensSalida: 8000,
  precioPorMillon: {
    entrada: 0.2,
    entradaEnCache: 0.02,
    salida: 1.2,
  },
} as const;

export interface UsoTokens {
  entrada: number;
  /** Parte de `entrada` que OpenAI ya tenia en cache y cobra mas barata. */
  entradaEnCache: number;
  /** Incluye los tokens de razonamiento. */
  salida: number;
}

/** Lo que costo una llamada, en dolares. */
export function costoEnDolares(uso: UsoTokens): number {
  const { entrada, entradaEnCache, salida } = MODELO.precioPorMillon;
  const sinCache = Math.max(0, uso.entrada - uso.entradaEnCache);

  return (
    (sinCache * entrada + uso.entradaEnCache * entradaEnCache + uso.salida * salida) / 1_000_000
  );
}
