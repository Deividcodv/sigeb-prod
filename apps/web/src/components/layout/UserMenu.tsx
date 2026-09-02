'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { rutaPorRol } from '@/lib/rol';

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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="hidden items-center gap-3 md:flex">
      <Link
        href={ruta}
        className="brut-label text-xs font-bold text-brutal-cyan transition-colors hover:text-brutal-gold"
      >
        Hola, {usuario.nombres.split(' ')[0]}
      </Link>
      <Button onClick={handleLogout} variant="ghost">
        Cerrar sesión
      </Button>
    </div>
  );
}