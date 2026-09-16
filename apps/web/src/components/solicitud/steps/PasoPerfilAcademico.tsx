'use client';

import { useEffect, useState } from 'react';
import { fetchConToken } from '@/lib/api-auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { CatalogoOtro } from '@/components/solicitud/CatalogoOtro';
import {
  fetcher,
  type Genero,
  type NivelAcademico,
  type Departamento,
  type SolicitudDetalle,
} from '@/lib/api';

export function PasoPerfilAcademico({
  solicitudId,
  onGuardado,
  onError,
}: {
  solicitudId: string;
  onGuardado: () => void;
  onError: (msg: string) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [cargandoPrevia, setCargandoPrevia] = useState(true);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [niveles, setNiveles] = useState<NivelAcademico[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [form, setForm] = useState({
    generoId: '',
    generoOtro: '',
    nivelId: '',
    nivelOtro: '',
    departamentoId: '',
    departamentoOtro: '',
    municipioId: '',
    municipioOtro: '',
    institucion: '',
    carrera: '',
    promedio: '',
  });

  useEffect(() => {
    fetcher<{ data: Genero[] }>('/catalogos/generos').then((r) =>
      setGeneros(r.data ?? []),
    );
    fetcher<{ data: NivelAcademico[] }>('/catalogos/niveles-academicos').then(
      (r) => setNiveles(r.data ?? []),
    );
    fetcher<{ data: Departamento[] }>('/catalogos/departamentos').then((r) =>
      setDepartamentos(r.data ?? []),
    );
  }, []);

  useEffect(() => {
    let activo = true;
    setCargandoPrevia(true);
    fetchConToken<SolicitudDetalle>(`/solicitudes/${solicitudId}`)
      .then((solicitud) => {
        if (!activo) return;
        const perfil = solicitud.perfilAcademico;
        if (!perfil) return;
        setForm(() => ({
          generoId: perfil.generoId ?? (perfil.generoOtro ? '__otro__' : ''),
          generoOtro: perfil.generoOtro ?? '',
          nivelId:
            perfil.nivelAcademicoId ?? (perfil.nivelAcademicoOtro ? '__otro__' : ''),
          nivelOtro: perfil.nivelAcademicoOtro ?? '',
          departamentoId:
            perfil.departamentoId ?? (perfil.departamentoOtro ? '__otro__' : ''),
          departamentoOtro: perfil.departamentoOtro ?? '',
          municipioId: perfil.municipioId ?? (perfil.municipioOtro ? '__otro__' : ''),
          municipioOtro: perfil.municipioOtro ?? '',
          institucion: perfil.institucion ?? '',
          carrera: perfil.carrera ?? '',
          promedio: perfil.promedio === null ? '' : String(perfil.promedio),
        }));
      })
      .catch(() => {
        if (activo) onError('No se pudo cargar el perfil académico previo.');
      })
      .finally(() => {
        if (activo) setCargandoPrevia(false);
      });
    return () => {
      activo = false;
    };
  }, [solicitudId, onError]);

  const departamento = departamentos.find(
    (d) => d.id === form.departamentoId,
  );
  const municipios = departamento?.municipios ?? [];

  const validar = (): string | null => {
    if (form.generoId === '__otro__' && !form.generoOtro.trim()) {
      return 'Escribe una opción en «Género (otro)».';
    }
    if (form.nivelId === '__otro__' && !form.nivelOtro.trim()) {
      return 'Escribe una opción en «Nivel académico (otro)».';
    }
    if (form.departamentoId === '__otro__' && !form.departamentoOtro.trim()) {
      return 'Escribe una opción en «Departamento (otro)».';
    }
    if (form.municipioId === '__otro__' && !form.municipioOtro.trim()) {
      return 'Escribe una opción en «Municipio (otro)».';
    }
    if (form.promedio !== '') {
      const promedio = Number(form.promedio);
      if (Number.isNaN(promedio) || promedio < 0 || promedio > 100) {
        return 'El promedio debe estar entre 0 y 100.';
      }
    }
    return null;
  };

  const guardar = async () => {
    const errorValidacion = validar();
    if (errorValidacion) {
      onError(errorValidacion);
      return;
    }
    setEnviando(true);
    try {
      const body = {
        institucion: form.institucion || undefined,
        carrera: form.carrera || undefined,
        promedio:
          form.promedio === '' ? undefined : Number(form.promedio),
        generoId: form.generoId === '__otro__' ? undefined : form.generoId || undefined,
        generoOtro:
          form.generoId === '__otro__' && form.generoOtro
            ? form.generoOtro
            : undefined,
        nivelAcademicoId:
          form.nivelId === '__otro__' ? undefined : form.nivelId || undefined,
        nivelAcademicoOtro:
          form.nivelId === '__otro__' && form.nivelOtro
            ? form.nivelOtro
            : undefined,
        departamentoId:
          form.departamentoId === '__otro__'
            ? undefined
            : form.departamentoId || undefined,
        departamentoOtro:
          form.departamentoId === '__otro__' && form.departamentoOtro
            ? form.departamentoOtro
            : undefined,
        municipioId:
          form.municipioId === '__otro__'
            ? undefined
            : form.municipioId || undefined,
        municipioOtro:
          form.municipioId === '__otro__' && form.municipioOtro
            ? form.municipioOtro
            : undefined,
      };
      await fetchConToken(`/solicitudes/${solicitudId}/perfil-academico`, {
        method: 'PUT',
        body,
      });
      onGuardado();
    } catch (e) {
      onError(
        e instanceof Error ? e.message : 'No se pudo guardar el perfil académico',
      );
    } finally {
      setEnviando(false);
    }
  };

  if (cargandoPrevia) {
    return (
      <div className="flex items-center gap-3 py-10 font-mono text-sm font-bold text-brutal-tinta/70">
        <Spinner /> Cargando tu perfil previamente guardado…
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-brutal-tinta">
        Perfil académico
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <CatalogoOtro
          nombre="Género"
          opciones={generos.map((g) => ({ value: g.id, label: g.nombre }))}
          value={form.generoId}
          otroValue={form.generoOtro}
          onChange={(id) =>
            setForm((f) => ({ ...f, generoId: id, generoOtro: '' }))
          }
          onOtroChange={(t) =>
            setForm((f) => ({ ...f, generoOtro: t }))
          }
        />
        <CatalogoOtro
          nombre="Nivel académico"
          opciones={niveles.map((n) => ({ value: n.id, label: n.nombre }))}
          value={form.nivelId}
          otroValue={form.nivelOtro}
          onChange={(id) =>
            setForm((f) => ({ ...f, nivelId: id, nivelOtro: '' }))
          }
          onOtroChange={(t) => setForm((f) => ({ ...f, nivelOtro: t }))}
        />
        <CatalogoOtro
          nombre="Departamento"
          opciones={departamentos.map((d) => ({ value: d.id, label: d.nombre }))}
          value={form.departamentoId}
          otroValue={form.departamentoOtro}
          onChange={(id) =>
            setForm((f) => ({
              ...f,
              departamentoId: id,
              departamentoOtro: '',
              municipioId: '',
            }))
          }
          onOtroChange={(t) => setForm((f) => ({ ...f, departamentoOtro: t }))}
        />
        <CatalogoOtro
          nombre="Municipio"
          opciones={municipios.map((m) => ({ value: m.id, label: m.nombre }))}
          value={form.municipioId}
          otroValue={form.municipioOtro}
          onChange={(id) =>
            setForm((f) => ({ ...f, municipioId: id, municipioOtro: '' }))
          }
          onOtroChange={(t) => setForm((f) => ({ ...f, municipioOtro: t }))}
        />
        <Input
          label="Institución"
          value={form.institucion}
          onChange={(e) => setForm((f) => ({ ...f, institucion: e.target.value }))}
        />
        <Input
          label="Carrera"
          value={form.carrera}
          onChange={(e) => setForm((f) => ({ ...f, carrera: e.target.value }))}
        />
        <Input
          label="Promedio (0-100)"
          type="number"
          min={0}
          max={100}
          step="0.01"
          value={form.promedio}
          onChange={(e) => setForm((f) => ({ ...f, promedio: e.target.value }))}
        />
      </div>
      <div className="mt-6">
        <Button onClick={guardar} disabled={enviando}>
          {enviando ? <Spinner /> : 'Guardar y continuar'}
        </Button>
      </div>
    </div>
  );
}