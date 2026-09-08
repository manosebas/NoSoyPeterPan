/**
 * Variables de entorno del API.
 *
 * Regla del proyecto: nada quemado en codigo y sin archivos .env.
 * Todo se define en las variables de Railway (un set por ambiente).
 * Si falta algo, el proceso muere al arrancar: preferimos fallar en el
 * deploy que servir trafico mal configurado.
 */

function requerida(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor || valor.trim() === '') {
    throw new Error(
      `Falta la variable de entorno ${nombre}. Definila en Railway (Variables) para este ambiente.`,
    );
  }
  return valor.trim();
}

function opcional(nombre: string, porDefecto: string): string {
  const valor = process.env[nombre];
  return valor && valor.trim() !== '' ? valor.trim() : porDefecto;
}

export interface Env {
  appEnv: 'dev' | 'prod';
  port: number;
  host: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  corsOrigins: string[];
}

export function cargarEnv(): Env {
  const appEnv = opcional('APP_ENV', 'dev');
  if (appEnv !== 'dev' && appEnv !== 'prod') {
    throw new Error(`APP_ENV invalido: "${appEnv}". Valores permitidos: dev | prod.`);
  }

  return {
    appEnv,
    // Railway inyecta PORT. En su ausencia usamos 8080 solo como fallback de arranque.
    port: Number(opcional('PORT', '8080')),
    host: '0.0.0.0',
    supabaseUrl: requerida('SUPABASE_URL'),
    supabaseAnonKey: requerida('SUPABASE_ANON_KEY'),
    supabaseServiceRoleKey: requerida('SUPABASE_SERVICE_ROLE_KEY'),
    // Lista separada por comas. Ej: https://nosoypeterpan.vercel.app,https://*.vercel.app
    corsOrigins: requerida('CORS_ORIGINS')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  };
}
