import { cargarEnv } from './env.js';
import { construirServidor } from './server.js';

async function main(): Promise<void> {
  const env = cargarEnv();
  const app = await construirServidor(env);

  const cerrar = async (senal: string): Promise<void> => {
    app.log.info({ senal }, 'cerrando servidor');
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void cerrar('SIGTERM'));
  process.on('SIGINT', () => void cerrar('SIGINT'));

  await app.listen({ port: env.port, host: env.host });
}

main().catch((error) => {
  console.error('No arranco el API:', error);
  process.exit(1);
});
