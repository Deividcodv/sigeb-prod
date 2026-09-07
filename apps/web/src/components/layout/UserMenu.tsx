'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { rutaPorRol, nombreRol } from '@/lib/rol';
import { MenuAcciones } from '@/components/layout/MenuAcciones';

export function UserMenu() {
  const { usuario, cargando, logout } = useAuth();
  const router = useRouter();

  if (cargando) return null;

  if (!usuario) {
    return (
      <div className="hidden gap-3 md:flex">
        <Button
          href="/login"
          variant="ghost"
          className="!border-brutal-papel !bg-transparent !text-brutal-papel hover:!bg-brutal-gold hover:!text-brutal-tinta"
        >
          Iniciar sesión
        </Button>
        <Button href="/registro">Registrarse</Button>
      </div>
    );
  }

  const ruta = rutaPorRol(usuario.rol);
  const rol = nombreRol(usuario.rol);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="hidden items-center gap-3 md:flex">
      <MenuAcciones />
      <Link
        href={ruta}
        className="flex items-center gap-2 rounded-brutal border-2 border-brutal-gold bg-brutal-gold px-3 py-1.5 font-brut text-xs font-black uppercase tracking-wide text-brutal-tinta transition-colors hover:-translate-y-0.5 hover:bg-brutal-papel hover:text-brutal-tinta"
      >
        <span className="text-base">▤</span>
        Panel {rol}
      </Link>
      <span className="font-mono text-xs text-brutal-papel">
        Hola, {usuario.nombres.split(' ')[0]}
      </span>
      <Button
        onClick={handleLogout}
        className="!border-brutal-rojo !bg-brutal-rojo !text-brutal-papel hover:!bg-brutal-tinta hover:!text-brutal-papel"
      >
        Cerrar sesión
      </Button>
    </div>
  );
}
