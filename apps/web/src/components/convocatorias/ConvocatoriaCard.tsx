import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatearFecha, type Convocatoria } from '@/lib/api';

export function ConvocatoriaCard({
  convocatoria,
}: {
  convocatoria: Convocatoria;
}) {
  return (
    <Card className="flex flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge estado={convocatoria.estado} />
        <span className="brut-label font-mono text-xs font-bold uppercase text-sigeb-blue">
          {convocatoria.beca.nombre}
        </span>
      </div>
      <h3 className="mb-2 font-brut text-lg font-black uppercase leading-snug text-brutal-tinta">
        {convocatoria.nombre}
      </h3>
      {convocatoria.descripcion && (
        <p className="mb-4 line-clamp-3 text-sm text-brutal-tinta/70">
          {convocatoria.descripcion}
        </p>
      )}
      <dl className="mb-4 space-y-1 font-mono text-xs text-brutal-tinta/60">
        <div className="flex justify-between">
          <dt>Apertura</dt>
          <dd>{formatearFecha(convocatoria.fechaApertura)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Cierre</dt>
          <dd>{formatearFecha(convocatoria.fechaCierre)}</dd>
        </div>
      </dl>
      <Link
        href={`/convocatorias/${convocatoria.id}`}
        className="mt-auto rounded-brutal border-[3px] border-brutal-tinta bg-brutal-cyan px-4 py-2 text-center font-brut text-sm font-bold uppercase tracking-wide text-brutal-tinta shadow-brutal-sm transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
      >
        Ver detalles
      </Link>
    </Card>
  );
}
