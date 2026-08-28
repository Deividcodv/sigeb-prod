import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';

const postulante: AuthenticatedUser = {
  id: 'u-postulante',
  cui: '9999999999999',
  nombres: 'Postulante Demo',
  email: 'postulante@demo.gt',
  rol: { id: 'r-postulante', nombre: 'POSTULANTE', descripcion: null },
};

describe('SolicitudesService', () => {
  let prisma: any;
  let service: SolicitudesService;

  beforeEach(() => {
    prisma = {
      solicitud: { findUnique: jest.fn() },
      solicitudPerfilAcademico: { upsert: jest.fn() },
      genero: { findUnique: jest.fn() },
    };
    service = new SolicitudesService(prisma);
  });

  describe('guardarPerfilAcademico (US-13: opcion otro)', () => {
    it('guarda el valor libre "otro" y limpia el id del catalogo', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        usuarioId: 'u-postulante',
        estado: 'BORRADOR',
      });
      prisma.solicitudPerfilAcademico.upsert.mockResolvedValue({
        solicitudId: 's1',
        generoOtro: 'Otro valor libre',
        generoId: null,
      });

      const result = await service.guardarPerfilAcademico(
        's1',
        { generoOtro: 'Otro valor libre' },
        postulante,
      );

      expect(prisma.solicitudPerfilAcademico.upsert).toHaveBeenCalledWith({
        where: { solicitudId: 's1' },
        update: { generoOtro: 'Otro valor libre', generoId: null },
        create: { solicitudId: 's1', generoOtro: 'Otro valor libre', generoId: null },
      });
      expect(result.generoOtro).toBe('Otro valor libre');
      expect(result.generoId).toBeNull();
    });

    it('rechaza enviar id y "otro" al mismo tiempo', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        usuarioId: 'u-postulante',
        estado: 'BORRADOR',
      });

      await expect(
        service.guardarPerfilAcademico(
          's1',
          { generoId: 'g1', generoOtro: 'Libre' },
          postulante,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza un id de catalogo inexistente', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        usuarioId: 'u-postulante',
        estado: 'BORRADOR',
      });
      prisma.genero.findUnique.mockResolvedValue(null);

      await expect(
        service.guardarPerfilAcademico('s1', { generoId: 'nope' }, postulante),
      ).rejects.toThrow('Catálogo inexistente para generoId');
    });

    it('no valida como catalogo los campos de texto libre', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        usuarioId: 'u-postulante',
        estado: 'BORRADOR',
      });
      prisma.solicitudPerfilAcademico.upsert.mockResolvedValue({ solicitudId: 's1' });

      await expect(
        service.guardarPerfilAcademico(
          's1',
          { institucion: 'USAC', carrera: 'Ingeniería', generoOtro: 'Libre' },
          postulante,
        ),
      ).resolves.toBeDefined();
      expect(prisma.genero.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('control de acceso y edicion', () => {
    it('bloquea edicion de una solicitud ajena', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        usuarioId: 'otro-usuario',
        estado: 'BORRADOR',
      });

      await expect(
        service.guardarPerfilAcademico('s1', {}, postulante),
      ).rejects.toThrow(ForbiddenException);
    });

    it('bloquea edicion fuera del estado BORRADOR', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        usuarioId: 'u-postulante',
        estado: 'ENVIADA',
      });

      await expect(
        service.guardarPerfilAcademico('s1', {}, postulante),
      ).rejects.toThrow('Solo se puede editar la solicitud en estado BORRADOR');
    });
  });
});