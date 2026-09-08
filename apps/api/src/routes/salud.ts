import type { FastifyPluginAsync } from 'fastify';
import type { RespuestaSalud } from '@nspp/shared';
import type { Env } from '../env.js';

export function rutasSalud(env: Env): FastifyPluginAsync {
  return async (app) => {
    // Railway usa este endpoint como healthcheck.
    app.get('/health', async (): Promise<RespuestaSalud> => ({
      ok: true,
      servicio: 'nspp-api',
      entorno: env.appEnv,
      version: process.env['npm_package_version'] ?? '0.1.0',
      hora: new Date().toISOString(),
    }));
  };
}
