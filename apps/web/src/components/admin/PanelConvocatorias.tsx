'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchConToken } from '@/lib/api-auth';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { formatearFecha, type Beca, type Convocatoria } from '@/lib/api';

const accionesPorEstado: Record<string, { value: string; label: string }[]> = {
  BORRADOR: [{ value: 'publicar', label: 'Publicar' }],
  ABIERTA: [{ value: 'cerrar', label: 'Cerrar' }],
  CERRADA: [{ value: 'iniciar_evaluacion', label: 'Iniciar evaluación' }],
  EN_EVALUACION: [{ value: 'resolver', label: 'Resolver' }],
  RESUELTA: [{ value: 'archivar', label: 'Archivar' }],
};

export function PanelConvocatorias() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[] | null>(null);
  const [becas, setBecas] = useState<Beca[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: '',
    descripcion: '',
    becaId: '',
    fechaApertura: '',
    fechaCierre: '',
  });
  const [acciones, setAcciones] = useState<Record<string, string>>({});

  const cargar = useCallback(async () => {
    try {
      const [lista, catBecas] = await Promise.all([
        fetchConToken<Convocatoria[]>('/convocatorias/todas'),
        fetchConToken<Beca[]>('/catalogos/becas'),
      ]);
      setConvocatorias(lista);
      setBecas(catBecas);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las convocatorias');
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const crear = async () => {
    if (!nuevo.nombre || !nuevo.becaId) {
      setError('Nombre y beca son obligatorios');
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await fetchConToken('/convocatorias', {
        method: 'POST',
        body: {
          nombre: nuevo.nombre,
          descripcion: nuevo.descripcion || undefined,
          becaId: nuevo.becaId,
          fechaApertura: nuevo.fechaApertura
            ? new Date(nuevo.fechaApertura).toISOString()
            : undefined,
          fechaCierre: nuevo.fechaCierre
            ? new Date(nuevo.fechaCierre).toISOString()
            : undefined,
        },
      });
      setExito('Convocatoria creada.');
      setMostrarForm(false);
      setNuevo({ nombre: '', descripcion: '', becaId: '', fechaApertura: '', fechaCierre: '' });
      cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la convocatoria');
    } finally {
      setEnviando(false);
    }
  };

  const transicionar = async (id: string) => {
    const accion = acciones[id];
    if (!accion) return;
    setEnviando(true);
    setError(null);
    try {
      await fetchConToken(`/convocatorias/${id}/transicion`, {
        method: 'POST',
        body: { accion },
      });
      setExito('Estado actualizado.');
      cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el estado');
    } finally {
      setEnviando(false);
    }
  };

  if (!convocatorias) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-brutal border-[3px] border-brutal-rojo bg-red-50 p-4 text-sm font-bold text-brutal-rojo">{error}</p>
      )}
      {exito && (
        <p className="mb-4 rounded-brutal border-[3px] border-brutal-tinta bg-brutal-lima/30 p-4 text-sm font-bold text-brutal-tinta">{exito}</p>
      )}

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nueva convocatoria'}
        </Button>
      </div>

      {mostrarForm && (
        <Card className="mb-6">
          <h2 className="mb-4 font-brut text-lg font-black uppercase tracking-wide text-brutal-tinta">
            Nueva convocatoria
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Nombre"
              value={nuevo.nombre}
              onChange={(e) => setNuevo((n) => ({ ...n, nombre: e.target.value }))}
            />
            <Select
              label="Beca"
              value={nuevo.becaId}
              onChange={(e) => setNuevo((n) => ({ ...n, becaId: e.target.value }))}
              options={becas.map((b) => ({ value: b.id, label: b.nombre }))}
            />
            <div className="md:col-span-2">
              <Input
                label="Descripción"
                value={nuevo.descripcion}
                onChange={(e) => setNuevo((n) => ({ ...n, descripcion: e.target.value }))}
              />
            </div>
            <Input
              label="Fecha de apertura"
              type="datetime-local"
              value={nuevo.fechaApertura}
              onChange={(e) => setNuevo((n) => ({ ...n, fechaApertura: e.target.value }))}
            />
            <Input
              label="Fecha de cierre"
              type="datetime-local"
              value={nuevo.fechaCierre}
              onChange={(e) => setNuevo((n) => ({ ...n, fechaCierre: e.target.value }))}
            />
          </div>
          <div className="mt-4">
            <Button onClick={crear} disabled={enviando}>
              {enviando ? <Spinner /> : 'Crear'}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {convocatorias.map((convocatoria) => {
          const opciones = accionesPorEstado[convocatoria.estado] ?? [];
          return (
            <Card
              key={convocatoria.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-brutal-tinta">
                    {convocatoria.nombre}
                  </h3>
                  <Badge estado={convocatoria.estado} />
                </div>
                <p className="text-sm text-brutal-tinta/70">{convocatoria.beca.nombre}</p>
                <p className="text-sm text-brutal-tinta/70">
                  Cierra el {formatearFecha(convocatoria.fechaCierre)} ·{' '}
                  {convocatoria._count?.solicitudes ?? 0} solicitudes
                </p>
              </div>
              {opciones.length > 0 && (
                <div className="flex items-center gap-2">
                  <Select
                    value={acciones[convocatoria.id] ?? ''}
                    onChange={(e) =>
                      setAcciones((a) => ({ ...a, [convocatoria.id]: e.target.value }))
                    }
                    options={opciones}
                    className="w-52"
                  />
                  <Button
                    onClick={() => transicionar(convocatoria.id)}
                    disabled={!acciones[convocatoria.id] || enviando}
                  >
                    Aplicar
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
