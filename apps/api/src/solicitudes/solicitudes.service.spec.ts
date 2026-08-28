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
  let storage: any;
  let service: SolicitudesService;

  beforeEach(() => {
    prisma = {
      solicitud: { findUnique: jest.fn() },
      convocatoria: { findUnique: jest.fn() },
      documentoTipo: { findUnique: jest.fn() },
      solicitudDocumento: { findFirst: jest.fn(), create: jest.fn(), delete: jest.fn() },
      solicitudPerfilAcademico: { upsert: jest.fn() },
      genero: { findUnique: jest.fn() },
    };
    storage = {
      save: jest.fn(),
      delete: jest.fn(),
      read: jest.fn(),
      exists: jest.fn(),
    };
    service = new SolicitudesService(prisma, storage);
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

  describe('subirDocumento (US-21/22)', () => {
    const file: Express.Multer.File = {
      buffer: Buffer.from('pdf'),
      originalname: 'certificado.pdf',
      mimetype: 'application/pdf',
      size: 3,
    } as Express.Multer.File;

    it('guarda el archivo, valida que aplique a la convocatoria e incrementa version', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        usuarioId: 'u-postulante',
        estado: 'BORRADOR',
        convocatoriaId: 'c1',
      });
      prisma.documentoTipo.findUnique.mockResolvedValue({ id: 't1', nombre: 'Certificado' });
      prisma.convocatoria.findUnique.mockResolvedValue({
        id: 'c1',
        documentosRequeridos: [{ documentoTipoId: 't1' }],
      });
      prisma.solicitudDocumento.findFirst.mockResolvedValue({
        id: 'd0',
        archivoUrl: '/storage/solicitudes/s1/0.pdf',
        version: 1,
      });
      storage.save.mockResolvedValue({
        url: '/storage/solicitudes/s1/new.pdf',
        key: 'solicitudes/s1/new.pdf',
        size: 3,
      });
      prisma.solicitudDocumento.create.mockResolvedValue({
        id: 'd1',
        version: 2,
        doc: true,
      });

      const result = await service.subirDocumento('s1', 't1', file, postulante);

      expect(storage.save).toHaveBeenCalledWith(
        file.buffer,
        expect.objectContaining({ folder: 'solicitudes/s1' }),
      );
      expect(storage.delete).toHaveBeenCalledWith('solicitudes/s1/0.pdf');
      expect(prisma.solicitudDocumento.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: 2, estado: 'CARGADO' }),
        }),
      );
      expect(result.version).toBe(2);
    });

    it('rechaza tipo de documento que no aplica a la convocatoria', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        usuarioId: 'u-postulante',
        estado: 'BORRADOR',
        convocatoriaId: 'c1',
      });
      prisma.documentoTipo.findUnique.mockResolvedValue({ id: 't9' });
      prisma.convocatoria.findUnique.mockResolvedValue({
        id: 'c1',
        documentosRequeridos: [{ documentoTipoId: 't1' }],
      });

      await expect(
        service.subirDocumento('s1', 't9', file, postulante),
      ).rejects.toThrow('El tipo de documento no aplica a esta convocatoria');
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('elimina fila y archivo', async () => {
      prisma.solicitud.findUnique.mockResolvedValue({
        id: 's1',
        usuarioId: 'u-postulante',
        estado: 'BORRADOR',
      });
      prisma.solicitudDocumento.findFirst.mockResolvedValue({
        id: 'd1',
        archivoUrl: '/storage/solicitudes/s1/new.pdf',
        version: 2,
      });
      prisma.solicitudDocumento.delete.mockResolvedValue({ id: 'd1' });

      const result = await service.eliminarDocumento('s1', 't1', postulante);

      expect(prisma.solicitudDocumento.delete).toHaveBeenCalledWith({
        where: { id: 'd1' },
      });
      expect(storage.delete).toHaveBeenCalledWith('solicitudes/s1/new.pdf');
      expect(result).toEqual({ eliminado: true });
    });
  });
});