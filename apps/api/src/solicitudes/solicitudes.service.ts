import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/interfaces/authenticated-user.interface';
import { CreateSolicitudDto, TransicionSolicitudDto } from './dto';
import {
  SolicitudStateMachine,
  SolicitudEstado,
} from './solicitud-state-machine';

@Injectable()
export class SolicitudesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(usuarioId: string, dto: CreateSolicitudDto) {
    const convocatoria = await this.prisma.convocatoria.findUnique({
      where: { id: dto.convocatoriaId },
    });

    if (!convocatoria) {
      throw new NotFoundException(
        `Convocatoria con id ${dto.convocatoriaId} no encontrada`,
      );
    }

    if (convocatoria.estado !== 'ABIERTA') {
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

    const solicitud = await this.prisma.solicitud.create({
      data: {
        convocatoriaId: dto.convocatoriaId,
        usuarioId,
        estado: 'BORRADOR',
      },
      include: { convocatoria: { include: { beca: true } } },
    });

    await this.prisma.historialEstado.create({
      data: {
        solicitudId: solicitud.id,
        estado: 'BORRADOR',
        comentario: 'Solicitud creada',
        usuarioId,
      },
    });

    return solicitud;
  }

  async findAll(usuario: AuthenticatedUser) {
    const where = this.esAdmin(usuario) ? {} : { usuarioId: usuario.id };

    return this.prisma.solicitud.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        convocatoria: { include: { beca: true } },
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

    this.assertAcceso(solicitud, usuario);
    return solicitud;
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
    } else if (!this.esAdmin(usuario)) {
      throw new ForbiddenException(
        'No tienes permisos para esta transición',
      );
    }

    const siguienteEstado = SolicitudStateMachine.next(
      solicitud.estado as SolicitudEstado,
      dto.accion,
    );

    const actualizada = await this.prisma.solicitud.update({
      where: { id },
      data: {
        estado: siguienteEstado,
        ...(siguienteEstado === 'BORRADOR'
          ? { correccionesCount: { increment: 1 } }
          : {}),
      },
    });

    await this.prisma.historialEstado.create({
      data: {
        solicitudId: id,
        estado: siguienteEstado,
        comentario: dto.comentario ?? null,
        usuarioId: usuario.id,
      },
    });

    return actualizada;
  }

  private esAdmin(usuario: AuthenticatedUser): boolean {
    return usuario.rol?.nombre === 'ADMIN';
  }

  private assertAcceso(
    solicitud: { usuarioId: string },
    usuario: AuthenticatedUser,
  ) {
    if (!this.esAdmin(usuario) && solicitud.usuarioId !== usuario.id) {
      throw new ForbiddenException('No tienes acceso a esta solicitud');
    }
  }
}