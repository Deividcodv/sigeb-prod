'use client';

import { useEffect, useState } from 'react';
import { fetchConToken } from '@/lib/api-auth';
import { Spinner } from '@/components/ui/Spinner';
import type { SolicitudChecklist } from '@/lib/api';

function calcularCompletitud(checklist: SolicitudChecklist): number {
  let completados = 1; // paso 1: convocatoria seleccionada (la solicitud existe)
  if (checklist.perfilAcademico) completados += 1;
  if (checklist.perfilFinanciero) completados += 1;
  if (checklist.documentos) completados += 1;
  if (checklist.estado !== 'BORRADOR') completados += 1;
  return Math.min(Math.round((completados / 5) * 100), 100);
}

const ETIQUETAS = ['Convocatoria', 'Académico', 'Financiero', 'Documentos', 'Envío'];

export function BarraCompletitud({ solicitudId }: { solicitudId: string }) {
  const [checklist, setChecklist] = useState<SolicitudChecklist | null>(null);

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      try {
        const data = await fetchConToken<SolicitudChecklist>(
          `/solicitudes/${solicitudId}/checklist`,
        );
        if (activo) setChecklist(data);
      } catch {
        if (activo) setChecklist(null);
      }
    };
    void cargar();
    const intervalo = setInterval(() => void cargar(), 4000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [solicitudId]);

  if (!checklist) {
    return (
      <div className="flex h-12 items-center gap-3 font-mono text-xs font-bold text-brutal-tinta/70">
        <Spinner className="h-5 w-5" /> Completitud del expediente…
      </div>
    );
  }

  const porcentaje = calcularCompletitud(checklist);
  const completados = Math.round((porcentaje / 100) * 5);

  const pasos = [
    { nombre: 'Convocatoria', completo: true },
    { nombre: 'Académico', completo: checklist.perfilAcademico },
    { nombre: 'Financiero', completo: checklist.perfilFinanciero },
    { nombre: 'Documentos', completo: checklist.documentos },
    { nombre: 'Envío', completo: checklist.estado !== 'BORRADOR' },
  ];

  return (
    <div className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-4 shadow-brutal-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="brut-label font-mono text-xs font-bold uppercase text-brutal-tinta">
          Completitud del expediente
        </p>
        <span className="tabular font-brut text-sm font-black text-brutal-cyan">
          {completados} / 5 · {porcentaje}%
        </span>
      </div>
      <div className="h-6 w-full rounded-brutal border-[3px] border-brutal-tinta bg-brutal-papel">
        <div
          className="flex h-full items-center justify-end rounded-brutal bg-brutal-lima pr-2 transition-all duration-500"
          style={{ width: `${porcentaje}%` }}
        >
          <span className="text-[10px] font-black text-brutal-tinta">{porcentaje}%</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {pasos.map((paso) => (
          <span
            key={paso.nombre}
            className={`rounded-brutal border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
              paso.completo
                ? 'border-brutal-lima bg-brutal-lima/20 text-brutal-tinta'
                : 'border-brutal-tinta/30 bg-brutal-papel text-brutal-tinta/50'
            }`}
          >
            {paso.completo ? '✓ ' : '○ '}
            {paso.nombre}
          </span>
        ))}
      </div>
      <p className="sr-only">{ETIQUETAS.join(' · ')}</p>
    </div>
  );
}