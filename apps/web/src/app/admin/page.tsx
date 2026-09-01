'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <Container className="py-12">
        <h1 className="text-3xl font-bold text-sigeb-blue-dark">Panel de administración</h1>
        <p className="mt-2 text-gray-600">
          Gestiona convocatorias, usuarios y roles del sistema.
        </p>
      </Container>
    </ProtectedRoute>
  );
}
