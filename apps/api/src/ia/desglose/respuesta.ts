/**
 * LO QUE DEVUELVE LA IA al desglosar un objetivo.
 *
 * `ESQUEMA` es el JSON Schema que OpenAI respeta al pie de la letra (Structured
 * Outputs, modo estricto). `RespuestaDesglose` es el mismo formato en
 * TypeScript: si se cambia uno, se cambia el otro.
 *
 * Reglas del modo estricto: todo campo va en `required`, todo objeto lleva
 * `additionalProperties: false`, y un campo opcional se declara como
 * `["string", "null"]`.
 *
 * Si se agrega o quita un campo, hay que explicarlo en `INSTRUCCIONES`
 * (`entrada.ts`) y revisar `poda.ts`, que valida la respuesta antes de
 * mandarla a la web.
 */

export const NOMBRE_ESQUEMA = 'desglose_objetivo';

export const TOPE_TITULO = 200;
export const TOPE_DETALLE = 400;
export const TOPE_PASOS = 30;

export const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['observacion', 'pasos'],
  properties: {
    observacion: {
      type: ['string', 'null'],
      description: 'Advertencia importante antes de empezar, o null si no hay nada que advertir.',
    },
    pasos: {
      type: 'array',
      maxItems: TOPE_PASOS,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['ref', 'padre', 'titulo', 'detalle', 'plazo'],
        properties: {
          ref: {
            type: 'string',
            description: 'Identificador unico dentro de la respuesta: p1, p2, p3...',
          },
          padre: {
            type: ['string', 'null'],
            description: 'ref del paso padre, o null si cuelga directo del objetivo.',
          },
          titulo: {
            type: 'string',
            maxLength: TOPE_TITULO,
            description: 'Accion concreta que empieza con verbo.',
          },
          detalle: {
            type: 'string',
            maxLength: TOPE_DETALLE,
            description: 'Una o dos frases con lo necesario para hacerlo bien.',
          },
          plazo: {
            type: 'string',
            enum: ['largo', 'mediano', 'corto', 'semana', 'hoy'],
          },
        },
      },
    },
  },
} as const;

export interface RespuestaDesglose {
  observacion: string | null;
  pasos: Array<{
    ref: string;
    padre: string | null;
    titulo: string;
    detalle: string;
    plazo: 'largo' | 'mediano' | 'corto' | 'semana' | 'hoy';
  }>;
}
