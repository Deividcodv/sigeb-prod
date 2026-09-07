import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'Nosotros | SIGEB',
  description:
    'Conoce al Ministerio de Educación de Guatemala, su misión, visión y los programas de becas gestionados a través de SIGEB.',
};

const bloques = [
  {
    titulo: 'Misión',
    texto:
      'Garantizar el acceso a una educación de calidad para todas las personas, creando oportunidades que transforman vidas a través de programas de becas que apoyan la formación académica en Guatemala.',
  },
  {
    titulo: 'Visión',
    texto:
      'Ser el sistema referente de gestión de becas en la región, reconocido por su transparencia, eficiencia e impacto en la reducción de la deserción escolar y el acceso equitativo a la educación superior.',
  },
];

export default function NosotrosPage() {
  return (
    <main>
      <section className="brut-cinta border-b-[3px] border-brutal-tinta bg-sigeb-blue-dark py-12 text-brutal-papel">
        <Container>
          <p className="brut-label text-xs font-bold text-brutal-gold">// Nosotros</p>
          <h1 className="text-mega text-3xl font-black md:text-5xl">Nosotros</h1>
          <p className="mt-2 max-w-2xl font-mono text-sm text-brutal-papel/80">
            Conoce al Ministerio de Educación y el sistema que hace posible la
            gestión de becas en Guatemala.
          </p>
        </Container>
      </section>

      <section className="bg-brutal-papel py-12">
        <Container>
          <div className="mx-auto max-w-4xl space-y-8">
            {bloques.map((bloque) => (
              <div
                key={bloque.titulo}
                className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-8 shadow-brutal-sm"
              >
                <h2 className="mb-3 font-brut text-2xl font-black uppercase tracking-wide text-brutal-cyan">
                  {bloque.titulo}
                </h2>
                <p className="text-brutal-tinta/80">{bloque.texto}</p>
              </div>
            ))}

            <div className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-8 shadow-brutal-sm">
              <h2 className="mb-3 font-brut text-2xl font-black uppercase tracking-wide text-brutal-cyan">
                Objetivos
              </h2>
              <ul className="space-y-2 pl-5 text-brutal-tinta/80 marker:text-brutal-gold">
                <li>Ampliar el acceso a becas de excelencia académica.</li>
                <li>Garantizar un proceso de postulación transparente y justo.</li>
                <li>Facilitar el seguimiento de solicitudes en tiempo real.</li>
                <li>Fomentar la permanencia y culminación de estudios superiores.</li>
              </ul>
            </div>

            <div className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-8 shadow-brutal-sm">
              <h2 className="mb-3 font-brut text-2xl font-black uppercase tracking-wide text-brutal-cyan">
                Programas de becas
              </h2>
              <ul className="space-y-2 pl-5 text-brutal-tinta/80 marker:text-brutal-gold">
                <li>Beca de Excelencia Académica</li>
                <li>Beca de Inspiración Cívica</li>
                <li>Programas de apoyo a la formación técnica y profesional</li>
              </ul>
            </div>

            <div className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-8 shadow-brutal-sm">
              <h2 className="mb-3 font-brut text-2xl font-black uppercase tracking-wide text-brutal-cyan">
                Transparencia
              </h2>
              <p className="text-brutal-tinta/80">
                SIGEB publica los resultados de cada convocatoria y mantiene un
                registro auditable de todas las acciones del proceso, asegurando
                que cada decisión sea documentada y verificable.
              </p>
            </div>

            <div className="rounded-brutal border-[3px] border-brutal-tinta bg-brutal-blanco p-8 shadow-brutal-sm">
              <h2 className="mb-3 font-brut text-2xl font-black uppercase tracking-wide text-brutal-cyan">
                Contacto
              </h2>
              <p className="text-brutal-tinta/80">Ministerio de Educación de Guatemala</p>
              <p className="text-brutal-tinta/80">
                Para consultas sobre becas, contáctanos a través de nuestro{' '}
                <a href="/consulta" className="font-brut font-bold text-brutal-cyan hover:bg-brutal-cyan">
                  consulta de solicitudes
                </a>{' '}
                o el centro de ayuda.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}