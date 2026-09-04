'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { fetcher, formatearFecha, type Convocatoria } from '@/lib/api';

export function PasoConvocatoria({
  onSeleccionar,
}: {
  onSeleccionar: (id: string) => void;
}) {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetcher<{ data: Convocatoria[] }>('/convocatorias')
      .then((res) => setConvocatorias(res.data ?? []))
      .catch(() => {
        setError('No se pudieron cargar las convocatorias abiertas.');
        setConvocatorias([]);
      });
  }, []);

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
      {convocatorias.length === 0 ? (
        <p className="font-mono text-sm text-brutal-tinta/80">
          No hay convocatorias abiertas en este momento.
        </p>
      ) : (
        <div className="space-y-4">
          {convocatorias.map((convocatoria) => (
            <Card
              key={convocatoria.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
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
              <Button onClick={() => onSeleccionar(convocatoria.id)}>
                Postularme
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
