/**
 * Variables publicas del frontend.
 *
 * Regla del proyecto: nada quemado en codigo y sin archivos .env.
 * Se definen en Vercel (Settings > Environment Variables), un set por ambiente:
 * Production apunta al proyecto prod_NoSoyPeterPan y Preview a dev_NoSoyPeterPan.
 *
 * Next.js inlinea `process.env.NEXT_PUBLIC_*` en build, por eso hay que
 * escribirlas literales. La validacion es perezosa (al llamar la funcion) para
 * que el build no reviente prerenderizando paginas que no necesitan Supabase.
 */

function requerida(nombre: string, valor: string | undefined): string {
  if (!valor || valor.trim() === '') {
    throw new Error(
      `Falta la variable ${nombre}. Definila en Vercel para este ambiente y vuelve a desplegar.`,
    );
  }
  return valor.trim();
}

export function envSupabase(): { url: string; anonKey: string } {
  return {
    url: requerida('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    anonKey: requerida('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };
}

/** URL del API en Railway. Opcional hasta que el backend este desplegado. */
export function urlApi(): string | null {
  const valor = process.env.NEXT_PUBLIC_API_URL;
  return valor && valor.trim() !== '' ? valor.trim().replace(/\/$/, '') : null;
}
