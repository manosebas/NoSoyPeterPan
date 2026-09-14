import type { CodigoErrorIA, PeticionDesglose, PropuestaDesglose } from '@nspp/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import type { Env } from '../env.js';
import { leeContexto } from '../ia/desglose/contexto.js';
import { armaEntrada, INSTRUCCIONES } from '../ia/desglose/entrada.js';
import { podaPropuesta } from '../ia/desglose/poda.js';
import { ESQUEMA, NOMBRE_ESQUEMA, type RespuestaDesglose } from '../ia/desglose/respuesta.js';
import { costoEnDolares } from '../ia/modelo.js';
import { ErrorIA, pideEstructurado } from '../ia/openai.js';
import { cobra, consultaSaldo } from '../ia/presupuesto.js';

interface Opciones {
  env: Env;
  admin: SupabaseClient;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Personas con una llamada en curso. Una a la vez: un doble clic no debe
 * cobrar dos veces. Vive en memoria porque el API corre en una sola instancia.
 */
const enCurso = new Set<string>();

function falla(reply: FastifyReply, status: number, codigo: CodigoErrorIA, mensaje: string) {
  return reply.code(status).send({ error: { codigo, mensaje } });
}

export const rutasIA: FastifyPluginAsync<Opciones> = async (app, { env, admin }) => {
  /**
   * Propone un desglose para un objetivo. No guarda nada: la persona elige y
   * guarda desde la web. Cobra solo si la propuesta llega bien.
   */
  app.post<{ Body: PeticionDesglose }>(
    '/ia/desglose',
    { preHandler: app.requiereAuth },
    async (request, reply): Promise<PropuestaDesglose | void> => {
      const usuarioId = request.usuario!.id;
      const objetivoId = request.body?.objetivoId;

      if (typeof objetivoId !== 'string' || !UUID.test(objetivoId)) {
        return falla(reply, 400, 'no_encontrado', 'Ese objetivo no existe.');
      }
      if (enCurso.has(usuarioId)) {
        return falla(reply, 409, 'ocupado', 'Ya hay un desglose en camino. Espera a que termine.');
      }

      enCurso.add(usuarioId);
      try {
        const saldo = await consultaSaldo(admin, usuarioId);
        if (saldo.estado === 'sin_plan') {
          return falla(reply, 402, 'sin_plan', 'La IA viene con los planes Básico y Pro.');
        }
        if (saldo.estado === 'sin_saldo') {
          return falla(reply, 402, 'sin_saldo', 'Se te acabó la IA de este mes.');
        }

        const contexto = await leeContexto(admin, usuarioId, objetivoId);
        if (!contexto) return falla(reply, 404, 'no_encontrado', 'Ese objetivo no existe.');
        if (contexto.nivelesDisponibles <= 0) {
          return falla(reply, 422, 'sin_niveles', 'Este objetivo ya no se puede partir más.');
        }

        const { datos, uso } = await pideEstructurado<RespuestaDesglose>(env.openaiApiKey, {
          nombre: NOMBRE_ESQUEMA,
          instrucciones: INSTRUCCIONES,
          entrada: armaEntrada(contexto),
          esquema: ESQUEMA,
        });

        const propuesta = podaPropuesta(datos, contexto);
        if (propuesta.pasos.length === 0) {
          request.log.warn({ uso }, 'desglose sin pasos validos: no se cobra');
          return falla(reply, 502, 'fallo_ia', 'La IA no logró un desglose útil. Intenta de nuevo.');
        }

        const costo = costoEnDolares(uso);
        // Si el cobro falla la propuesta igual se entrega: el error es nuestro.
        await cobra(admin, usuarioId, costo).catch((e: unknown) =>
          request.log.error({ err: e, costo }, 'no se pudo registrar el consumo'),
        );
        request.log.info({ uso, costo, pasos: propuesta.pasos.length }, 'desglose entregado');

        return propuesta;
      } catch (e) {
        if (e instanceof ErrorIA) {
          request.log.error({ err: e.message, uso: e.uso }, 'fallo la llamada a la IA: no se cobra');
          return falla(reply, 502, 'fallo_ia', 'La IA no respondió bien. Intenta de nuevo en un momento.');
        }
        throw e;
      } finally {
        enCurso.delete(usuarioId);
      }
    },
  );
};
