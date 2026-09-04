'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { fetchConToken } from '@/lib/api-auth';
import { Container } from '@/components/ui/Container';
import { Stepper } from '@/components/ui/Stepper';
import { InternalPageHeader } from '@/components/ui/InternalPageHeader';
import {
  PasoConvocatoria,
  PasoPerfilAcademico,
  PasoPerfilFinanciero,
  PasoDocumentos,
  PasoEnviar,
} from '@/components/solicitud/steps';

const PASOS = [
  'Convocatoria',
  'Perfil académico',
  'Perfil financiero',
  'Documentos',
  'Enviar',
];

export default function NuevaSolicitudPage() {
  return (
    <ProtectedRoute roles={['POSTULANTE']}>
      <NuevaSolicitudContent />
    </ProtectedRoute>
  );
}

function NuevaSolicitudContent() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avanzar = () => setPaso((p) => Math.min(p + 1, PASOS.length));
  const terminar = () => {
    if (solicitudId) {
      router.replace(`/solicitudes/${solicitudId}`);
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <>
      <InternalPageHeader
        title="Nueva solicitud"
        subtitle="Completa los pasos para postularte a una convocatoria."
      />

      <Container className="py-8">
        <div className="mb-8">
          <Stepper pasos={PASOS} actual={paso} />
        </div>

        {error && (
          <p className="mb-6 rounded-brutal border-[3px] border-brutal-rojo bg-red-50 p-4 text-sm font-bold text-brutal-rojo">
            {error}
          </p>
        )}

        {paso === 1 && (
          <PasoConvocatoria
            onSeleccionar={async (id) => {
              setError(null);
              try {
                const creada = await fetchConToken<{ id: string }>(
                  '/solicitudes',
                  { method: 'POST', body: { convocatoriaId: id } },
                );
                setSolicitudId(creada.id);
                avanzar();
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : 'No se pudo crear la solicitud',
                );
              }
            }}
          />
        )}

        {paso === 2 && solicitudId && (
          <PasoPerfilAcademico
            solicitudId={solicitudId}
            onGuardado={avanzar}
            onError={(msg) => setError(msg)}
          />
        )}

        {paso === 3 && solicitudId && (
          <PasoPerfilFinanciero
            solicitudId={solicitudId}
            onGuardado={avanzar}
            onError={(msg) => setError(msg)}
          />
        )}

        {paso === 4 && solicitudId && (
          <PasoDocumentos
            solicitudId={solicitudId}
            onCompletado={avanzar}
            onError={(msg) => setError(msg)}
          />
        )}

        {paso === 5 && solicitudId && (
          <PasoEnviar
            solicitudId={solicitudId}
            onEnviado={terminar}
            onError={(msg) => setError(msg)}
          />
        )}
      </Container>
    </>
  );
}
