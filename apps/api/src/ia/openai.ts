import { MODELO, type UsoTokens } from './modelo.js';

/**
 * El unico archivo que habla con OpenAI. Si se cambia de proveedor, se cambia
 * esto y `modelo.ts`; el resto del API no sabe quien responde.
 *
 * Usa la Responses API con Structured Outputs: la respuesta llega con la forma
 * exacta del JSON Schema o no llega.
 */

const URL_RESPUESTAS = 'https://api.openai.com/v1/responses';

export class ErrorIA extends Error {
  constructor(
    mensaje: string,
    /** Tokens gastados antes de fallar, si los hubo. No se cobran al usuario. */
    readonly uso: UsoTokens | null = null,
  ) {
    super(mensaje);
    this.name = 'ErrorIA';
  }
}

export interface PedidoEstructurado {
  /** Nombre del schema. Solo letras, numeros, `_` y `-`. */
  nombre: string;
  instrucciones: string;
  entrada: string;
  esquema: Record<string, unknown>;
}

export interface RespuestaEstructurada<T> {
  datos: T;
  uso: UsoTokens;
}

/** Forma minima de lo que devuelve la Responses API: solo lo que se lee. */
interface CuerpoRespuesta {
  status?: string;
  incomplete_details?: { reason?: string } | null;
  error?: { message?: string } | null;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string; refusal?: string }>;
  }>;
  usage?: {
    input_tokens?: number;
    input_tokens_details?: { cached_tokens?: number };
    output_tokens?: number;
  };
}

export async function pideEstructurado<T>(
  apiKey: string,
  pedido: PedidoEstructurado,
): Promise<RespuestaEstructurada<T>> {
  let respuesta: Response;
  try {
    respuesta = await fetch(URL_RESPUESTAS, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODELO.id,
        instructions: pedido.instrucciones,
        input: pedido.entrada,
        reasoning: { effort: MODELO.esfuerzo },
        max_output_tokens: MODELO.maxTokensSalida,
        // Nada de guardar conversaciones en OpenAI: cada llamada es suelta.
        store: false,
        text: {
          format: {
            type: 'json_schema',
            name: pedido.nombre,
            strict: true,
            schema: pedido.esquema,
          },
        },
      }),
      signal: AbortSignal.timeout(90_000),
    });
  } catch (e) {
    throw new ErrorIA(`No se pudo llegar a OpenAI: ${(e as Error).message}`);
  }

  const cuerpo = (await respuesta.json().catch(() => ({}))) as CuerpoRespuesta;
  const uso = leeUso(cuerpo);

  if (!respuesta.ok) {
    throw new ErrorIA(`OpenAI respondio ${respuesta.status}: ${cuerpo.error?.message ?? 'sin detalle'}`, uso);
  }
  if (cuerpo.status === 'incomplete') {
    throw new ErrorIA(`Respuesta incompleta: ${cuerpo.incomplete_details?.reason ?? 'sin motivo'}`, uso);
  }

  const contenido = cuerpo.output
    ?.filter((item) => item.type === 'message')
    .flatMap((item) => item.content ?? []);

  const negativa = contenido?.find((c) => c.type === 'refusal');
  if (negativa) throw new ErrorIA(`El modelo se nego: ${negativa.refusal ?? ''}`, uso);

  const texto = contenido?.find((c) => c.type === 'output_text')?.text;
  if (!texto) throw new ErrorIA('La respuesta vino sin texto.', uso);

  try {
    return { datos: JSON.parse(texto) as T, uso };
  } catch {
    throw new ErrorIA('La respuesta no es JSON valido.', uso);
  }
}

function leeUso(cuerpo: CuerpoRespuesta): UsoTokens {
  return {
    entrada: cuerpo.usage?.input_tokens ?? 0,
    entradaEnCache: cuerpo.usage?.input_tokens_details?.cached_tokens ?? 0,
    salida: cuerpo.usage?.output_tokens ?? 0,
  };
}
