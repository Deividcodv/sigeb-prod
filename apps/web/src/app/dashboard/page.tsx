'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Container } from '@/components/ui/Container';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { usuario } = useAuth();
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-bold text-sigeb-blue-dark">
        Hola, {usuario?.nombres}
      </h1>
      <p className="mt-2 text-gray-600">Bienvenido a tu área de postulante.</p>
    </Container>
  );
}
