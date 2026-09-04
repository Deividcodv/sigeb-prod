import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { CreateSolicitudDto, TransicionSolicitudDto } from './dto';
import { PerfilAcademicoDto, PerfilFinancieroDto } from './dto';
import { SolicitudStateMachine, SolicitudEstado } from './solicitud-state-machine';
import { AuthzService } from '../common/services/authz.service';
import { SolicitudPerfilService } from './solicitud-perfil.service';
import { SolicitudDocumentoService } from './solicitud-documento.service';
import { SolicitudChecklistService } from './solicitud-checklist.service';
import {
  SOLICITUD_ESTADO,
  CONVOCATORIA_ESTADO,
} from '../common/constants/estados';

@Injectable()
export class SolicitudesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly authz: AuthzService,
    private readonly perfiles: SolicitudPerfilService,
    private readonly documentos: SolicitudDocumentoService,
    private readonly checklist: SolicitudChecklistService,
  ) {}

  async create(usuarioId: string, dto: CreateSolicitudDto) {
    const convocatoria = await this.prisma.convocatoria.findUnique({
      where: { id: dto.convocatoriaId },
    });

    if (!convocatoria) {
      throw new NotFoundException(
        `Convocatoria con id ${dto.convocatoriaId} no encontrada`,
      );
    }

    if (convocatoria.estado !== CONVOCATORIA_ESTADO.ABIERTA) {
      throw new BadRequestException(
        'La convocatoria no está abierta para postulaciones',
      );
    }

    const existente = await this.prisma.solicitud.findFirst({
      where: {
        usuarioId,
        convocatoriaId: dto.convocatoriaId,
      },
    });

    if (existente) {
      throw new BadRequestException(
        'Ya tienes una solicitud para esta convocatoria',
      );
    }

    const solicitud = await this.prisma.$transaction(async (tx) => {
      const creada = await tx.solicitud.create({
        data: {
          convocatoriaId: dto.convocatoriaId,
          usuarioId,
          estado: SOLICITUD_ESTADO.BORRADOR,
        },
        include: { convocatoria: { include: { beca: true } } },
      });

      await tx.historialEstado.create({
        data: {
          solicitudId: creada.id,
          estado: SOLICITUD_ESTADO.BORRADOR,
          comentario: 'Solicitud creada',
          usuarioId,
        },
      });

      return creada;
    });

    return solicitud;
  }

  async findAll(usuario: AuthenticatedUser) {
    const where = this.authz.esAdmin(usuario) ? {} : { usuarioId: usuario.id };

    return this.prisma.solicitud.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        convocatoria: {
          include: {
            beca: true,
            _count: { select: { documentosRequeridos: true } },
          },
        },
        _count: { select: { documentos: true } },
      },
    });
  }

  async findById(id: string, usuario: AuthenticatedUser) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id },
      include: {
        convocatoria: { include: { beca: true } },
        perfilAcademico: true,
        perfilFinanciero: true,
        documentos: { include: { documentoTipo: true } },
        historial: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con id ${id} no encontrada`);
    }

    this.authz.assertAcceso(solicitud, usuario);
    return solicitud;
  }

  async consultaPublica(codigo: string) {
    const solicitud = await this.prisma.solicitud.findUnique({
      where: { id: codigo },
      include: {
        convocatoria: { include: { beca: true } },
        historial: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!solicitud) {
      throw new NotFoundException(
        'No se encontró ninguna solicitud con ese código',
      );
    }

    const convocatoria = solicitud.convocatoria;
    return {
      codigo: solicitud.id,
      estado: solicitud.estado,
      beca: convocatoria?.beca?.nombre ?? null,
      convocatoria: convocatoria?.nombre ?? null,
      fechaCreacion: solicitud.createdAt,
      fechaActualizacion: solicitud.updatedAt,
      historial: solicitud.historial.map((h) => ({
        estado: h.estado,
        comentario: h.comentario,
        fecha: h.createdAt,
      })),
    };
  }

  async transicion(
    id: string,
    dto: TransicionSolicitudDto,
    usuario: AuthenticatedUser,
  ) {
    const solicitud = await this.prisma.solicitud.findUnique({ where: { id } });

    if (!solicitud) {
      throw new NotFoundException(`Solicitud con id ${id} no encontrada`);
    }

    const esAccionPostulante =
      dto.accion === 'enviar' || dto.accion === 'corregir';

    if (esAccionPostulante) {
      if (solicitud.usuarioId !== usuario.id) {
        throw new ForbiddenException('No tienes acceso a esta solicitud');
      }
    } else if (!this.authz.esAdmin(usuario)) {
      throw new ForbiddenException(
        'No tienes permisos para esta transición',
      );
    }

    if (dto.accion === 'enviar') {
      const checklist = await this.obtenerChecklist(id, usuario);
      if (!checklist.completo) {
        throw new BadRequestException(
          `La solicitud no está completa: ${checklist.pendientes.join('; ')}`,
        );
      }
    }

    const siguienteEstado = SolicitudStateMachine.next(
      solicitud.estado as SolicitudEstado,
      dto.accion,
    );

    const actualizada = await this.prisma.$transaction(async (tx) => {
      const upd = await tx.solicitud.update({
        where: { id },
        data: {
          estado: siguienteEstado,
          ...(siguienteEstado === SOLICITUD_ESTADO.BORRADOR
            ? { correccionesCount: { increment: 1 } }
            : {}),
        },
      });

      await tx.historialEstado.create({
        data: {
          solicitudId: id,
          estado: siguienteEstado,
          comentario: dto.comentario ?? null,
          usuarioId: usuario.id,
        },
      });

      await this.audit.log(
        {
          usuarioId: usuario.id,
          accion: 'transicion',
          entidad: 'solicitud',
          entidadId: id,
          detalle: { accion: dto.accion, estado: siguienteEstado },
        },
        tx,
      );

      return upd;
    });

    return actualizada;
  }

  async guardarPerfilAcademico(
    id: string,
    dto: PerfilAcademicoDto,
    usuario: AuthenticatedUser,
  ) {
    return this.perfiles.guardarAcademico(id, dto, usuario);
  }

  async guardarPerfilFinanciero(
    id: string,
    dto: PerfilFinancieroDto,
    usuario: AuthenticatedUser,
  ) {
    return this.perfiles.guardarFinanciero(id, dto, usuario);
  }

  async subirDocumento(
    id: string,
    tipoId: string,
    file: Express.Multer.File,
    usuario: AuthenticatedUser,
  ) {
    return this.documentos.subir(id, tipoId, file, usuario);
  }

  async eliminarDocumento(
    id: string,
    tipoId: string,
    usuario: AuthenticatedUser,
  ) {
    return this.documentos.eliminar(id, tipoId, usuario);
  }

  async marcarEstadoDocumento(
    id: string,
    tipoId: string,
    estado: 'RECHAZADO',
    usuario: AuthenticatedUser,
  ) {
    return this.documentos.marcarEstado(id, tipoId, estado, usuario);
  }

  async obtenerChecklist(id: string, usuario: AuthenticatedUser) {
    return this.checklist.obtener(id, usuario);
  }
}