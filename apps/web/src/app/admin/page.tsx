'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { InternalPageHeader } from '@/components/ui/InternalPageHeader';
import { PanelSolicitudes } from '@/components/admin/PanelSolicitudes';
import { PanelComites } from '@/components/admin/PanelComites';
import { PanelSesiones } from '@/components/admin/PanelSesiones';
import { PanelSeguridad } from '@/components/admin/PanelSeguridad';
import { PanelConvocatorias } from '@/components/admin/PanelConvocatorias';

export default function AdminPage() {
  return (
    <ProtectedRoute roles={['ADMIN']}>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const [pestana, setPestana] = useState<
    | 'convocatorias'
    | 'solicitudes'
    | 'comites'
    | 'sesiones'
    | 'seguridad'
  >('convocatorias');

  return (
    <>
      <InternalPageHeader
        title="Panel de administración"
        subtitle="Gestiona convocatorias, evaluaciones, comités, sesiones y usuarios del sistema."
      />

      <Container className="py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={pestana === 'convocatorias' ? 'primary' : 'ghost'}
            onClick={() => setPestana('convocatorias')}
          >
            Convocatorias
          </Button>
          <Button
            variant={pestana === 'solicitudes' ? 'primary' : 'ghost'}
            onClick={() => setPestana('solicitudes')}
          >
            Solicitudes
          </Button>
          <Button
            variant={pestana === 'comites' ? 'primary' : 'ghost'}
            onClick={() => setPestana('comites')}
          >
            Comités
          </Button>
          <Button
            variant={pestana === 'sesiones' ? 'primary' : 'ghost'}
            onClick={() => setPestana('sesiones')}
          >
            Sesiones
          </Button>
          <Button
            variant={pestana === 'seguridad' ? 'primary' : 'ghost'}
            onClick={() => setPestana('seguridad')}
          >
            Seguridad
          </Button>
        </div>

        {pestana === 'convocatorias' && <PanelConvocatorias />}
        {pestana === 'solicitudes' && <PanelSolicitudes />}
        {pestana === 'comites' && <PanelComites />}
        {pestana === 'sesiones' && <PanelSesiones />}
        {pestana === 'seguridad' && <PanelSeguridad />}
      </Container>
    </>
  );
}
