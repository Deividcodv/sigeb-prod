'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { fetcher, formatearFecha, type Convocatoria } from '@/lib/api';

export function PasoConvocatoria({
  onSeleccionar,
  preseleccionadaId,
}: {
  onSeleccionar: (id: string) => void;
  preseleccionadaId?: string;
}) {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const creacionIniciada = useRef(false);

  useEffect(() => {
    fetcher<{ data: Convocatoria[] }>('/convocatorias')
      .then((res) => setConvocatorias(res.data ?? []))
      .catch(() => {
        setError('No se pudieron cargar las convocatorias abiertas.');
        setConvocatorias([]);
      });
  }, []);

  useEffect(() => {
    if (!preseleccionadaId || !convocatorias || creacionIniciada.current) return;

    const convocatoria = convocatorias.find((c) => c.id === preseleccionadaId);
    if (convocatoria && convocatoria.estado === 'ABIERTA') {
      creacionIniciada.current = true;
      setCreando(true);
      onSeleccionar(convocatoria.id);
    }
  }, [preseleccionadaId, convocatorias, onSeleccionar]);

  const preseleccionada =
    preseleccionadaId && convocatorias
      ? convocatorias.find((c) => c.id === preseleccionadaId)
      : undefined;

  if (!convocatorias) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-brutal border-[3px] border-brutal-rojo bg-red-50 p-3 text-sm font-bold text-brutal-rojo">
          {error}
        </p>
      )}
      <h2 className="mb-4 font-brut text-xl font-black uppercase tracking-wide text-brutal-tinta">
        Elige una convocatoria abierta
      </h2>
      {preseleccionada && (
        <div
          className={`mb-4 flex items-center gap-3 rounded-brutal border-[3px] p-3 font-mono text-sm ${
            creando
              ? 'border-brutal-cyan bg-brutal-cyan/15 text-brutal-tinta'
              : 'border-brutal-tinta bg-brutal-gold/20 text-brutal-tinta'
          }`}
        >
          <Spinner className="h-5 w-5" />
          <span>
            {creando
              ? `Creando tu solicitud para «${preseleccionada.nombre}»…`
              : `Convocatoria preseleccionada: ${preseleccionada.nombre}`}
          </span>
        </div>
      )}
      {convocatorias.length === 0 ? (
        <p className="font-mono text-sm text-brutal-tinta/80">
          No hay convocatorias abiertas en este momento.
        </p>
      ) : (
        <div className="space-y-4">
          {convocatorias.map((convocatoria) => (
            <Card
              key={convocatoria.id}
              className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${
                preseleccionadaId === convocatoria.id
                  ? 'border-brutal-cyan bg-brutal-cyan/10'
                  : ''
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-brutal-tinta">
                    {convocatoria.beca.nombre}
                  </h3>
                  <Badge estado={convocatoria.estado} />
                </div>
                <p className="mt-1 text-sm text-brutal-tinta/70">{convocatoria.nombre}</p>
                <p className="mt-1 text-sm text-brutal-tinta/70">
                  Cierre: {formatearFecha(convocatoria.fechaCierre)}
                </p>
              </div>
              <Button
                onClick={() => onSeleccionar(convocatoria.id)}
                disabled={convocatoria.estado !== 'ABIERTA' || creando}
              >
                {creando && preseleccionadaId === convocatoria.id
                  ? 'Creando…'
                  : 'Postularme'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}