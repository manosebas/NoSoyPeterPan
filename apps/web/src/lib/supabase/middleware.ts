import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { envSupabaseOpcional } from '@/env';

/** Rutas que exigen sesion. Todo lo demas es publico. */
const RUTAS_PROTEGIDAS = ['/hoy', '/mapa', '/ramas', '/objetivo', '/perfil', '/ajustes'];

/**
 * Refresca el token de Supabase en cada request y corta el paso a las rutas
 * protegidas. Sin esto la sesion expira y los Server Components ven un usuario
 * nulo aunque el navegador crea estar dentro.
 */
export async function actualizarSesion(request: NextRequest): Promise<NextResponse> {
  const ruta = request.nextUrl.pathname;
  const esProtegida = RUTAS_PROTEGIDAS.some((r) => ruta === r || ruta.startsWith(`${r}/`));

  // Sin configuracion de Supabase no hay sesion posible, pero tampoco tiene
  // sentido tumbar el sitio entero: la landing no depende de Supabase.
  const config = envSupabaseOpcional();
  if (!config) {
    if (!esProtegida) return NextResponse.next({ request });
    const destino = request.nextUrl.clone();
    destino.pathname = '/entrar';
    destino.search = '?error=sin_configurar';
    return NextResponse.redirect(destino);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.anonKey, {
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

  if (!user && esProtegida) {
    const destino = request.nextUrl.clone();
    destino.pathname = '/entrar';
    destino.searchParams.set('siguiente', ruta);
    return NextResponse.redirect(destino);
  }

  if (user && ruta === '/entrar') {
    const destino = request.nextUrl.clone();
    destino.pathname = '/hoy';
    destino.search = '';
    return NextResponse.redirect(destino);
  }

  return response;
}
