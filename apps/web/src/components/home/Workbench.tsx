'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Container } from '@/components/ui/Container';
import { nombreRol } from '@/lib/rol';
import { accionesPorRol } from '@/lib/acciones';

export function Workbench() {
  const { usuario, cargando } = useAuth();

  if (cargando) return null;
  if (!usuario) return null;

  const rol = (usuario.rol || '').toUpperCase();
  const acciones = accionesPorRol[rol] ?? accionesPorRol.ADMIN;
  const primerNombre = usuario.nombres.split(' ')[0];

  return (
    <section className="brut-cinta border-b-[3px] border-brutal-tinta bg-brutal-tinta py-14 text-brutal-papel">
      <Container>
        <p className="brut-label mb-2 text-xs font-bold text-brutal-gold">
          // Mi panel · {nombreRol(rol)}
        </p>
        <h1 className="text-mega text-3xl font-black uppercase md:text-5xl">
          Hola, {primerNombre}
        </h1>
        <p className="mt-2 max-w-2xl font-mono text-sm text-brutal-papel/80">
          Estas son las acciones que puedes realizar según tu rol en SIGEB.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {acciones.map((accion) => (
            <Link
              key={accion.titulo}
              href={accion.href}
              className="group rounded-brutal border-[3px] border-brutal-tinta bg-brutal-papel p-5 text-brutal-tinta shadow-brutal-sm transition-transform hover:-translate-y-1"
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-brutal border-[3px] border-brutal-tinta text-2xl font-black text-brutal-tinta ${accion.acento}`}
              >
                {accion.icono}
              </div>
              <h2 className="font-brut text-lg font-black uppercase tracking-wide">
                {accion.titulo}
              </h2>
              <p className="mt-1 text-sm text-brutal-tinta/70">{accion.descripcion}</p>
              <p className="brut-label mt-4 text-xs font-bold uppercase text-brutal-tinta/60 transition-colors group-hover:text-brutal-cyan">
                Ir al panel →
              </p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
