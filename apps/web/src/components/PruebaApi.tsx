'use client';

import { useState } from 'react';
import { createClienteNavegador } from '@/lib/supabase/client';
import { urlApi } from '@/env';

/**
 * Smoke test del circuito completo: sesión de Supabase en el navegador ->
 * token Bearer -> API en Railway -> verificación del token.
 * Es temporal, se quita cuando el backend tenga funcionalidad real.
 */
export function PruebaApi() {
  const api = urlApi();
  const [salida, setSalida] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  if (!api) {
    return (
      <p className="text-sm text-humo">
        Backend sin conectar. Define <code className="font-mono">NEXT_PUBLIC_API_URL</code> en Vercel
        cuando el API esté desplegado en Railway.
      </p>
    );
  }

  async function probar() {
    setCargando(true);
    setSalida(null);
    try {
      const supabase = createClienteNavegador();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${api}/api/yo`, {
        headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
      });
      setSalida(`${res.status} — ${await res.text()}`);
    } catch (e) {
      setSalida(e instanceof Error ? e.message : 'Error de red');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={probar}
        disabled={cargando}
        className="rounded-full border border-tinta px-5 py-2 text-sm font-medium transition-colors hover:bg-tinta hover:text-papel disabled:opacity-40"
      >
        {cargando ? 'Probando…' : 'Probar conexión con el API'}
      </button>
      {salida && (
        <pre className="overflow-x-auto rounded-lg border border-linea bg-white p-4 font-mono text-xs">
          {salida}
        </pre>
      )}
    </div>
  );
}
