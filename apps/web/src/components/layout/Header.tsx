'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Container } from '@/components/ui/Container';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { UserMenu } from '@/components/layout/UserMenu';
import { rutaPorRol } from '@/lib/rol';

const enlacesPublicos = [
  { href: '/', label: 'Inicio' },
  { href: '/convocatorias', label: 'Convocatorias' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/consulta', label: 'Consultar solicitud' },
];

export function Header() {
  const { usuario, cargando } = useAuth();

  const esLogueado = !cargando && !!usuario;

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-brutal-tinta bg-brutal-tinta">
      <Container className="flex items-center justify-between py-3">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center border-[3px] border-brutal-tinta bg-brutal-gold font-brut text-2xl font-black text-brutal-tinta shadow-brutal-sm transition-transform group-hover:-rotate-6">
            S
          </div>
          <div>
            <p className="font-brut text-lg font-black uppercase leading-tight tracking-wide text-brutal-papel">
              SIGEB
            </p>
            <p className="brut-label text-[10px] leading-tight text-brutal-cyan">
              Sistema Integral de Gestión de Becas
            </p>
          </div>
        </Link>

        <nav className="hidden items-center md:flex">
          {esLogueado ? (
            usuario && (
              <Link
                href={rutaPorRol(usuario.rol)}
                className="rounded-brutal border-2 border-brutal-cyan bg-brutal-cyan px-4 py-2 font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta transition-colors hover:bg-brutal-gold hover:border-brutal-gold"
              >
                ▤ Mi panel
              </Link>
            )
          ) : (
            enlacesPublicos.map((enlace) => (
              <Link
                key={enlace.href}
                href={enlace.href}
                className="px-4 py-2 font-brut text-sm font-bold uppercase tracking-wide text-brutal-papel transition-colors hover:bg-brutal-cyan hover:text-brutal-tinta"
              >
                {enlace.label}
              </Link>
            ))
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <UserMenu />
        </div>

        <MobileMenu />
      </Container>
    </header>
  );
}