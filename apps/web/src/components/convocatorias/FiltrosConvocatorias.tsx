'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Select } from '@/components/ui/Select';

interface FiltrosConvocatoriasProps {
  becas: string[];
}

export function FiltrosConvocatorias({ becas }: FiltrosConvocatoriasProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [busqueda, setBusqueda] = useState(searchParams.get('busqueda') ?? '');
  const [beca, setBeca] = useState(searchParams.get('beca') ?? '');

  function aplicarFiltros() {
    const params = new URLSearchParams();
    if (busqueda.trim()) params.set('busqueda', busqueda.trim());
    if (beca) params.set('beca', beca);
    const qs = params.toString();
    router.push(qs ? `/convocatorias?${qs}` : '/convocatorias');
  }

  function limpiar() {
    setBusqueda('');
    setBeca('');
    router.push('/convocatorias');
  }

  return (
    <form
      className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-4 shadow-brutal-sm"
      onSubmit={(e) => {
        e.preventDefault();
        aplicarFiltros();
      }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label
            htmlFor="busqueda"
            className="mb-1 block font-brut text-xs font-bold uppercase tracking-wide text-sigeb-blue-dark"
          >
            Buscar
          </label>
          <input
            id="busqueda"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre de convocatoria o beca..."
            className="w-full rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco px-3 py-2 text-sm focus:bg-brutal-cyan/10 focus:outline-none"
          />
        </div>

        {becas.length > 0 && (
          <div className="w-full md:w-56">
            <Select
              label="Tipo de beca"
              name="beca"
              value={beca}
              onChange={(e) => setBeca(e.target.value)}
              options={[...new Set(becas)].map((b) => ({ value: b, label: b }))}
              placeholder="Todas las becas"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-gold px-4 py-2 font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={limpiar}
            className="rounded-brutal border-[3px] border-brutal-tinta bg-transparent px-4 py-2 font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta hover:bg-brutal-cyan"
          >
            Limpiar
          </button>
        </div>
      </div>
    </form>
  );
}
