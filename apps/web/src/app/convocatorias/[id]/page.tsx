import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  fetcher,
  formatearFecha,
  type ConvocatoriaDetalle,
} from '@/lib/api';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let convocatoria: ConvocatoriaDetalle | null = null;
  try {
    convocatoria = await fetcher<ConvocatoriaDetalle>(`/convocatorias/${params.id}`);
  } catch {
    return { title: 'Convocatoria | SIGEB' };
  }
  return {
    title: `${convocatoria.nombre} | SIGEB`,
    description: convocatoria.descripcion ?? undefined,
  };
}

export default async function ConvocatoriaDetallePage({ params }: Props) {
  let convocatoria: ConvocatoriaDetalle;
  try {
    convocatoria = await fetcher<ConvocatoriaDetalle>(
      `/convocatorias/${params.id}`,
    );
  } catch {
    return notFound();
  }

  const docs = convocatoria.documentosRequeridos ?? [];
  const criterios = convocatoria.beca?.criteriosEvaluacion ?? [];

  return (
    <main>
      <section className="brut-cinta border-b-[3px] border-brutal-tinta bg-sigeb-blue-dark py-12 text-brutal-papel">
        <Container>
          <Link
            href="/convocatorias"
            className="mb-6 inline-block rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco px-3 py-1 font-mono text-xs font-bold text-brutal-tinta"
          >
            ← Volver a convocatorias
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Badge estado={convocatoria.estado} />
            <span className="brut-label font-mono text-xs font-bold uppercase text-brutal-gold">
              {convocatoria.beca.nombre}
            </span>
          </div>
          <h1 className="text-mega mt-3 text-3xl font-black md:text-5xl">
            {convocatoria.nombre}
          </h1>
        </Container>
      </section>

      <section className="bg-brutal-papel py-10">
        <Container>
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-6 shadow-brutal-sm">
                <h2 className="mb-3 font-brut text-xl font-black uppercase tracking-wide text-brutal-tinta">
                  Descripción
                </h2>
                <p className="whitespace-pre-line text-brutal-tinta/80">
                  {convocatoria.descripcion ||
                    'No se ha proporcionado una descripción para esta convocatoria.'}
                </p>
              </div>

              {criterios.length > 0 && (
                <div className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-6 shadow-brutal-sm">
                  <h2 className="mb-3 font-brut text-xl font-black uppercase tracking-wide text-brutal-tinta">
                    Criterios de evaluación
                  </h2>
                  <table className="w-full text-left font-mono text-sm">
                    <thead>
                      <tr className="border-b-[3px] border-brutal-tinta text-brutal-tinta">
                        <th className="py-2 pr-4 font-bold">Criterio</th>
                        <th className="py-2 font-bold">Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criterios.map((criterio) => (
                        <tr key={criterio.id} className="border-b border-brutal-tinta/20">
                          <td className="py-2 pr-4 text-brutal-tinta">{criterio.nombre}</td>
                          <td className="py-2 font-bold text-brutal-tinta">
                            {(criterio.peso * 100).toFixed(0)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-6 shadow-brutal-sm">
                <h2 className="mb-3 font-brut text-lg font-black uppercase tracking-wide text-brutal-tinta">
                  Datos de la convocatoria
                </h2>
                <dl className="space-y-2 font-mono text-sm text-brutal-tinta/70">
                  <div className="flex justify-between">
                    <dt>Apertura</dt>
                    <dd className="font-bold text-brutal-tinta">
                      {formatearFecha(convocatoria.fechaApertura)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Cierre</dt>
                    <dd className="font-bold text-brutal-tinta">
                      {formatearFecha(convocatoria.fechaCierre)}
                    </dd>
                  </div>
                </dl>
              </div>

              {docs.length > 0 && (
                <div className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-6 shadow-brutal-sm">
                  <h2 className="mb-3 font-brut text-lg font-black uppercase tracking-wide text-brutal-tinta">
                    Documentos requeridos
                  </h2>
                  <ul className="space-y-2 font-mono text-sm text-brutal-tinta/80">
                    {docs.map((doc) => (
                      <li key={doc.id} className="flex items-start justify-between gap-2">
                        <span>{doc.documentoTipo.nombre}</span>
                        <span
                          className={`shrink-0 rounded-brutal border-2 px-2 py-0.5 text-xs font-bold ${
                            doc.obligatorio
                              ? 'border-brutal-rojo bg-brutal-rojo/15 text-brutal-rojo'
                              : 'border-brutal-tinta bg-brutal-tinta/10 text-brutal-tinta'
                          }`}
                        >
                          {doc.obligatorio ? 'Obligatorio' : 'Opcional'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button href="/registro" className="w-full text-center">
                Postularme
              </Button>
              <p className="text-center font-mono text-xs text-brutal-tinta/80">
                Crear una cuenta para iniciar tu postulación.{' '}
                <Link href="/login" className="font-brut font-bold text-brutal-cyan hover:bg-brutal-cyan/20">
                  Inicia sesión
                </Link>{' '}
                si ya tienes una.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
