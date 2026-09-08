import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { envSupabase } from '@/env';

/** Rutas que exigen sesion. Todo lo demas es publico. */
const RUTAS_PROTEGIDAS = ['/mapa'];

/**
 * Refresca el token de Supabase en cada request y corta el paso a las rutas
 * protegidas. Sin esto la sesion expira y los Server Components ven un usuario
 * nulo aunque el navegador crea estar dentro.
 */
export async function actualizarSesion(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const { url, anonKey } = envSupabase();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ruta = request.nextUrl.pathname;
  const esProtegida = RUTAS_PROTEGIDAS.some((r) => ruta === r || ruta.startsWith(`${r}/`));

  if (!user && esProtegida) {
    const destino = request.nextUrl.clone();
    destino.pathname = '/entrar';
    destino.searchParams.set('siguiente', ruta);
    return NextResponse.redirect(destino);
  }

  if (user && ruta === '/entrar') {
    const destino = request.nextUrl.clone();
    destino.pathname = '/mapa';
    destino.search = '';
    return NextResponse.redirect(destino);
  }

  return response;
}
