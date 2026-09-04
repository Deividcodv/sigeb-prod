'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { rutaPorRol, tienePanel, nombreRol } from '@/lib/rol';
import { accionesPorRol } from '@/lib/acciones';

const enlacesPublicos = [
  { href: '/convocatorias', label: 'Convocatorias' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/consulta', label: 'Consultar solicitud' },
];

export function MobileMenu() {
  const { usuario, cargando, logout } = useAuth();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);

  const cerrar = () => setAbierto(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const esLogueado = !cargando && !!usuario;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={abierto}
        className="flex h-11 w-11 items-center justify-center border-2 border-brutal-papel text-brutal-papel transition-colors hover:bg-brutal-gold hover:text-brutal-tinta"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
        >
          {abierto ? (
            <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {abierto && (
        <div className="absolute inset-x-0 top-full border-b-[3px] border-brutal-tinta bg-brutal-papel shadow-brutal">
          <nav className="flex flex-col px-4 py-4">
            {esLogueado ? (
              usuario && tienePanel(usuario.rol) && (
                <>
                  <p className="mb-3 font-mono text-xs font-bold uppercase tracking-wider text-brutal-tinta/70">
                    Hola, {usuario.nombres.split(' ')[0]} · {nombreRol(usuario.rol)}
                  </p>
                  <Link
                    href={rutaPorRol(usuario.rol)}
                    onClick={cerrar}
                    className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-cyan px-3 py-3 font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta hover:bg-brutal-gold"
                  >
                    ▤ Mi panel
                  </Link>

                  {(accionesPorRol[(usuario.rol || '').toUpperCase()] ?? []).map((accion) => (
                    <Link
                      key={accion.titulo}
                      href={accion.href}
                      onClick={cerrar}
                      className="mt-1 flex items-center gap-3 rounded-brutal border-2 border-brutal-tinta/15 px-3 py-2.5 font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta hover:border-brutal-tinta hover:bg-white"
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 border-brutal-tinta text-base text-brutal-tinta ${accion.acento}`}>
                        {accion.icono}
                      </span>
                      {accion.titulo}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 rounded-brutal border-[3px] border-brutal-rojo bg-brutal-rojo px-3 py-3 text-left font-brut text-sm font-bold uppercase tracking-wide text-brutal-papel hover:bg-brutal-tinta hover:text-brutal-papel"
                  >
                    Cerrar sesión
                  </button>
                </>
              )
            ) : (
              <>
                {enlacesPublicos.map((enlace) => (
                  <Link
                    key={enlace.href}
                    href={enlace.href}
                    onClick={cerrar}
                    className="border-b-2 border-brutal-tinta/10 px-3 py-3 font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta hover:bg-brutal-cyan"
                  >
                    {enlace.label}
                  </Link>
                ))}
                <div className="mt-3 grid gap-3 pt-4">
                  <Link
                    href="/login"
                    onClick={cerrar}
                    className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco px-3 py-3 text-center font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta hover:bg-brutal-cyan"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    onClick={cerrar}
                    className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-tinta px-3 py-3 text-center font-brut text-sm font-bold uppercase tracking-wide text-brutal-papel hover:bg-brutal-gold hover:text-brutal-tinta"
                  >
                    Registrarse
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
