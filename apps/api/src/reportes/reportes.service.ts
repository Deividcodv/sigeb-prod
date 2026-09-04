import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { aCsv } from './csv.util';
import {
  CONVOCATORIA_ESTADO,
  SOLICITUD_ESTADO,
  DECISION_RESULTADO,
} from '../common/constants/estados';

export type TipoReporte =
  | 'solicitudes-por-estado'
  | 'convocatorias'
  | 'evaluaciones';

const TIPOS_VALIDOS: TipoReporte[] = [
  'solicitudes-por-estado',
  'convocatorias',
  'evaluaciones',
];

@Injectable()
export class ReportesService {
  constructor(private readonly prisma: PrismaService) {}

  async solicitudesPorEstado(convocatoriaId?: string) {
    const where = convocatoriaId ? { convocatoriaId } : {};

    const porEstado = await this.prisma.solicitud.groupBy({
      by: ['estado'],
      where,
      _count: { _all: true },
    });

    const detalle = await this.prisma.solicitud.groupBy({
      by: ['convocatoriaId', 'estado'],
      where,
      _count: { _all: true },
    });

    const convocatorias = await this.prisma.convocatoria.findMany({
      where: convocatoriaId ? { id: convocatoriaId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        beca: { select: { nombre: true } },
        _count: { select: { solicitudes: true } },
      },
    });

    return {
      total: porEstado.reduce((acc, f) => acc + f._count._all, 0),
      porEstado: porEstado
        .map((f) => ({ estado: f.estado, cantidad: f._count._all }))
        .sort((a, b) => b.cantidad - a.cantidad),
      porConvocatoria: convocatorias.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        beca: c.beca.nombre,
        total: c._count.solicitudes,
        porEstado: detalle
          .filter((f) => f.convocatoriaId === c.id)
          .map((f) => ({ estado: f.estado, cantidad: f._count._all })),
      })),
    };
  }

  async convocatorias() {
    const porEstado = await this.prisma.convocatoria.groupBy({
      by: ['estado'],
      _count: { _all: true },
    });

    const convocatorias = await this.prisma.convocatoria.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        beca: { select: { nombre: true } },
        _count: { select: { solicitudes: true } },
      },
    });

    const total = convocatorias.length;
    const activas = convocatorias.filter((c) => c.estado === CONVOCATORIA_ESTADO.ABIERTA).length;

    return {
      total,
      activas,
      resueltas: convocatorias.filter((c) => c.estado === CONVOCATORIA_ESTADO.RESUELTA).length,
      porEstado: porEstado.map((f) => ({
        estado: f.estado,
        cantidad: f._count._all,
      })),
      detalle: convocatorias.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        beca: c.beca.nombre,
        estado: c.estado,
        solicitudes: c._count.solicitudes,
        creadaEl: c.createdAt,
      })),
    };
  }

  async evaluaciones() {
    const convocatorias = await this.prisma.convocatoria.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        beca: { select: { nombre: true } },
      },
    });

    const convocatoriaIds = convocatorias.map((c) => c.id);

    const solicitadesPorConvocatoria = await this.prisma.solicitud.groupBy({
      by: ['convocatoriaId', 'estado'],
      where: { convocatoriaId: { in: convocatoriaIds } },
      _count: { _all: true },
    });

    const solicitudesEvaluadas =
      await this.prisma.solicitud.findMany({
        where: {
          convocatoriaId: { in: convocatoriaIds },
          estado: SOLICITUD_ESTADO.EVALUADA,
        },
        select: { id: true, convocatoriaId: true },
      });

    const solicitudIds = solicitudesEvaluadas.map((s) => s.id);

    const evaluaciones = solicitudIds.length
      ? await this.prisma.evaluacion.findMany({
          where: { solicitudId: { in: solicitudIds } },
          select: {
            solicitudId: true,
            evaluadorId: true,
            completada: true,
            puntaje: true,
            criterioEvaluacion: {
              select: { peso: true },
            },
          },
        })
      : [];

    const decisiones = convocatoriaIds.length
      ? await this.prisma.decision.findMany({
          where: { solicitud: { convocatoriaId: { in: convocatoriaIds } } },
          select: {
            resultado: true,
            solicitud: { select: { convocatoriaId: true } },
          },
        })
      : [];

    const porConvocatoria = convocatorias.map((c) => {
      const solicitudes = solicitudesEvaluadas.filter(
        (s) => s.convocatoriaId === c.id,
      );
      const solicitudIdSet = new Set(solicitudes.map((s) => s.id));

      const scores: number[] = [];
      let conScore = 0;
      let pendientes = 0;

      // Agrupar puntajes por solicitud
      const porSolicitud = new Map<string, number[]>();
      const completadosPorSolicitud = new Map<string, number>();
      const totalPorSolicitud = new Map<string, number>();
      for (const ev of evaluaciones) {
        if (!solicitudIdSet.has(ev.solicitudId)) continue;
        const total = (totalPorSolicitud.get(ev.solicitudId) ?? 0) + 1;
        totalPorSolicitud.set(ev.solicitudId, total);
        if (ev.completada) {
          const peso = ev.criterioEvaluacion?.peso ?? 0;
          const normalizado = (ev.puntaje ?? 0) * (peso > 0 ? 1 : 0);
          const arr = porSolicitud.get(ev.solicitudId) ?? [];
          arr.push(normalizado);
          porSolicitud.set(ev.solicitudId, arr);
          completadosPorSolicitud.set(
            ev.solicitudId,
            (completadosPorSolicitud.get(ev.solicitudId) ?? 0) + 1,
          );
        }
      }

      for (const s of solicitudes) {
        const completados = completadosPorSolicitud.get(s.id) ?? 0;
        const total = totalPorSolicitud.get(s.id) ?? 0;
        const completo = completados === total && total > 0;
        const arr = porSolicitud.get(s.id) ?? [];
        const score =
          completo && arr.length > 0
            ? arr.reduce((a, b) => a + b, 0) / arr.length
            : null;

        if (score !== null) {
          scores.push(score);
          conScore += 1;
        } else {
          pendientes += 1;
        }
      }

      const enRevision =
        solicitadesPorConvocatoria.find(
          (g) =>
            g.convocatoriaId === c.id &&
            g.estado === SOLICITUD_ESTADO.EN_REVISION,
        )?._count._all ?? 0;

      const scorePromedio =
        scores.length > 0
          ? Math.round(
              (scores.reduce((a, b) => a + b, 0) / scores.length) * 100,
            ) / 100
          : null;

      return {
        id: c.id,
        nombre: c.nombre,
        beca: c.beca.nombre,
        solicitudesEvaluadas: solicitudes.length,
        conScore,
        scorePromedio,
        aprobadas: decisiones.filter(
          (d) =>
            d.solicitud.convocatoriaId === c.id &&
            d.resultado === DECISION_RESULTADO.APROBADA,
        ).length,
        rechazadas: decisiones.filter(
          (d) =>
            d.solicitud.convocatoriaId === c.id &&
            d.resultado === DECISION_RESULTADO.RECHAZADA,
        ).length,
        pendientes: pendientes + enRevision,
      };
    });

    return {
      totalConvocatorias: convocatorias.length,
      totalSolicitudesEvaluadas: porConvocatoria.reduce(
        (acc, r) => acc + r.solicitudesEvaluadas,
        0,
      ),
      porConvocatoria,
    };
  }

  async misEvaluaciones(evaluadorId: string) {
    const evaluaciones = await this.prisma.evaluacion.findMany({
      where: { evaluadorId },
      select: {
        id: true,
        solicitudId: true,
        completada: true,
        puntaje: true,
        solicitud: {
          select: {
            id: true,
            estado: true,
            convocatoria: {
              select: { nombre: true, beca: { select: { nombre: true } } },
            },
            usuario: { select: { nombres: true, cui: true } },
          },
        },
        criterioEvaluacion: { select: { nombre: true, peso: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = evaluaciones.length;
    const completadas = evaluaciones.filter((e) => e.completada).length;
    const pendientes = total - completadas;
    const scores = evaluaciones
      .filter((e) => e.completada && e.puntaje != null)
      .map((e) => e.puntaje!);
    const scorePromedio =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
        : null;

    return {
      total,
      completadas,
      pendientes,
      scorePromedio,
      detalle: evaluaciones.map((e) => ({
        solicitudId: e.solicitudId,
        solicitudEstado: e.solicitud.estado,
        beca: e.solicitud.convocatoria.beca.nombre,
        convocatoria: e.solicitud.convocatoria.nombre,
        postulante: e.solicitud.usuario.nombres,
        criterio: e.criterioEvaluacion.nombre,
        peso: e.criterioEvaluacion.peso,
        completada: e.completada,
        puntaje: e.puntaje,
      })),
    };
  }

  async misComites(usuarioId: string) {
    const comites = await this.prisma.comite.findMany({
      where: {
        miembros: { some: { usuarioId, activo: true } },
      },
      include: {
        miembros: {
          where: { activo: true },
          select: { id: true, rol: true },
        },
        sesiones: {
          select: {
            id: true,
            estado: true,
            fecha: true,
            _count: { select: { votos: true, agenda: true } },
          },
          orderBy: { fecha: 'desc' },
        },
      },
    });

    const totalSesiones = comites.reduce((acc, c) => acc + c.sesiones.length, 0);
    const sesionesResueltas = comites.reduce(
      (acc, c) => acc + c.sesiones.filter((s) => s.estado === 'FINALIZADA').length,
      0,
    );

    return {
      totalComites: comites.length,
      totalSesiones,
      sesionesResueltas,
      detalle: comites.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        miembros: c.miembros.length,
        sesiones: c.sesiones.length,
        resueltas: c.sesiones.filter((s) => s.estado === 'FINALIZADA').length,
      })),
    };
  }

  async misSesiones(usuarioId: string) {
    const sesiones = await this.prisma.sesion.findMany({
      where: {
        comite: { miembros: { some: { usuarioId, activo: true } } },
      },
      include: {
        comite: { select: { nombre: true } },
        votos: {
          where: { usuarioId },
          select: { id: true, voto: true, solicitudId: true },
        },
        agenda: { select: { solicitudId: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const totalVotos = sesiones.reduce((acc, s) => acc + s.votos.length, 0);
    const sesionesConVoto = sesiones.filter((s) => s.votos.length > 0).length;

    return {
      totalSesiones: sesiones.length,
      sesionesConVoto,
      totalVotos,
      detalle: sesiones.map((s) => ({
        id: s.id,
        comite: s.comite.nombre,
        fecha: s.fecha,
        estado: s.estado,
        agenda: s.agenda.length,
        votosEmitidos: s.votos.length,
      })),
    };
  }

  async reporteGeneral() {
    const [solicitudes, convocatorias, evaluaciones] = await Promise.all([
      this.prisma.solicitud.groupBy({
        by: ['estado'],
        _count: { _all: true },
      }),
      this.prisma.convocatoria.groupBy({
        by: ['estado'],
        _count: { _all: true },
      }),
      this.prisma.evaluacion.aggregate({
        _count: { completada: true },
        _avg: { puntaje: true },
      }),
    ]);

    return {
      solicitudes: {
        total: solicitudes.reduce((a, f) => a + f._count._all, 0),
        porEstado: solicitudes.map((f) => ({ estado: f.estado, cantidad: f._count._all })),
      },
      convocatorias: {
        total: convocatorias.reduce((a, f) => a + f._count._all, 0),
        porEstado: convocatorias.map((f) => ({ estado: f.estado, cantidad: f._count._all })),
      },
      evaluaciones: {
        completadas: evaluaciones._count.completada ?? 0,
        scorePromedio: evaluaciones._avg.puntaje
          ? Math.round(evaluaciones._avg.puntaje * 100) / 100
          : null,
      },
    };
  }

  async tendencia(meses = 12) {
    const n = Math.max(1, Math.min(meses, 24));
    const ahora = new Date();
    const lista = Array.from({ length: n }, (_, i) => {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - (n - 1 - i), 1);
      return {
        clave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        desde: d,
        hasta: new Date(d.getFullYear(), d.getMonth() + 1, 1),
      };
    });

    const [solicitudes, evaluacionesCompletadas] = await Promise.all([
      this.prisma.solicitud.findMany({
        where: { createdAt: { gte: lista[0].desde } },
        select: { createdAt: true },
      }),
      this.prisma.evaluacion.findMany({
        where: { completada: true, createdAt: { gte: lista[0].desde } },
        select: { createdAt: true },
      }),
    ]);

    const contarPorMes = (registros: { createdAt: Date }[]) => {
      const frec = new Map<string, number>();
      for (const r of registros) {
        const clave = `${r.createdAt.getFullYear()}-${String(
          r.createdAt.getMonth() + 1,
        ).padStart(2, '0')}`;
        frec.set(clave, (frec.get(clave) ?? 0) + 1);
      }
      return frec;
    };

    const frecSolicitudes = contarPorMes(solicitudes);
    const frecEvaluaciones = contarPorMes(evaluacionesCompletadas);

    return {
      meses: lista.map((l) => l.clave),
      solicitudes: lista.map((l) => frecSolicitudes.get(l.clave) ?? 0),
      evaluaciones: lista.map((l) => frecEvaluaciones.get(l.clave) ?? 0),
    };
  }

  async generarCsv(tipo: TipoReporte): Promise<string> {
    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new BadRequestException(
        `Tipo de reporte inválido. Válidos: ${TIPOS_VALIDOS.join(', ')}`,
      );
    }

    if (tipo === 'solicitudes-por-estado') {
      const data = await this.solicitudesPorEstado();
      const filas: Record<string, unknown>[] = data.porConvocatoria.flatMap((c) =>
        c.porEstado.map((e) => ({
          convocatoria: c.nombre,
          beca: c.beca,
          estado: e.estado,
          cantidad: e.cantidad,
        })),
      );
      if (filas.length === 0) {
        filas.push({
          convocatoria: '(total)',
          beca: '',
          estado: 'TODOS',
          cantidad: data.total,
        });
      }
      return aCsv(filas);
    }

    if (tipo === 'convocatorias') {
      const data = await this.convocatorias();
      return aCsv(
        data.detalle.map((c) => ({
          convocatoria: c.nombre,
          beca: c.beca,
          estado: c.estado,
          solicitudes: c.solicitudes,
          creadaEl: c.creadaEl?.toISOString() ?? '',
        })),
      );
    }

    const data = await this.evaluaciones();
    return aCsv(
      data.porConvocatoria.map((c) => ({
        convocatoria: c.nombre,
        beca: c.beca,
        solicitudesEvaluadas: c.solicitudesEvaluadas,
        conScore: c.conScore,
        scorePromedio: c.scorePromedio ?? '',
        aprobadas: c.aprobadas,
        rechazadas: c.rechazadas,
        pendientes: c.pendientes,
      })),
    );
  }
}