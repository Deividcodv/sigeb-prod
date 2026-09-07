'use client';

import { useEffect, useState } from 'react';
import { fetchConToken } from '@/lib/api-auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { SolicitudChecklist } from '@/lib/api';

export function PasoEnviar({
  solicitudId,
  onEnviado,
  onError,
}: {
  solicitudId: string;
  onEnviado: () => void;
  onError: (msg: string) => void;
}) {
  const [checklist, setChecklist] = useState<SolicitudChecklist | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetchConToken<SolicitudChecklist>(`/solicitudes/${solicitudId}/checklist`)
      .then(setChecklist)
      .catch((e) =>
        onError(
          e instanceof Error ? e.message : 'No se pudo cargar el resumen',
        ),
      );
  }, [solicitudId]);

  const enviar = async () => {
    setEnviando(true);
    try {
      await fetchConToken(`/solicitudes/${solicitudId}/transicion`, {
        method: 'POST',
        body: { accion: 'enviar', comentario: 'Solicitud enviada por el postulante' },
      });
      onEnviado();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud');
    } finally {
      setEnviando(false);
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
      <h2 className="mb-4 text-xl font-bold text-brutal-tinta">
        Revisa y envía
      </h2>
      <Card className="mb-6">
        <ul className="space-y-2 text-sm text-brutal-tinta/80">
          <li className="flex justify-between">
            <span>Perfil académico</span>
            <span className={checklist.perfilAcademico ? 'font-semibold text-green-700' : 'font-semibold text-red-600'}>
              {checklist.perfilAcademico ? 'Completo' : 'Incompleto'}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Perfil financiero</span>
            <span className={checklist.perfilFinanciero ? 'font-semibold text-green-700' : 'font-semibold text-red-600'}>
              {checklist.perfilFinanciero ? 'Completo' : 'Incompleto'}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Documentos obligatorios</span>
            <span className={checklist.completo ? 'font-semibold text-green-700' : 'font-semibold text-red-600'}>
              {checklist.completo ? 'Completos' : 'Faltan documentos'}
            </span>
          </li>
        </ul>
      </Card>

      {checklist.pendientes.length > 0 && (
        <p className="mb-4 rounded-brutal border-[3px] border-brutal-naranja bg-brutal-naranja/15 p-3 font-mono text-sm font-bold text-brutal-naranja">
          Falta completar: {checklist.pendientes.join(', ')}
        </p>
      )}

      <Button onClick={enviar} disabled={enviando || !checklist.completo}>
        {enviando ? <Spinner /> : 'Enviar solicitud'}
      </Button>
    </div>
  );
}
