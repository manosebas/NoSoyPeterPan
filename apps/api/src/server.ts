import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import authPlugin from './plugins/auth.js';
import { creaValidadorOrigen } from './cors.js';
import { cargarEnv, type Env } from './env.js';
import { clienteAnon } from './supabase.js';
import { rutasSalud } from './routes/salud.js';
import { rutasYo } from './routes/yo.js';

export async function construirServidor(env: Env = cargarEnv()): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.appEnv === 'prod' ? 'info' : 'debug',
      // Nunca loguear tokens ni cookies.
      redact: ['req.headers.authorization', 'req.headers.cookie'],
    },
    trustProxy: true,
  });

  await app.register(sensible);
  await app.register(cors, {
    origin: creaValidadorOrigen(env.corsOrigins),
    credentials: true,
  });
  await app.register(authPlugin, { anon: clienteAnon(env) });

  await app.register(rutasSalud(env));
  await app.register(rutasYo, { prefix: '/api' });

  return app;
}
