'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { fetchConToken } from '@/lib/api-auth';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  formatearFecha,
  type SolicitudDetalle,
  type SolicitudChecklist,
} from '@/lib/api';

export default function SolicitudDetallePage() {
  return (
    <ProtectedRoute roles={['POSTULANTE']}>
      <SolicitudDetalleContent />
    </ProtectedRoute>
  );
}

function SolicitudDetalleContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? '';

  const [solicitud, setSolicitud] = useState<SolicitudDetalle | null>(null);
  const [checklist, setChecklist] = useState<SolicitudChecklist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [detalle, chk] = await Promise.all([
        fetchConToken<SolicitudDetalle>(`/solicitudes/${id}`),
        fetchConToken<SolicitudChecklist>(`/solicitudes/${id}/checklist`),
      ]);
      setSolicitud(detalle);
      setChecklist(chk);
      setError(null);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'No se pudo cargar la solicitud',
      );
    }
  }, [id]);

  useEffect(() => {
    if (id) cargar();
  }, [id, cargar]);

  const subir = async (tipoId: string, file: File) => {
    setSubiendo(tipoId);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await fetchConToken(`/solicitudes/${id}/documentos/${tipoId}`, {
        method: 'POST',
        body: fd,
        isFormData: true,
      });
      await cargar();
      setExito('Documento subido correctamente.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo subir el documento');
    } finally {
      setSubiendo(null);
    }
  };

  const quitar = async (tipoId: string) => {
    setSubiendo(tipoId);
    setError(null);
    try {
      await fetchConToken(`/solicitudes/${id}/documentos/${tipoId}`, {
        method: 'DELETE',
      });
      await cargar();
      setExito('Documento eliminado.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el documento');
    } finally {
      setSubiendo(null);
    }
  };

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await fetchConToken(`/solicitudes/${id}/transicion`, {
        method: 'POST',
        body: { accion: 'enviar', comentario: 'Solicitud enviada por el postulante' },
      });
      await cargar();
      setExito('Solicitud enviada.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  if (!solicitud) {
    return (
      <Container className="flex min-h-[50vh] items-center justify-center py-16">
        {error ? (
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-700">{error}</p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => router.replace('/dashboard')}
            >
              Volver al dashboard
            </Button>
          </div>
        ) : (
          <Spinner />
        )}
      </Container>
    );
  }

  const puedeEnviar = solicitud.estado === 'BORRADOR' || solicitud.estado === 'CORRECCION';

  return (
    <>
      <section className="bg-sigeb-blue py-10 text-white">
        <Container>
          <button
            onClick={() => router.replace('/dashboard')}
            className="mb-4 inline-block text-sm text-sigeb-light hover:text-white"
          >
            ← Volver al dashboard
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <Badge estado={solicitud.estado} />
            <span className="text-sm font-medium text-sigeb-light">
              {solicitud.convocatoria.beca.nombre}
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-bold md:text-3xl">
            {solicitud.convocatoria.nombre}
          </h1>
          <p className="mt-1 text-sm text-sigeb-white/80">
            Postulada el {formatearFecha(solicitud.createdAt)}
          </p>
        </Container>
      </section>

      <Container className="py-8">
        {error && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}
        {exito && (
          <p className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {exito}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <DocsSection
              documentos={checklist?.documentos ?? []}
              subiendo={subiendo}
              onSubir={subir}
              onQuitar={quitar}
            />

            <Card>
              <h2 className="mb-3 text-lg font-bold text-sigeb-blue-dark">
                Historial de la solicitud
              </h2>
              {solicitud.historial && solicitud.historial.length > 0 ? (
                <ol className="space-y-3 border-l-2 border-gray-200 pl-4">
                  {solicitud.historial.map((h, i) => (
                    <li key={i}>
                      <p className="flex flex-wrap items-center gap-2 text-sm">
                        <Badge estado={h.estado} />
                        <span className="text-xs text-gray-500">
                          {formatearFecha(h.fecha)}
                        </span>
                      </p>
                      {h.comentario && (
                        <p className="mt-1 text-sm text-gray-600">{h.comentario}</p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-gray-500">Sin movimientos registrados.</p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="mb-3 text-lg font-bold text-sigeb-blue-dark">
                Perfil académico
              </h2>
              {solicitud.perfilAcademico ? (
                <dl className="space-y-1 text-sm text-gray-600">
                  <PerfilItem
                    label="Institución"
                    value={solicitud.perfilAcademico.institucion}
                  />
                  <PerfilItem
                    label="Carrera"
                    value={solicitud.perfilAcademico.carrera}
                  />
                  <PerfilItem
                    label="Promedio"
                    value={
                      solicitud.perfilAcademico.promedio != null
                        ? String(solicitud.perfilAcademico.promedio)
                        : undefined
                    }
                  />
                </dl>
              ) : (
                <p className="text-sm text-gray-500">No completado.</p>
              )}
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-bold text-sigeb-blue-dark">
                Perfil financiero
              </h2>
              {solicitud.perfilFinanciero ? (
                <dl className="space-y-1 text-sm text-gray-600">
                  <PerfilItem
                    label="Ingreso familiar"
                    value={
                      solicitud.perfilFinanciero.ingresoFamiliar != null
                        ? `Q ${solicitud.perfilFinanciero.ingresoFamiliar}`
                        : undefined
                    }
                  />
                  <PerfilItem
                    label="Dependientes"
                    value={
                      solicitud.perfilFinanciero.numeroDependientes != null
                        ? String(solicitud.perfilFinanciero.numeroDependientes)
                        : undefined
                    }
                  />
                  <PerfilItem
                    label="Becas anteriores"
                    value={solicitud.perfilFinanciero.becasAnteriores ? 'Sí' : 'No'}
                  />
                </dl>
              ) : (
                <p className="text-sm text-gray-500">No completado.</p>
              )}
            </Card>

            {puedeEnviar && (
              <Card>
                <h2 className="mb-2 text-lg font-bold text-sigeb-blue-dark">
                  Enviar solicitud
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                  {checklist?.completo
                    ? 'Tu solicitud está completa. Envíala para su evaluación.'
                    : `Faltan elementos para enviar: ${
                        checklist?.pendientes.join(', ') ?? ''
                      }`}
                </p>
                <Button
                  onClick={enviar}
                  disabled={enviando || !checklist?.completo}
                  className="w-full"
                >
                  {enviando ? <Spinner /> : 'Enviar solicitud'}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

function DocsSection({
  documentos,
  subiendo,
  onSubir,
  onQuitar,
}: {
  documentos: {
    documentoTipoId: string;
    nombre: string;
    obligatorio: boolean;
    cargado: boolean;
    archivoUrl: string | null;
  }[];
  subiendo: string | null;
  onSubir: (tipoId: string, file: File) => void;
  onQuitar: (tipoId: string) => void;
}) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold text-sigeb-blue-dark">
        Documentos
      </h2>
      {documentos.length === 0 ? (
        <p className="text-sm text-gray-500">No se requieren documentos para esta solicitud.</p>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc) => (
            <div
              key={doc.documentoTipoId}
              className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-sigeb-blue-dark">{doc.nombre}</p>
                <p className="text-xs text-gray-500">
                  {doc.obligatorio ? 'Obligatorio' : 'Opcional'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {doc.cargado ? (
                  <>
                    <span className="text-sm font-semibold text-green-700">✓ Cargado</span>
                    <Button
                      variant="ghost"
                      onClick={() => onQuitar(doc.documentoTipoId)}
                      disabled={subiendo === doc.documentoTipoId}
                    >
                      {subiendo === doc.documentoTipoId ? '...' : 'Quitar'}
                    </Button>
                  </>
                ) : (
                  <label className="cursor-pointer rounded-lg border-2 border-sigeb-blue px-4 py-1.5 text-sm font-semibold text-sigeb-blue transition-colors hover:bg-sigeb-blue hover:text-white">
                    {subiendo === doc.documentoTipoId ? 'Subiendo...' : 'Subir'}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={subiendo === doc.documentoTipoId}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onSubir(doc.documentoTipoId, file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PerfilItem({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
