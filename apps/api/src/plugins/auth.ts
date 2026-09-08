import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { SupabaseClient, User } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyRequest {
    /** Usuario autenticado. Solo presente tras pasar por `requiereAuth`. */
    usuario?: User;
  }
  interface FastifyInstance {
    requiereAuth: (request: FastifyRequest) => Promise<void>;
  }
}

interface Opciones {
  anon: SupabaseClient;
}

/**
 * Verifica el access token de Supabase que viaja en `Authorization: Bearer`.
 * El frontend lo obtiene de su sesion y lo manda en cada request al API.
 */
const authPlugin: FastifyPluginAsync<Opciones> = async (app, { anon }) => {
  app.decorate('requiereAuth', async (request: FastifyRequest) => {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw app.httpErrors.unauthorized('Falta el header Authorization: Bearer <token>.');
    }

    const token = header.slice('Bearer '.length).trim();
    const { data, error } = await anon.auth.getUser(token);

    if (error || !data.user) {
      throw app.httpErrors.unauthorized('Token invalido o expirado.');
    }

    request.usuario = data.user;
  });
};

export default fp(authPlugin, { name: 'nspp-auth' });
