'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { fetchConToken } from '@/lib/api-auth';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Stepper } from '@/components/ui/Stepper';
import { CatalogoOtro } from '@/components/solicitud/CatalogoOtro';
import {
  fetcher,
  formatearFecha,
  type Convocatoria,
  type SolicitudChecklist,
  type Genero,
  type NivelAcademico,
  type Departamento,
} from '@/lib/api';

const PASOS = [
  'Convocatoria',
  'Perfil académico',
  'Perfil financiero',
  'Documentos',
  'Enviar',
];

export default function NuevaSolicitudPage() {
  return (
    <ProtectedRoute roles={['POSTULANTE']}>
      <NuevaSolicitudContent />
    </ProtectedRoute>
  );
}

function NuevaSolicitudContent() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avanzar = () => setPaso((p) => Math.min(p + 1, PASOS.length));
  const atras = () => setPaso((p) => Math.max(p - 1, 1));

  const terminar = () => {
    if (solicitudId) {
      router.replace(`/solicitudes/${solicitudId}`);
    } else {
      router.replace('/dashboard');
    }
  };

  return (
    <>
      <section className="bg-sigeb-blue py-10 text-white">
        <Container>
          <h1 className="text-2xl font-bold md:text-3xl">Nueva solicitud</h1>
          <p className="mt-1 text-sigeb-white/90">
            Completa los pasos para postularte a una convocatoria.
          </p>
        </Container>
      </section>

      <Container className="py-8">
        <div className="mb-8">
          <Stepper pasos={PASOS} actual={paso} />
        </div>

        {error && (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        {paso === 1 && (
          <PasoConvocatoria
            onSeleccionar={async (id) => {
              setError(null);
              try {
                const creada = await fetchConToken<{ id: string }>(
                  '/solicitudes',
                  { method: 'POST', body: { convocatoriaId: id } },
                );
                setSolicitudId(creada.id);
                avanzar();
              } catch (e) {
                setError(
                  e instanceof Error
                    ? e.message
                    : 'No se pudo crear la solicitud',
                );
              }
            }}
          />
        )}

        {paso === 2 && solicitudId && (
          <PasoPerfilAcademico
            solicitudId={solicitudId}
            onGuardado={avanzar}
            onError={(msg) => setError(msg)}
          />
        )}

        {paso === 3 && solicitudId && (
          <PasoPerfilFinanciero
            solicitudId={solicitudId}
            onGuardado={avanzar}
            onError={(msg) => setError(msg)}
          />
        )}

        {paso === 4 && solicitudId && (
          <PasoDocumentos
            solicitudId={solicitudId}
            onCompletado={avanzar}
            onError={(msg) => setError(msg)}
          />
        )}

        {paso === 5 && solicitudId && (
          <PasoEnviar
            solicitudId={solicitudId}
            onEnviado={terminar}
            onError={(msg) => setError(msg)}
          />
        )}

        <div className="mt-8 flex justify-between">
          <Button variant="ghost" onClick={atras} disabled={paso === 1}>
            ← Atrás
          </Button>
        </div>
      </Container>
    </>
  );
}

function PasoConvocatoria({
  onSeleccionar,
}: {
  onSeleccionar: (id: string) => void;
}) {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetcher<{ data: Convocatoria[] }>('/convocatorias')
      .then((res) => setConvocatorias(res.data ?? []))
      .catch(() => {
        setError('No se pudieron cargar las convocatorias abiertas.');
        setConvocatorias([]);
      });
  }, []);

  if (!convocatorias) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <h2 className="mb-4 text-xl font-bold text-sigeb-blue-dark">
        Elige una convocatoria abierta
      </h2>
      {convocatorias.length === 0 ? (
        <p className="text-gray-600">
          No hay convocatorias abiertas en este momento.
        </p>
      ) : (
        <div className="space-y-4">
          {convocatorias.map((convocatoria) => (
            <Card
              key={convocatoria.id}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-sigeb-blue-dark">
                    {convocatoria.beca.nombre}
                  </h3>
                  <Badge estado={convocatoria.estado} />
                </div>
                <p className="mt-1 text-sm text-gray-600">{convocatoria.nombre}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Cierre: {formatearFecha(convocatoria.fechaCierre)}
                </p>
              </div>
              <Button onClick={() => onSeleccionar(convocatoria.id)}>
                Postularme
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PasoPerfilAcademico({
  solicitudId,
  onGuardado,
  onError,
}: {
  solicitudId: string;
  onGuardado: () => void;
  onError: (msg: string) => void;
}) {
  const [enviando, setEnviando] = useState(false);
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

  const departamento = departamentos.find(
    (d) => d.id === form.departamentoId,
  );
  const municipios = departamento?.municipios ?? [];

  const guardar = async () => {
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

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-sigeb-blue-dark">
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

function PasoPerfilFinanciero({
  solicitudId,
  onGuardado,
  onError,
}: {
  solicitudId: string;
  onGuardado: () => void;
  onError: (msg: string) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    ingresoFamiliar: '',
    numeroDependientes: '',
    becasAnteriores: false,
    descripcionSituacion: '',
  });

  const guardar = async () => {
    setEnviando(true);
    try {
      const body = {
        ingresoFamiliar:
          form.ingresoFamiliar === ''
            ? undefined
            : Number(form.ingresoFamiliar),
        numeroDependientes:
          form.numeroDependientes === ''
            ? undefined
            : Number(form.numeroDependientes),
        becasAnteriores: form.becasAnteriores,
        descripcionSituacion: form.descripcionSituacion || undefined,
      };
      await fetchConToken(`/solicitudes/${solicitudId}/perfil-financiero`, {
        method: 'PUT',
        body,
      });
      onGuardado();
    } catch (e) {
      onError(
        e instanceof Error ? e.message : 'No se pudo guardar el perfil financiero',
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h2 className="mb-5 text-xl font-bold text-sigeb-blue-dark">
        Perfil financiero
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Ingreso familiar mensual (Q)"
          type="number"
          min={0}
          value={form.ingresoFamiliar}
          onChange={(e) =>
            setForm((f) => ({ ...f, ingresoFamiliar: e.target.value }))
          }
        />
        <Input
          label="Número de dependientes"
          type="number"
          min={0}
          value={form.numeroDependientes}
          onChange={(e) =>
            setForm((f) => ({ ...f, numeroDependientes: e.target.value }))
          }
        />
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.becasAnteriores}
          onChange={(e) =>
            setForm((f) => ({ ...f, becasAnteriores: e.target.checked }))
          }
        />
        He recibido becas anteriormente
      </label>
      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium text-sigeb-blue-dark">
          Describe tu situación socioeconómica
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-sigeb-blue focus:outline-none focus:ring-2 focus:ring-sigeb-blue/20"
          rows={4}
          value={form.descripcionSituacion}
          onChange={(e) =>
            setForm((f) => ({ ...f, descripcionSituacion: e.target.value }))
          }
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

function PasoDocumentos({
  solicitudId,
  onCompletado,
  onError,
}: {
  solicitudId: string;
  onCompletado: () => void;
  onError: (msg: string) => void;
}) {
  const [checklist, setChecklist] = useState<SolicitudChecklist | null>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);

  const cargar = async () => {
    try {
      const data = await fetchConToken<SolicitudChecklist>(
        `/solicitudes/${solicitudId}/checklist`,
      );
      setChecklist(data);
    } catch (e) {
      onError(
        e instanceof Error ? e.message : 'No se pudo cargar el checklist',
      );
    }
  };

  useEffect(() => {
    cargar();
  }, [solicitudId]);

  const subir = async (tipoId: string, file: File) => {
    setSubiendo(tipoId);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await fetchConToken(`/solicitudes/${solicitudId}/documentos/${tipoId}`, {
        method: 'POST',
        body: fd,
        isFormData: true,
      });
      await cargar();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo subir el documento');
    } finally {
      setSubiendo(null);
    }
  };

  const quitar = async (tipoId: string) => {
    setSubiendo(tipoId);
    try {
      await fetchConToken(`/solicitudes/${solicitudId}/documentos/${tipoId}`, {
        method: 'DELETE',
      });
      await cargar();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo eliminar el documento');
    } finally {
      setSubiendo(null);
    }
  };

  if (!checklist) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-sigeb-blue-dark">
        Documentos requeridos
      </h2>
      <p className="mb-5 text-sm text-gray-600">
        Sube cada documento requerido (PDF, JPG o PNG, máx. 5 MB).
      </p>
      <div className="space-y-3">
        {checklist.documentos.map((doc) => (
          <Card key={doc.documentoTipoId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-sigeb-blue-dark">{doc.nombre}</p>
              <p className="text-xs text-gray-500">
                {doc.obligatorio ? 'Obligatorio' : 'Opcional'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {doc.cargado ? (
                <>
                  <span className="text-sm font-semibold text-green-700">
                    ✓ Cargado
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => quitar(doc.documentoTipoId)}
                    disabled={subiendo === doc.documentoTipoId}
                  >
                    {subiendo === doc.documentoTipoId ? '...' : 'Quitar'}
                  </Button>
                </>
              ) : (
                <label className="cursor-pointer rounded-lg border-2 border-sigeb-blue px-4 py-2 text-sm font-semibold text-sigeb-blue transition-colors hover:bg-sigeb-blue hover:text-white">
                  {subiendo === doc.documentoTipoId ? 'Subiendo...' : 'Subir archivo'}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={subiendo === doc.documentoTipoId}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) subir(doc.documentoTipoId, file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-6">
        <Button onClick={onCompletado}>Continuar</Button>
      </div>
    </div>
  );
}

function PasoEnviar({
  solicitudId,
  onEnviado,
  onError,
}: {
  solicitudId: string;
  onEnviado: () => void;
  onError: (msg: string) => void;
}) {
  const [checklist, setChecklist] = useState<SolicitudChecklist | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetchConToken<SolicitudChecklist>(`/solicitudes/${solicitudId}/checklist`)
      .then(setChecklist)
      .catch((e) =>
        onError(
          e instanceof Error ? e.message : 'No se pudo cargar el resumen',
        ),
      );
  }, [solicitudId]);

  const enviar = async () => {
    setEnviando(true);
    try {
      await fetchConToken(`/solicitudes/${solicitudId}/transicion`, {
        method: 'POST',
        body: { accion: 'enviar', comentario: 'Solicitud enviada por el postulante' },
      });
      onEnviado();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud');
    } finally {
      setEnviando(false);
    }
  };

  if (!checklist) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-sigeb-blue-dark">
        Revisa y envía
      </h2>
      <Card className="mb-6">
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex justify-between">
            <span>Perfil académico</span>
            <span className={checklist.perfilAcademico ? 'font-semibold text-green-700' : 'font-semibold text-red-600'}>
              {checklist.perfilAcademico ? 'Completo' : 'Incompleto'}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Perfil financiero</span>
            <span className={checklist.perfilFinanciero ? 'font-semibold text-green-700' : 'font-semibold text-red-600'}>
              {checklist.perfilFinanciero ? 'Completo' : 'Incompleto'}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Documentos obligatorios</span>
            <span className={checklist.completo ? 'font-semibold text-green-700' : 'font-semibold text-red-600'}>
              {checklist.completo ? 'Completos' : 'Faltan documentos'}
            </span>
          </li>
        </ul>
      </Card>

      {checklist.pendientes.length > 0 && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Falta completar: {checklist.pendientes.join(', ')}
        </p>
      )}

      <Button onClick={enviar} disabled={enviando || !checklist.completo}>
        {enviando ? <Spinner /> : 'Enviar solicitud'}
      </Button>
    </div>
  );
}
