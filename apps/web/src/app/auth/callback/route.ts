import { NextResponse, type NextRequest } from 'next/server';
import { createClienteServidor } from '@/lib/supabase/server';

/**
 * Destino de los enlaces de confirmación de correo de Supabase.
 * Cambia el `code` del enlace por una sesión en cookies.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const siguiente = searchParams.get('siguiente');
  const destino = siguiente?.startsWith('/') ? siguiente : '/hoy';

  if (!code) {
    return NextResponse.redirect(`${origin}/entrar?error=sin_codigo`);
  }

  const supabase = await createClienteServidor();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/entrar?error=enlace_invalido`);
  }

  return NextResponse.redirect(`${origin}${destino}`);
}
