'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';

export default function EvaluadorPage() {
  return (
    <ProtectedRoute>
      <Container className="py-12">
        <h1 className="text-3xl font-bold text-sigeb-blue-dark">Panel del evaluador</h1>
        <p className="mt-2 text-gray-600">
          Aquí podrás revisar y evaluar las solicitudes asignadas.
        </p>
      </Container>
    </ProtectedRoute>
  );
}
