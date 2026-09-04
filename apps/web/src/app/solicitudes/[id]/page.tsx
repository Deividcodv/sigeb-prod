'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { fetchConToken, descargarConstancia } from '@/lib/api-auth';
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

  const descargarPdf = async () => {
    setError(null);
    try {
      await descargarConstancia(solicitud.id);
      setExito('Constancia descargada.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo descargar la constancia');
    }
  };

  return (
    <>
      <section className="brut-cinta border-b-[3px] border-brutal-tinta bg-sigeb-blue-dark py-10 text-brutal-papel">
        <Container>
          <button
            onClick={() => router.replace('/dashboard')}
            className="mb-4 inline-block rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco px-3 py-1 font-mono text-xs font-bold text-brutal-tinta"
          >
            ← Volver al dashboard
          </button>
          <p className="mb-2 inline-block rounded-brutal border-[3px] border-brutal-tinta bg-brutal-gold px-3 py-1 font-brut text-xs font-bold uppercase tracking-wide text-brutal-tinta">
            Sistema interno
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Badge estado={solicitud.estado} />
            <span className="brut-label font-mono text-xs font-bold uppercase text-brutal-gold">
              {solicitud.convocatoria.beca.nombre}
            </span>
          </div>
          <h1 className="text-mega mt-3 font-black text-2xl uppercase md:text-4xl">
            {solicitud.convocatoria.nombre}
          </h1>
          <p className="mt-1 font-mono text-sm text-brutal-papel/80">
            Postulada el {formatearFecha(solicitud.createdAt)}
          </p>
          {solicitud.estado === 'APROBADA' && (
            <Button
              onClick={descargarPdf}
              className="mt-5"
            >
              Descargar constancia (PDF)
            </Button>
          )}
        </Container>
      </section>

      <Container className="py-8">
        {error && (
          <p className="mb-4 rounded-brutal border-[3px] border-brutal-rojo bg-red-50 p-4 text-sm font-bold text-brutal-rojo">
            {error}
          </p>
        )}
        {exito && (
          <p className="mb-4 rounded-brutal border-[3px] border-brutal-tinta bg-brutal-lima/30 p-4 text-sm font-bold text-brutal-tinta">
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
              <h2 className="mb-3 font-brut text-lg font-black uppercase tracking-wide text-brutal-tinta">
                Historial de la solicitud
              </h2>
              {solicitud.historial && solicitud.historial.length > 0 ? (
                <ol className="space-y-3 border-l-[3px] border-brutal-tinta pl-4">
                  {solicitud.historial.map((h, i) => (
                    <li key={i}>
                      <p className="flex flex-wrap items-center gap-2 font-mono">
                        <Badge estado={h.estado} />
                        <span className="text-xs text-brutal-tinta/75">
                          {formatearFecha(h.fecha)}
                        </span>
                      </p>
                      {h.comentario && (
                        <p className="mt-1 font-mono text-sm text-brutal-tinta/80">{h.comentario}</p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-brutal-tinta/75">Sin movimientos registrados.</p>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="mb-3 text-lg font-black text-brutal-tinta">
                Perfil académico
              </h2>
              {solicitud.perfilAcademico ? (
                <dl className="space-y-1 text-sm text-brutal-tinta/70">
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
                <p className="text-sm text-brutal-tinta/70">No completado.</p>
              )}
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-black text-brutal-tinta">
                Perfil financiero
              </h2>
              {solicitud.perfilFinanciero ? (
                <dl className="space-y-1 text-sm text-brutal-tinta/70">
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
                <p className="text-sm text-brutal-tinta/70">No completado.</p>
              )}
            </Card>

            {puedeEnviar && (
              <Card>
                <h2 className="mb-2 text-lg font-black text-brutal-tinta">
                  Enviar solicitud
                </h2>
                <p className="mb-4 text-sm text-brutal-tinta/70">
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
      <h2 className="mb-4 font-brut text-lg font-black uppercase tracking-wide text-brutal-tinta">
        Documentos
      </h2>
      {documentos.length === 0 ? (
        <p className="font-mono text-sm text-brutal-tinta/75">No se requieren documentos para esta solicitud.</p>
      ) : (
        <div className="space-y-3">
          {documentos.map((doc) => (
            <div
              key={doc.documentoTipoId}
              className="flex flex-col gap-2 rounded-brutal border-[3px] border-brutal-tinta bg-brutal-papel p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta">{doc.nombre}</p>
                <p className="font-mono text-xs text-brutal-tinta/75">
                  {doc.obligatorio ? 'Obligatorio' : 'Opcional'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {doc.cargado ? (
                  <>
                    <span className="rounded-brutal border-2 border-brutal-tinta bg-brutal-lima px-2 py-0.5 font-brut text-xs font-bold text-brutal-tinta">✓ Cargado</span>
                    <Button
                      variant="ghost"
                      onClick={() => onQuitar(doc.documentoTipoId)}
                      disabled={subiendo === doc.documentoTipoId}
                    >
                      {subiendo === doc.documentoTipoId ? '...' : 'Quitar'}
                    </Button>
                  </>
                ) : (
                  <label className="cursor-pointer rounded-brutal border-[3px] border-brutal-tinta bg-brutal-cyan px-4 py-1.5 font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
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
      <dt className="text-brutal-tinta/70">{label}</dt>
      <dd className="font-medium text-brutal-tinta">{value}</dd>
    </div>
  );
}
