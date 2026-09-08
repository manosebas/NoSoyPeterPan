import type { NextRequest } from 'next/server';
import { actualizarSesion } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return actualizarSesion(request);
}

export const config = {
  matcher: [
    // Todo menos assets estaticos e imagenes.
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
