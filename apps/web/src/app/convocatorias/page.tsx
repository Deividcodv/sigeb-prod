import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { ConvocatoriaCard } from '@/components/convocatorias/ConvocatoriaCard';
import { FiltrosConvocatorias } from '@/components/convocatorias/FiltrosConvocatorias';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetcher, type Convocatoria, type ListaResponse } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Convocatorias | EDUVIAGT',
  description:
    'Explora las convocatorias abiertas de becas del Ministerio de Educación de Guatemala.',
};

interface Props {
  searchParams: { busqueda?: string; beca?: string; estado?: string };
}

export const dynamic = 'force-dynamic';

export default async function ConvocatoriasPage({ searchParams }: Props) {
  const { busqueda, beca, estado } = searchParams;
  const params = new URLSearchParams();
  if (busqueda) params.set('busqueda', busqueda);
  const qs = params.toString();

  let convocatorias: Convocatoria[] = [];
  try {
    const res = await fetcher<ListaResponse<Convocatoria>>(
      `/convocatorias${qs ? `?${qs}` : ''}`,
    );
    convocatorias = res.data ?? [];
  } catch {
    // Se maneja abajo con estado vacío/error
  }

  const becasDisponibles = [...new Set(convocatorias.map((c) => c.beca.nombre))];

  if (beca) {
    convocatorias = convocatorias.filter((c) => c.beca.nombre === beca);
  }

  if (estado === 'ABIERTA') {
    convocatorias = convocatorias.filter((c) => c.estado === 'ABIERTA');
  } else if (estado === 'CERRADA') {
    convocatorias = convocatorias.filter((c) => c.estado !== 'ABIERTA');
  }

  const etiquetaContador =
    estado === 'ABIERTA'
      ? 'convocatoria(s) abierta(s)'
      : estado === 'CERRADA'
        ? 'convocatoria(s) no abierta(s)'
        : 'convocatoria(s)';

  return (
    <main>
      <section className="brut-cinta border-b-[3px] border-brutal-tinta bg-sigeb-blue-dark py-12 text-brutal-papel">
        <Container>
          <p className="brut-label text-xs font-bold text-brutal-gold">// Becas</p>
          <h1 className="text-mega text-3xl font-black md:text-5xl">Convocatorias</h1>
          <p className="mt-2 max-w-2xl font-mono text-sm text-brutal-papel/80">
            Encuentra las becas del Ministerio de Educación. Filtra por nombre,
            tipo de beca o estado para encontrar la oportunidad ideal.
          </p>
        </Container>
      </section>

      <section className="border-b-[3px] border-brutal-tinta bg-brutal-papel py-10">
        <Container>
          <div className="mb-8">
            <FiltrosConvocatorias becas={becasDisponibles} />
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="brut-label font-mono text-xs font-bold uppercase tracking-wide text-brutal-tinta">
              {convocatorias.length} {etiquetaContador}
            </p>
            {estado && (
              <span className="rounded-brutal border-2 border-brutal-tinta bg-brutal-cyan/20 px-3 py-1 font-mono text-[11px] font-bold uppercase text-brutal-tinta">
                Filtro: {estado === 'ABIERTA' ? 'Abiertas' : 'Cerradas'}
              </span>
            )}
          </div>

          {convocatorias.length === 0 ? (
            <EmptyState
              title="No hay convocatorias que coincidan"
              description="Prueba ajustando los filtros o vuelve más tarde. Las convocatorias se publican cuando abren."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {convocatorias.map((convocatoria) => (
                <ConvocatoriaCard key={convocatoria.id} convocatoria={convocatoria} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}