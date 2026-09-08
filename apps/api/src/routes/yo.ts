import type { FastifyPluginAsync } from 'fastify';
import type { RespuestaYo } from '@nspp/shared';

/**
 * Ruta protegida de prueba: confirma que el token de Supabase emitido en el
 * frontend es aceptado por el backend. Es el smoke test del circuito de auth.
 */
export const rutasYo: FastifyPluginAsync = async (app) => {
  app.get(
    '/yo',
    { preHandler: app.requiereAuth },
    async (request): Promise<RespuestaYo> => {
      const usuario = request.usuario!;
      return {
        id: usuario.id,
        email: usuario.email ?? null,
        creadoEn: usuario.created_at,
      };
    },
  );
};
