import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

const admin: AuthenticatedUser = {
  id: 'u-admin',
  cui: '1234567890123',
  nombres: 'Admin',
  email: 'admin@sigeb.gov.gt',
  rol: { id: 'r-admin', nombre: 'ADMIN', descripcion: null },
};

const evaluador: AuthenticatedUser = {
  id: 'u-evaluador',
  cui: '8888888888888',
  nombres: 'Evaluador',
  email: 'evaluador@demo.gt',
  rol: { id: 'r-evaluador', nombre: 'EVALUADOR', descripcion: null },
};

describe('EvaluacionesService', () => {
  let prisma: any;
  let service: EvaluacionesService;

  beforeEach(() => {
    prisma = {
      evaluacion: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      solicitud: { findUnique: jest.fn() },
      usuario: { findUnique: jest.fn() },
    };
    service = new EvaluacionesService(prisma);
  });

  describe('misEvaluaciones (US-26)', () => {
    it('agrupa por solicitud y cuenta criterios completados', async () => {
      prisma.evaluacion.findMany.mockResolvedValue([
        {
          id: 'ev1',
          solicitudId: 's1',
          puntaje: 85,
          observaciones: null,
          completada: true,
          solicitud: {
            id: 's1',
            estado: 'EN_REVISION',
            convocatoria: { beca: { nombre: 'Beca 2' } },
            usuario: { nombres: 'Postulante', cui: '9999999999999', email: 'p@demo.gt' },
          },
          criterioEvaluacion: { id: 'c1', nombre: 'Situación socioeconómica', peso: 0.4 },
        },
        {
          id: 'ev2',
          solicitudId: 's1',
          puntaje: null,
          observaciones: null,
          completada: false,
          solicitud: {
            id: 's1',
            estado: 'EN_REVISION',
            convocatoria: { beca: { nombre: 'Beca 2' } },
            usuario: { nombres: 'Postulante', cui: '9999999999999', email: 'p@demo.gt' },
          },
          criterioEvaluacion: { id: 'c2', nombre: 'Trayectoria académica', peso: 0.6 },
        },
      ]);

      const result = await service.misEvaluaciones(evaluador);

      expect(result).toHaveLength(1);
      expect(result[0].solicitudId).toBe('s1');
      expect(result[0].totalCriterios).toBe(2);
      expect(result[0].completados).toBe(1);
      expect(prisma.evaluacion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { evaluadorId: 'u-evaluador' },
        }),
      );
    });

    it('devuelve lista vacía sin evaluaciones asignadas', async () => {
      prisma.evaluacion.findMany.mockResolvedValue([]);
      await expect(service.misEvaluaciones(evaluador)).resolves.toEqual([]);
    });
  });

  describe('asignarEvaluadores (US-27)', () => {
    const solicitudEnRevision = {
      id: 's1',
      estado: 'EN_REVISION',
      convocatoria: {
        beca: {
          criteriosEvaluacion: [
            { id: 'c1', nombre: 'Situación socioeconómica', peso: 0.4, activo: true },
            { id: 'c2', nombre: 'Trayectoria académica', peso: 0.6, activo: true },
          ],
        },
      },
    };

    it('rechaza a un usuario que no es admin', async () => {
      await expect(
        service.asignarEvaluadores('s1', { evaluadorIds: ['u-evaluador'] }, evaluador),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rechaza solicitud inexistente', async () => {
      prisma.solicitud.findUnique.mockResolvedValue(null);
      await expect(
        service.asignarEvaluadores('s1', { evaluadorIds: ['u-evaluador'] }, admin),
      ).rejects.toThrow(NotFoundException);
    });

    it('rechaza solicitud que no está en EN_REVISION', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        estado: 'BORRADOR',
        convocatoria: { beca: { criteriosEvaluacion: [] } },
      });
      await expect(
        service.asignarEvaluadores('s1', { evaluadorIds: ['u-evaluador'] }, admin),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza si la beca no tiene criterios activos', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        estado: 'EN_REVISION',
        convocatoria: { beca: { criteriosEvaluacion: [] } },
      });
      await expect(
        service.asignarEvaluadores('s1', { evaluadorIds: ['u-evaluador'] }, admin),
      ).rejects.toThrow('no tiene criterios de evaluación');
    });

    it('rechaza evaluador inexistente', async () => {
      prisma.solicitud.findUnique.mockResolvedValue(solicitudEnRevision);
      prisma.usuario.findUnique.mockResolvedValue(null);
      await expect(
        service.asignarEvaluadores('s1', { evaluadorIds: ['u-x'] }, admin),
      ).rejects.toThrow(NotFoundException);
    });

    it('rechaza evaluador con rol distinto a EVALUADOR', async () => {
      prisma.solicitud.findUnique.mockResolvedValue(solicitudEnRevision);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u-x',
        nombres: 'Postulante',
        rol: { nombre: 'POSTULANTE' },
      });
      await expect(
        service.asignarEvaluadores('s1', { evaluadorIds: ['u-x'] }, admin),
      ).rejects.toThrow('no tiene rol EVALUADOR');
    });

    it('crea filas Evaluacion placeholder por criterio y salta las existentes', async () => {
      prisma.solicitud.findUnique.mockResolvedValue(solicitudEnRevision);
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'u-evaluador',
        nombres: 'Evaluador Demo',
        rol: { nombre: 'EVALUADOR' },
      });
      prisma.evaluacion.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'ev2' });

      const result = await service.asignarEvaluadores(
        's1',
        { evaluadorIds: ['u-evaluador'] },
        admin,
      );

      expect(result).toEqual({ asignados: 1, criterios: 2 });
      expect(prisma.evaluacion.create).toHaveBeenCalledTimes(1);
      expect(prisma.evaluacion.create).toHaveBeenCalledWith({
        data: {
          solicitudId: 's1',
          criterioEvaluacionId: 'c1',
          evaluadorId: 'u-evaluador',
        },
      });
    });
  });

  describe('registrarPuntaje (US-28)', () => {
    it('rechaza solicitud inexistente', async () => {
      prisma.solicitud.findUnique.mockResolvedValue(null);
      await expect(
        service.registrarPuntaje('s1', 'c1', { puntaje: 85 }, evaluador),
      ).rejects.toThrow(NotFoundException);
    });

    it('rechaza si la solicitud no está en EN_REVISION', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({ id: 's1', estado: 'EVALUADA' });
      await expect(
        service.registrarPuntaje('s1', 'c1', { puntaje: 85 }, evaluador),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza a un evaluador sin criterio asignado', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({ id: 's1', estado: 'EN_REVISION' });
      prisma.evaluacion.findFirst.mockResolvedValue(null);
      await expect(
        service.registrarPuntaje('s1', 'c1', { puntaje: 85 }, evaluador),
      ).rejects.toThrow(ForbiddenException);
    });

    it('guarda puntaje, observaciones y marca completada', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({ id: 's1', estado: 'EN_REVISION' });
      prisma.evaluacion.findFirst.mockResolvedValue({ id: 'ev1' });
      prisma.evaluacion.update.mockResolvedValue({
        id: 'ev1',
        puntaje: 85,
        completada: true,
        criterioEvaluacion: { id: 'c1', nombre: 'Situación socioeconómica' },
      });

      const result = await service.registrarPuntaje(
        's1',
        'c1',
        { puntaje: 85, observaciones: 'Buen perfil' },
        evaluador,
      );

      expect(result.puntaje).toBe(85);
      expect(result.completada).toBe(true);
      expect(prisma.evaluacion.update).toHaveBeenCalledWith({
        where: { id: 'ev1' },
        data: { puntaje: 85, observaciones: 'Buen perfil', completada: true },
        include: { criterioEvaluacion: true },
      });
    });
  });
});