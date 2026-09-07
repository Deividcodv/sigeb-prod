'use client';

import { useEffect, useState } from 'react';
import { fetchConToken } from '@/lib/api-auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { SolicitudChecklist } from '@/lib/api';

export function PasoDocumentos({
  solicitudId,
  onCompletado,
  onError,
}: {
  solicitudId: string;
  onCompletado: () => void;
  onError: (msg: string) => void;
}) {
  const [checklist, setChecklist] = useState<SolicitudChecklist | null>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);

  const cargar = async () => {
    try {
      const data = await fetchConToken<SolicitudChecklist>(
        `/solicitudes/${solicitudId}/checklist`,
      );
      setChecklist(data);
    } catch (e) {
      onError(
        e instanceof Error ? e.message : 'No se pudo cargar el checklist',
      );
    }
  };

  useEffect(() => {
    cargar();
  }, [solicitudId]);

  const subir = async (tipoId: string, file: File) => {
    setSubiendo(tipoId);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await fetchConToken(`/solicitudes/${solicitudId}/documentos/${tipoId}`, {
        method: 'POST',
        body: fd,
        isFormData: true,
      });
      await cargar();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo subir el documento');
    } finally {
      setSubiendo(null);
    }
  };

  const quitar = async (tipoId: string) => {
    setSubiendo(tipoId);
    try {
      await fetchConToken(`/solicitudes/${solicitudId}/documentos/${tipoId}`, {
        method: 'DELETE',
      });
      await cargar();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo eliminar el documento');
    } finally {
      setSubiendo(null);
    }
  };

  if (!checklist) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-brutal-tinta">
        Documentos requeridos
      </h2>
      <p className="mb-5 text-sm text-brutal-tinta/70">
        Sube cada documento requerido (PDF, JPG o PNG, máx. 5 MB).
      </p>
      <div className="space-y-3">
        {checklist.documentos.map((doc) => (
          <Card key={doc.documentoTipoId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-brutal-tinta">{doc.nombre}</p>
              <p className="text-xs text-brutal-tinta/70">
                {doc.obligatorio ? 'Obligatorio' : 'Opcional'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {doc.cargado ? (
                <>
                  <span className="text-sm font-semibold text-green-700">
                    ✓ Cargado
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => quitar(doc.documentoTipoId)}
                    disabled={subiendo === doc.documentoTipoId}
                  >
                    {subiendo === doc.documentoTipoId ? '...' : 'Quitar'}
                  </Button>
                </>
              ) : (
                <label className="cursor-pointer rounded-brutal border-[3px] border-brutal-tinta bg-brutal-cyan px-4 py-2 font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta shadow-brutal-sm transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                  {subiendo === doc.documentoTipoId ? 'Subiendo...' : 'Subir archivo'}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={subiendo === doc.documentoTipoId}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) subir(doc.documentoTipoId, file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Button onClick={onCompletado}>Continuar</Button>
      </div>
    </div>
  );
}
