'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { fetchConToken, descargarConstancia } from '@/lib/api-auth';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { InternalPageHeader } from '@/components/ui/InternalPageHeader';
import { formatearFecha, type Solicitud } from '@/lib/api';

const ordenEstados = [
  'BORRADOR',
  'ENVIADA',
  'EN_REVISION',
  'CORRECCION',
  'EVALUADA',
  'APROBADA',
  'RECHAZADA',
];

export default function DashboardPage() {
  return (
    <ProtectedRoute roles={['POSTULANTE']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { usuario } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    fetchConToken<Solicitud[]>('/solicitudes')
      .then((data) => {
        if (activo) setSolicitudes(data);
      })
      .catch((e: Error) => {
        if (activo) setError(e.message);
      });
    return () => {
      activo = false;
    };
  }, []);

  const totales = (solicitudes ?? []).reduce<Record<string, number>>(
    (acc, s) => {
      acc[s.estado] = (acc[s.estado] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <>
      <InternalPageHeader
        title={`Hola, ${usuario?.nombres}`}
        subtitle="Aquí puedes dar seguimiento a tus solicitudes de beca."
      />

      <Container className="py-10">
        {error && (
          <p className="mb-6 rounded-brutal border-[3px] border-brutal-rojo bg-red-50 p-4 text-sm font-bold text-brutal-rojo">
            {error}
          </p>
        )}

        {!solicitudes && !error ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : solicitudes && solicitudes.length === 0 ? (
          <EmptyState
            title="Aún no tienes solicitudes"
            description="Cuando te postules a una convocatoria, aquí verás el estado de tu solicitud."
          >
            <Button href="/convocatorias">Ver convocatorias abiertas</Button>
          </EmptyState>
        ) : (() => {
          const lista = solicitudes ?? [];
          return (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {ordenEstados.map((estado) => {
                  const cantidad = totales[estado] ?? 0;
                  if (cantidad === 0) return null;
                  return (
                    <Card key={estado} className="p-4">
                      <p className="text-3xl font-black text-brutal-tinta">
                        {cantidad}
                      </p>
                      <div className="mt-1">
                        <Badge estado={estado} />
                      </div>
                    </Card>
                  );
                })}
              </div>

              <h2 className="mt-10 mb-4 text-xl font-black text-brutal-tinta">
                Mis solicitudes
              </h2>

              <div className="space-y-4">
                {lista.map((sol) => {
                  const docsRequeridos = sol.convocatoria?._count?.documentosRequeridos ?? 0;
                  const docsCargados = sol._count?.documentos ?? 0;
                  const codigoConv = `CONV-${(sol.convocatoria?.id ?? '').slice(0, 6).toUpperCase()}`;

                  return (
                    <Card key={sol.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-brutal-tinta">
                            {sol.convocatoria?.beca?.nombre ?? 'Beca'}
                          </h3>
                          <Badge estado={sol.estado} />
                        </div>
                        <p className="mt-1 text-sm text-brutal-tinta/70">
                          <span className="font-mono font-bold text-brutal-tinta">{codigoConv}</span>
                          {' · '}
                          {sol.convocatoria?.nombre ?? ''}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-brutal-tinta/60">
                          <span>Postulada el {formatearFecha(sol.createdAt)}</span>
                          {docsRequeridos > 0 && (
                            <span>
                              Docs: <span className="font-bold text-brutal-tinta">{docsCargados}</span>/{docsRequeridos} cargados
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                        {sol.estado === 'APROBADA' && (
                          <Button
                            onClick={() =>
                              descargarConstancia(sol.id).catch((e: Error) =>
                                setError(e.message),
                              )
                            }
                            className="whitespace-nowrap"
                          >
                            Descargar constancia
                          </Button>
                        )}
                        <Button
                          href={`/solicitudes/${sol.id}`}
                          variant="ghost"
                          className="shrink-0 whitespace-nowrap"
                        >
                          Ver detalle
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-8">
                <Button href="/solicitudes/nueva">Crear nueva solicitud</Button>
              </div>
            </>
          );
        })()}
      </Container>
    </>
  );
}
